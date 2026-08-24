import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import {
  buildAdminEmailHtml,
  getAdminEmailPlainText,
  getAdminEmailSubject,
  sendMailgunHtmlEmail,
} from "@/app/api/otp-smtp/templates";
import { getAdminSession } from "@/lib/adminAuth";
import { getRegistrationDb, REGISTRATION_COLLECTION } from "@/lib/mongodb";
import { buildUserStatusUrl } from "@/lib/siteUrl";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function unauthorized() {
  return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
}

function badRequest(message: string) {
  return NextResponse.json({ success: false, message }, { status: 400 });
}

function normalizeLocale(locale: unknown) {
  const normalized =
    typeof locale === "string" ? locale.trim().toLowerCase() : "";
  if (normalized === "zh" || normalized.startsWith("zh-")) return "zh";
  return "en";
}

export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) return unauthorized();

    const body = await request.json();
    const registrationId =
      typeof body.registrationId === "string" ? body.registrationId.trim() : "";
    const locale = normalizeLocale(body.locale);

    let email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    let firstName =
      typeof body.firstName === "string" ? body.firstName.trim() : "";

    if (registrationId) {
      if (!ObjectId.isValid(registrationId)) {
        return badRequest("Invalid registration ID");
      }

      const db = await getRegistrationDb();
      const registration = await db.collection(REGISTRATION_COLLECTION).findOne({
        _id: new ObjectId(registrationId),
        formType: "vip_ticket_booking",
      });

      if (!registration) {
        return NextResponse.json(
          { success: false, message: "Registration not found" },
          { status: 404 }
        );
      }

      const adminDetails = registration.adminDetails as
        | { email?: string; firstName?: string }
        | undefined;

      if (!email) {
        email = (
          adminDetails?.email ||
          (typeof registration.email === "string" ? registration.email : "")
        )
          .trim()
          .toLowerCase();
      }

      if (!firstName) {
        firstName = (adminDetails?.firstName || "").trim();
      }
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return badRequest("Valid email is required");
    }

    const bookingLink = buildUserStatusUrl(email, locale, request);
    const vars = {
      firstName: firstName || undefined,
      bookingLink,
      statusSiteUrl: bookingLink,
    };

    const subject = getAdminEmailSubject(locale);
    const html = buildAdminEmailHtml({ ...vars, locale });
    const text = getAdminEmailPlainText(vars, locale);

    await sendMailgunHtmlEmail({
      to: email,
      subject,
      text,
      html,
    });

    return NextResponse.json({
      success: true,
      message: "Travel confirmation email sent successfully",
    });
  } catch (error) {
    console.error("Admin send travel email error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to send travel confirmation email" },
      { status: 500 }
    );
  }
}
