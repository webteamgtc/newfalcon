import { NextResponse } from "next/server";
import { createVerificationToken, generateRandomOtp } from "@/lib/otpStore";
import { EMAIL_PATTERN } from "@/lib/seatBooking/categories";
import { getClientIp, rateLimit } from "@/lib/seatBooking/server";
import { normalizeEmailLocale, sendSeatOtpEmail } from "@/lib/seatBooking/emails";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const name = typeof body.name === "string" ? body.name.trim().slice(0, 120) : "";
    const locale = normalizeEmailLocale(body.locale);

    if (!EMAIL_PATTERN.test(email) || email.length > 254) {
      return NextResponse.json({ success: false, code: "EMAIL_INVALID" }, { status: 400 });
    }

    const ip = getClientIp(request);
    const perEmail = rateLimit(`seat-otp-email:${email}`, 1, 45_000);
    const perEmailHour = rateLimit(`seat-otp-email-h:${email}`, 6, 60 * 60_000);
    const perIp = rateLimit(`seat-otp-ip:${ip}`, 15, 10 * 60_000);

    const blocked = [perEmail, perEmailHour, perIp].find((r) => !r.ok);
    if (blocked && !blocked.ok) {
      return NextResponse.json(
        { success: false, code: "RATE_LIMITED", retryAfterSeconds: blocked.retryAfterSeconds },
        { status: 429 }
      );
    }

    const otp = generateRandomOtp();
    const verificationToken = createVerificationToken(email, otp);
    await sendSeatOtpEmail({ to: email, name, otp, locale });

    return NextResponse.json({ success: true, verificationToken });
  } catch (error) {
    console.error("Seat booking OTP send error:", error);
    return NextResponse.json({ success: false, code: "SEND_FAILED" }, { status: 500 });
  }
}
