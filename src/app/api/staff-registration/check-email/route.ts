import { NextResponse } from "next/server";
import {
  getRegistrationDb,
  STAFF_REGISTRATION_COLLECTION,
} from "@/lib/mongodb";

export const runtime = "nodejs";

const STAFF_EMAIL_DOMAIN = "@gtcfx.com";

export async function GET(request: Request) {
  try {
    const email = new URL(request.url).searchParams.get("email")?.trim().toLowerCase();

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 }
      );
    }

    if (!email.endsWith(STAFF_EMAIL_DOMAIN)) {
      return NextResponse.json(
        { success: false, message: "Email must be a @gtcfx.com address" },
        { status: 400 }
      );
    }

    const db = await getRegistrationDb();
    const existing = await db
      .collection(STAFF_REGISTRATION_COLLECTION)
      .findOne({ email });

    return NextResponse.json({
      success: true,
      exists: Boolean(existing),
    });
  } catch (error) {
    console.error("Staff registration email check error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to check email" },
      { status: 500 }
    );
  }
}
