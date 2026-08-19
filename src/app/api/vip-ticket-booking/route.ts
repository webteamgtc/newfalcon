import { NextResponse } from "next/server";
import { getRegistrationDb, REGISTRATION_COLLECTION } from "@/lib/mongodb";
import { uploadPassportFile } from "@/lib/s3";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_PASSPORT_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "application/pdf",
]);
const BEDROOM_PREFERENCES = new Set(["single_bed", "master_bed", "extra_room"]);

function isDuplicateEmailError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: number }).code === 11000
  );
}

async function validatePassportFile(file: FormDataEntryValue | null, label: string) {
  if (!(file instanceof File) || file.size === 0) {
    return { error: `${label} is required` };
  }

  if (!ALLOWED_PASSPORT_TYPES.has(file.type)) {
    return { error: `${label} must be JPG, PNG, WEBP, or PDF` };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { error: `${label} must be 5MB or less` };
  }

  return { file };
}

function isS3AccessDeniedError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    ("Code" in error || "name" in error) &&
    ((error as { Code?: string }).Code === "AccessDenied" ||
      (error as { name?: string }).name === "AccessDenied")
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
      "invitingGuest",
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

    const invitingGuest = getField("invitingGuest");
    if (invitingGuest !== "yes" && invitingGuest !== "no") {
      return NextResponse.json(
        { success: false, message: "Invalid inviting guest selection" },
        { status: 400 }
      );
    }

    if (getField("terms") !== "true") {
      return NextResponse.json(
        { success: false, message: "Terms must be accepted" },
        { status: 400 }
      );
    }

    const normalizedEmail = getField("email").toLowerCase();

    const primaryPhoto = await validatePassportFile(
      formData.get("passportPhoto"),
      "Passport photo"
    );
    if ("error" in primaryPhoto) {
      return NextResponse.json({ success: false, message: primaryPhoto.error }, { status: 400 });
    }

    let guestPhotoFile: File | null = null;

    if (invitingGuest === "yes") {
      const guestRequiredFields = [
        "bedroomPreference",
        "guestFirstName",
        "guestEmail",
        "guestPhone",
        "guestPassportNumber",
        "guestPassportExpiry",
        "guestNationality",
      ];

      for (const field of guestRequiredFields) {
        if (!getField(field)) {
          return NextResponse.json(
            { success: false, message: `Missing required field: ${field}` },
            { status: 400 }
          );
        }
      }

      const bedroomPreference = getField("bedroomPreference");
      if (!BEDROOM_PREFERENCES.has(bedroomPreference)) {
        return NextResponse.json(
          { success: false, message: "Invalid bedroom preference" },
          { status: 400 }
        );
      }

      const guestEmail = getField("guestEmail").toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail)) {
        return NextResponse.json(
          { success: false, message: "Guest email is invalid" },
          { status: 400 }
        );
      }

      const guestPhoto = await validatePassportFile(
        formData.get("guestPassportPhoto"),
        "Guest passport photo"
      );
      if ("error" in guestPhoto) {
        return NextResponse.json({ success: false, message: guestPhoto.error }, { status: 400 });
      }

      guestPhotoFile = guestPhoto.file;
    }

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

    const uploadedPrimaryPassport = await uploadPassportFile(
      primaryPhoto.file,
      normalizedEmail,
      "primary"
    );

    let guestDetails: Record<string, unknown> | null = null;

    if (invitingGuest === "yes" && guestPhotoFile) {
      const uploadedGuestPassport = await uploadPassportFile(
        guestPhotoFile,
        normalizedEmail,
        "guest"
      );

      guestDetails = {
        firstName: getField("guestFirstName"),
        email: getField("guestEmail").toLowerCase(),
        phone: getField("guestPhone"),
        passportNumber: getField("guestPassportNumber"),
        passportExpiry: getField("guestPassportExpiry"),
        nationality: getField("guestNationality"),
        bedroomPreference: getField("bedroomPreference"),
        passportPhoto: uploadedGuestPassport,
      };
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
      invitingGuest: invitingGuest === "yes",
      guest: guestDetails,
      specialRequirements: getField("specialRequirements"),
      memberId: getField("memberId"),
      userId: getField("userId"),
      ibId: getField("ibId"),
      passportPhoto: uploadedPrimaryPassport,
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

    if (isS3AccessDeniedError(error)) {
      return NextResponse.json(
        {
          success: false,
          code: "S3_ACCESS_DENIED",
          message:
            "Passport upload failed: AWS IAM user needs s3:PutObject permission on gtcfx-bucket/falcon-document/*",
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to save registration. Please try again.",
      },
      { status: 500 }
    );
  }
}
