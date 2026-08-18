import { NextResponse } from "next/server";
import { getRegistrationDb, REGISTRATION_COLLECTION } from "@/lib/mongodb";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

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
    const formData = await request.formData();

    const getField = (key: string) => {
      const value = formData.get(key);
      return typeof value === "string" ? value.trim() : "";
    };

    const requiredFields = [
      "fullName",
      "email",
      "phone",
      "passportNumber",
      "passportExpiry",
      "nationality",
      "dateOfBirth",
      "arrivalDate",
      "departureDate",
      "emergencyContactName",
      "emergencyContactPhone",
      "memberId",
      "userId",
    ];

    for (const field of requiredFields) {
      if (!getField(field)) {
        return NextResponse.json(
          { success: false, message: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    if (getField("terms") !== "true") {
      return NextResponse.json(
        { success: false, message: "Terms must be accepted" },
        { status: 400 }
      );
    }

    const passportPhoto = formData.get("passportPhoto");
    if (!(passportPhoto instanceof File) || passportPhoto.size === 0) {
      return NextResponse.json(
        { success: false, message: "Passport photo is required" },
        { status: 400 }
      );
    }

    if (!ALLOWED_IMAGE_TYPES.has(passportPhoto.type)) {
      return NextResponse.json(
        { success: false, message: "Passport photo must be JPG, PNG, or WEBP" },
        { status: 400 }
      );
    }

    if (passportPhoto.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, message: "Passport photo must be 5MB or less" },
        { status: 400 }
      );
    }

    const arrivalDate = getField("arrivalDate");
    const departureDate = getField("departureDate");
    if (arrivalDate > departureDate) {
      return NextResponse.json(
        { success: false, message: "Departure date must be on or after arrival date" },
        { status: 400 }
      );
    }

    const photoBuffer = Buffer.from(await passportPhoto.arrayBuffer());
    const photoBase64 = photoBuffer.toString("base64");
    const normalizedEmail = getField("email").toLowerCase();

    const db = await getRegistrationDb();
    const collection = db.collection(REGISTRATION_COLLECTION);

    const existingRegistration = await collection.findOne({
      email: normalizedEmail,
      formType: "vip_ticket_booking",
    });

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
      formType: "vip_ticket_booking",
      fullName: getField("fullName"),
      email: normalizedEmail,
      phone: getField("phone"),
      passportNumber: getField("passportNumber"),
      passportExpiry: getField("passportExpiry"),
      nationality: getField("nationality"),
      dateOfBirth: getField("dateOfBirth"),
      arrivalDate,
      departureDate,
      emergencyContactName: getField("emergencyContactName"),
      emergencyContactPhone: getField("emergencyContactPhone"),
      specialRequirements: getField("specialRequirements"),
      memberId: getField("memberId"),
      userId: getField("userId"),
      ibId: getField("ibId"),
      passportPhoto: {
        fileName: passportPhoto.name,
        mimeType: passportPhoto.type,
        size: passportPhoto.size,
        data: photoBase64,
      },
      submittedAt: new Date(),
    };

    const result = await collection.insertOne(document);

    return NextResponse.json({
      success: true,
      id: result.insertedId.toString(),
      message: "Registration saved successfully",
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

    console.error("VIP ticket booking save error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to save registration. Please try again.",
      },
      { status: 500 }
    );
  }
}
