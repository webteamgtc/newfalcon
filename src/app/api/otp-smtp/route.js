import { NextResponse } from "next/server";
import {
  buildWelcomeOtpEmailHtml,
  getWelcomeOtpEmailPlainText,
  getWelcomeOtpEmailSubject,
  sendMailgunHtmlEmail,
} from "@/app/api/otp-smtp/templates";
import { generateRandomOtp, createVerificationToken } from "@/lib/otpStore";

export const runtime = "nodejs";
const processOtp = process.env.SHOW_OTP_VERIFICATION === "true";

function normalizeLocale(locale) {
  const normalized = typeof locale === "string" ? locale.trim().toLowerCase() : "";
  if (normalized === "zh" || normalized.startsWith("zh-")) return "zh";
  return "en";
}

export async function POST(req) {
  try {
    const { email, first_name, ibId, ib_id, locale: rawLocale } = await req.json();
    const locale = normalizeLocale(rawLocale);
    const resolvedIbId = ibId || ib_id || "";

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    let otp;
    let verificationToken;
    try {
      otp = generateRandomOtp();
      verificationToken = createVerificationToken(email, otp);
    } catch (storeError) {
      console.error("OTP generate error:", storeError?.message || storeError);
      return NextResponse.json(
        {
          success: false,
          message:
            storeError?.message?.includes("OTP_SECRET")
              ? "OTP service is not configured. Set OTP_SECRET in production."
              : "Failed to prepare OTP verification",
        },
        { status: 500 }
      );
    }

    const subject = getWelcomeOtpEmailSubject(locale);

    const html = buildWelcomeOtpEmailHtml({
      firstName: first_name,
      otp,
      ibId: resolvedIbId,
      locale,
    });

    await sendMailgunHtmlEmail({
      to: email,
      subject,
      text: getWelcomeOtpEmailPlainText(otp, resolvedIbId, locale),
      html,
    });

    return NextResponse.json(
      { success: true, message: "OTP sent successfully", verificationToken, otp:processOtp ? otp : null },
      { status: 200 }
    );
  } catch (error) {
    console.error("OTP send error:", error?.message || error);
    return NextResponse.json(
      { success: false, message: "Error sending OTP" },
      { status: 500 }
    );
  }
}
