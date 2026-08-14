import { NextResponse } from "next/server";
import { verifyOtp } from "../otp-store";

export async function POST(req) {
  try {
    const { phone, email, otp } = await req.json();

    if (!otp || (!phone && !email)) {
      return NextResponse.json(
        {
          success: false,
          message: "Phone/Email and OTP are required.",
        },
        { status: 400 }
      );
    }

    const type = phone ? "phone" : "email";
    const identifier = phone || email;

    const result = verifyOtp(type, identifier, otp);

    if (result.success) {
      return NextResponse.json(
        {
          success: true,
          message: result.message,
        },
        { status: 200 }
      );
    } else {
      const statusCode = result.message.includes("expired") || result.message.includes("Invalid") ? 400 : 404;
      return NextResponse.json(
        {
          success: false,
          message: result.message,
        },
        { status: statusCode }
      );
    }
  } catch (error) {
    console.error("OTP verification error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Error verifying OTP.",
      },
      { status: 500 }
    );
  }
}

