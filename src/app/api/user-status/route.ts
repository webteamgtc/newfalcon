import { NextResponse } from "next/server";
import {
  getRegistrationDb,
  REGISTRATION_COLLECTION,
  STAFF_REGISTRATION_COLLECTION,
} from "@/lib/mongodb";
import { sanitizeRegistrationDocument } from "@/lib/userStatus";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const email = new URL(request.url).searchParams.get("email")?.trim().toLowerCase();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, message: "Valid email is required" },
        { status: 400 }
      );
    }

    const db = await getRegistrationDb();

    const vipRegistration = await db.collection(REGISTRATION_COLLECTION).findOne({
      email,
      formType: "vip_ticket_booking",
    });

    if (vipRegistration) {
      const registration = await sanitizeRegistrationDocument(
        vipRegistration as Record<string, unknown>,
        String(vipRegistration._id)
      );

      return NextResponse.json({
        success: true,
        registration,
      });
    }

    const staffRegistration = await db
      .collection(STAFF_REGISTRATION_COLLECTION)
      .findOne({ email });

    if (staffRegistration) {
      const registration = await sanitizeRegistrationDocument(
        {
          ...staffRegistration,
          formType: "staff_registration",
        } as Record<string, unknown>,
        String(staffRegistration._id)
      );

      return NextResponse.json({
        success: true,
        registration,
      });
    }

    return NextResponse.json(
      { success: false, message: "No registration found for this email" },
      { status: 404 }
    );
  } catch (error) {
    console.error("User status fetch error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load registration status" },
      { status: 500 }
    );
  }
}
