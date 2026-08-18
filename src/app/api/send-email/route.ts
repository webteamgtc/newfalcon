import { NextResponse } from "next/server";
import {
  MAILGUN_DOMAIN,
  MAILGUN_FROM,
  mailgunClient,
} from "@/config/nodemailer";
import {
  buildConfirmationEmailHtml,
  getConfirmationEmailContent,
  type ConfirmationFormType,
} from "@/lib/emailTemplate";

export const runtime = "nodejs";

const ALLOWED_FORM_TYPES = new Set<ConfirmationFormType>([
  "vip_ticket_booking",
  "staff_registration",
]);

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
    const formType = body.formType as ConfirmationFormType;
    const referenceId =
      typeof body.referenceId === "string" ? body.referenceId.trim() : "";

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, message: "Valid email is required" },
        { status: 400 }
      );
    }

    if (!formType || !ALLOWED_FORM_TYPES.has(formType)) {
      return NextResponse.json(
        { success: false, message: "Invalid form type" },
        { status: 400 }
      );
    }

    const content = getConfirmationEmailContent(formType, referenceId || undefined);
    const html = buildConfirmationEmailHtml({
      firstName: firstName || "Client",
      title: content.title,
      message: content.message,
      details: content.details,
    });

    const text = `${content.message}${
      content.details.length ? `\n\n${content.details.join("\n")}` : ""
    }\n\nOur team will review your submission and contact you if needed.`;

    await mailgunClient.messages.create(MAILGUN_DOMAIN, {
      from: MAILGUN_FROM,
      to: email,
      subject: content.subject,
      text,
      html,
    });

    return NextResponse.json({
      success: true,
      message: "Confirmation email sent successfully",
    });
  } catch (error) {
    console.error("Send email error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to send confirmation email" },
      { status: 500 }
    );
  }
}
