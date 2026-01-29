import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { connectToDB } from "../../../../../../utils/lib/mongoose";
import UserModel from "../../../../../../utils/model/User";

const sanitizeRedirect = (value: string | undefined) => {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/";
  }
  return value;
};

export async function GET(req: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const baseUrl = process.env.BASE_URL_WEB;
  const jwtSecret = process.env.JWT_SECRET;

  if (!clientId || !clientSecret || !baseUrl || !jwtSecret) {
    return NextResponse.json(
      { error: "Google OAuth is not configured." },
      { status: 500 }
    );
  }

  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  if (!code || !state) {
    return NextResponse.json(
      { error: "Missing OAuth code or state." },
      { status: 400 }
    );
  }

  const storedState = req.cookies.get("oauth_state")?.value;
  if (!storedState || storedState !== state) {
    return NextResponse.json(
      { error: "Invalid OAuth state." },
      { status: 400 }
    );
  }

  const redirectUri = `${baseUrl.replace(/\/$/, "")}/api/auth/google/callback`;

  // DEBUG: log presence of clientId and redirectUri (do not log client secret value)
  try {
    console.error(
      "[oauth:callback] clientId present:",
      !!clientId,
      "clientId_prefix:",
      clientId ? clientId.slice(0, 6) + "..." : undefined
    );
    console.error("[oauth:callback] redirectUri used:", redirectUri);
    console.error(
      "[oauth:callback] clientSecret present:",
      !!clientSecret,
      "clientSecret_len:",
      clientSecret ? clientSecret.length : 0,
      "clientSecret_trim_len:",
      clientSecret ? clientSecret.trim().length : 0
    );
  } catch (err) {
    console.error("[oauth:callback] debug logging failed", err);
  }

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  const tokenData = await tokenResponse.json();
  // DEBUG: log oauth callback params and token response for diagnostics
  try {
    console.error("[oauth:callback] code:", code, "state:", state);
    console.error("[oauth:callback] storedState:", storedState);
    console.error(
      "[oauth:callback] tokenResponse status:",
      tokenResponse.status
    );
    console.error(
      "[oauth:callback] tokenData:",
      tokenData && typeof tokenData === "object"
        ? {
            ...tokenData,
            access_token: tokenData.access_token ? "[REDACTED]" : undefined,
          }
        : tokenData
    );
  } catch (err) {
    console.error("[oauth:callback] debug logging failed", err);
  }

  if (!tokenResponse.ok) {
    return NextResponse.json(
      { error: tokenData.error_description || "Failed to fetch tokens." },
      { status: 400 }
    );
  }

  const userInfoResponse = await fetch(
    "https://www.googleapis.com/oauth2/v2/userinfo",
    {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    }
  );

  const userInfo = await userInfoResponse.json();
  // DEBUG: log userInfo response
  try {
    console.error(
      "[oauth:callback] userInfo status:",
      userInfoResponse.status,
      "userInfo:",
      userInfo && {
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture,
      }
    );
  } catch (err) {
    console.error("[oauth:callback] userInfo debug logging failed", err);
  }

  if (!userInfoResponse.ok || !userInfo.email) {
    return NextResponse.json(
      { error: "Failed to fetch Google user info." },
      { status: 400 }
    );
  }

  await connectToDB();

  let user = await UserModel.findOne({ email: userInfo.email });

  if (!user) {
    const randomPassword = randomUUID();
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    user = await UserModel.create({
      name: userInfo.name || "User",
      email: userInfo.email,
      password: hashedPassword,
      image: userInfo.picture || "user.png",
    });
  } else if (userInfo.picture && user.image === "user.png") {
    user.image = userInfo.picture;
    await user.save();
  }

  const secretKey = new TextEncoder().encode(jwtSecret);
  const token = await new SignJWT({
    id: user._id.toString(),
    role: user.role,
    name: user.name,
    image: user.image,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(secretKey);

  const returnTo = sanitizeRedirect(req.cookies.get("oauth_return_to")?.value);
  const response = NextResponse.redirect(new URL(returnTo, req.nextUrl.origin));

  response.cookies.set("secure_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 3600,
    path: "/",
    sameSite: "strict",
  });
  response.cookies.set("alert_message", "Login berhasil", {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60,
    path: "/",
    sameSite: "lax",
  });

  response.cookies.set("oauth_state", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
  });
  response.cookies.set("oauth_return_to", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
  });

  return response;
}
