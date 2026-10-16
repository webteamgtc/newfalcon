import { NextResponse } from "next/server";
import { verifyOtpWithToken } from "@/lib/otpStore";
import { EMAIL_PATTERN, getSeatCategory } from "@/lib/seatBooking/categories";
import {
  createEmailProofToken,
  getClientIp,
  getSeatCollection,
  rateLimit,
} from "@/lib/seatBooking/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const otp = typeof body.otp === "string" ? body.otp.trim() : "";
    const verificationToken =
      typeof body.verificationToken === "string" ? body.verificationToken.trim() : "";
    const category = getSeatCategory(typeof body.category === "string" ? body.category : "");

    if (!category || !EMAIL_PATTERN.test(email) || !/^\d{6}$/.test(otp) || !verificationToken) {
      return NextResponse.json({ success: false, code: "BAD_REQUEST" }, { status: 400 });
    }

    // Cap wrong guesses: 5 per email per 10 min, 30 per IP per 10 min.
    const perEmail = rateLimit(`seat-verify-email:${email}`, 5, 10 * 60_000);
    const perIp = rateLimit(`seat-verify-ip:${getClientIp(request)}`, 30, 10 * 60_000);
    if (!perEmail.ok || !perIp.ok) {
      return NextResponse.json({ success: false, code: "RATE_LIMITED" }, { status: 429 });
    }

    if (!verifyOtpWithToken(email, otp, verificationToken)) {
      return NextResponse.json({ success: false, code: "OTP_INVALID" }, { status: 400 });
    }

    // Only reveal "already registered" after the email has been proven.
    const collection = await getSeatCollection(category.slug);
    const existing = await collection.findOne({ email }, { projection: { _id: 1 } });
    if (existing) {
      return NextResponse.json({ success: false, code: "ALREADY_REGISTERED" }, { status: 409 });
    }

    return NextResponse.json({ success: true, proofToken: createEmailProofToken(email) });
  } catch (error) {
    console.error("Seat booking OTP verify error:", error);
    return NextResponse.json({ success: false, code: "VERIFY_FAILED" }, { status: 500 });
  }
}
