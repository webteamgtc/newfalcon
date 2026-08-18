import { NextResponse } from "next/server";
import {
  getRegistrationDb,
  REGISTRATION_COLLECTION,
} from "@/lib/mongodb";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const email = new URL(request.url).searchParams.get("email")?.trim().toLowerCase();

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 }
      );
    }

    const db = await getRegistrationDb();
    const existing = await db.collection(REGISTRATION_COLLECTION).findOne({
      email,
      formType: "vip_ticket_booking",
    });

    return NextResponse.json({
      success: true,
      exists: Boolean(existing),
    });
  } catch (error) {
    console.error("VIP ticket booking email check error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to check email" },
      { status: 500 }
    );
  }
}
