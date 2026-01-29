import { NextRequest, NextResponse } from "next/server";
import { verifyJwt } from "../utils/lib/authHelper";

const protectedPaths = [
  "/dashboard",
  "/news/approved",
  "/news/create",
  "/news/update",
  "/profile",
];

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("secure_token")?.value;

  if (!protectedPaths.includes(req.nextUrl.pathname)) {
    return NextResponse.next();
  }

  if (!token) {
    const redirectUrl = new URL("/api/auth/google", req.url);
    redirectUrl.searchParams.set("redirect", req.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  try {
    const payload = await verifyJwt(token);
    const response = NextResponse.next();
    return response;
  } catch (error) {
    console.error("Authentication error:", error);
    const redirectUrl = new URL("/api/auth/google", req.url);
    redirectUrl.searchParams.set("redirect", req.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }
}

export const config = {
  matcher: [
    "/dashboard",
    "/news/approved",
    "/news/create",
    "/news/update",
    "/profile",
  ],
};
