import { NextResponse } from "next/server";
import { verifyOtpWithToken } from "@/lib/otpStore";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const otp = typeof body.otp === "string" ? body.otp.trim() : "";
    const verificationToken =
      typeof body.verificationToken === "string" ? body.verificationToken.trim() : "";

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, message: "Valid email is required" },
        { status: 400 }
      );
    }

    if (!/^\d{6}$/.test(otp)) {
      return NextResponse.json(
        { success: false, message: "Enter the 6-digit OTP" },
        { status: 400 }
      );
    }

    if (!verificationToken) {
      return NextResponse.json(
        { success: false, message: "Verification session expired. Request a new OTP." },
        { status: 400 }
      );
    }

    const isValid = verifyOtpWithToken(email, otp, verificationToken);

    if (!isValid) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired OTP" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    console.error("OTP verification error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to verify OTP" },
      { status: 500 }
    );
  }
}
