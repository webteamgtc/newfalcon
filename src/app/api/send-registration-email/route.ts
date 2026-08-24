import { NextResponse } from "next/server";
import {
  buildGoldenFalconEmailHtml,
  getGoldenFalconEmailPlainText,
  getGoldenFalconEmailSubject,
  sendMailgunHtmlEmail,
} from "@/app/api/otp-smtp/templates";

export const runtime = "nodejs";

function normalizeLocale(locale: unknown) {
  const normalized =
    typeof locale === "string" ? locale.trim().toLowerCase() : "";
  if (normalized === "zh" || normalized.startsWith("zh-")) return "zh";
  return "en";
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const firstName =
      typeof body.first_name === "string"
        ? body.first_name.trim()
        : typeof body.firstName === "string"
          ? body.firstName.trim()
          : "";
    const locale = normalizeLocale(body.locale);
    const termsLink =
      typeof body.termsLink === "string" && body.termsLink.trim()
        ? body.termsLink.trim()
        : undefined;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, message: "Valid email is required" },
        { status: 400 }
      );
    }

    const vars = {
      firstName: firstName || undefined,
      termsLink,
    };

    const subject = getGoldenFalconEmailSubject("registration_started", locale);
    const html = buildGoldenFalconEmailHtml("registration_started", locale, vars);
    const text = getGoldenFalconEmailPlainText("registration_started", locale, vars);

    await sendMailgunHtmlEmail({
      to: email,
      subject,
      text,
      html,
    });

    return NextResponse.json({
      success: true,
      message: "Registration started email sent successfully",
    });
  } catch (error) {
    console.error("Send registration email error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to send registration started email" },
      { status: 500 }
    );
  }
}
