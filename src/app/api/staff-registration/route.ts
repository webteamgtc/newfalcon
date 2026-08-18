import { NextResponse } from "next/server";
import {
  getRegistrationDb,
  STAFF_REGISTRATION_COLLECTION,
} from "@/lib/mongodb";

export const runtime = "nodejs";

const STAFF_EMAIL_DOMAIN = "@gtcfx.com";

function isStaffEmail(email: string) {
  return email.toLowerCase().endsWith(STAFF_EMAIL_DOMAIN);
}

function isDuplicateEmailError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: number }).code === 11000
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const firstName =
      typeof body.firstName === "string" ? body.firstName.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";
    const lineManagerNumber =
      typeof body.lineManagerNumber === "string"
        ? body.lineManagerNumber.trim()
        : "";

    if (!firstName) {
      return NextResponse.json(
        { success: false, message: "First name is required" },
        { status: 400 }
      );
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, message: "Valid email is required" },
        { status: 400 }
      );
    }

    if (!isStaffEmail(email)) {
      return NextResponse.json(
        {
          success: false,
          message: "Email must be a @gtcfx.com address",
        },
        { status: 400 }
      );
    }

    if (!phone) {
      return NextResponse.json(
        { success: false, message: "Phone number is required" },
        { status: 400 }
      );
    }

    if (!lineManagerNumber) {
      return NextResponse.json(
        { success: false, message: "Line manager number is required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase();

    const db = await getRegistrationDb();
    const collection = db.collection(STAFF_REGISTRATION_COLLECTION);

    const existingRegistration = await collection.findOne({ email: normalizedEmail });
    if (existingRegistration) {
      return NextResponse.json(
        {
          success: false,
          code: "EMAIL_ALREADY_EXISTS",
          message: "This email is already registered.",
        },
        { status: 409 }
      );
    }

    const document = {
      formType: "staff_registration",
      firstName,
      email: normalizedEmail,
      phone,
      lineManagerNumber,
      submittedAt: new Date(),
    };

    const result = await collection.insertOne(document);

    return NextResponse.json({
      success: true,
      id: result.insertedId.toString(),
      message: "Staff registration saved successfully",
    });
  } catch (error) {
    if (isDuplicateEmailError(error)) {
      return NextResponse.json(
        {
          success: false,
          code: "EMAIL_ALREADY_EXISTS",
          message: "This email is already registered.",
        },
        { status: 409 }
      );
    }

    console.error("Staff registration save error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to save registration. Please try again.",
      },
      { status: 500 }
    );
  }
}
