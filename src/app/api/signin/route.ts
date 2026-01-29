import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Login hanya tersedia lewat Google OAuth." },
    { status: 410 }
  );
}
