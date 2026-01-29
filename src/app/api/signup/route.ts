import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Registrasi hanya tersedia lewat Google OAuth." },
    { status: 410 }
  );
}
