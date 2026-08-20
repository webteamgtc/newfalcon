import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getAdminSession } from "@/lib/adminAuth";
import {
  mergeRegistrationWithAdminDetails,
  parseOptionalSelect,
  parseYesNo,
  TICKET_STATUS_OPTIONS,
  VISA_STATUS_OPTIONS,
  type AdminDetails,
  type AdminGuestDetails,
} from "@/lib/adminRegistration";
import { getRegistrationDb, REGISTRATION_COLLECTION } from "@/lib/mongodb";
import { isStoredPassportFile, uploadPassportFile } from "@/lib/s3";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_FILE_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "application/pdf",
]);

function unauthorized() {
  return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
}

function badRequest(message: string) {
  return NextResponse.json({ success: false, message }, { status: 400 });
}

function notFound() {
  return NextResponse.json({ success: false, message: "Registration not found" }, { status: 404 });
}

async function getRegistrationById(id: string) {
  if (!ObjectId.isValid(id)) return null;

  const db = await getRegistrationDb();
  return db.collection(REGISTRATION_COLLECTION).findOne({
    _id: new ObjectId(id),
    formType: "vip_ticket_booking",
  });
}

function getField(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

async function validateOptionalFile(
  formData: FormData,
  key: string,
  label: string,
  required: boolean
): Promise<{ error: string } | { file: File | null }> {
  const value = formData.get(key);
  if (!(value instanceof File) || value.size === 0) {
    return required ? { error: `${label} is required` } : { file: null as File | null };
  }

  if (!ALLOWED_FILE_TYPES.has(value.type)) {
    return { error: `${label} must be JPG, PNG, WEBP, or PDF` };
  }

  if (value.size > MAX_FILE_SIZE) {
    return { error: `${label} must be 5MB or less` };
  }

  return { file: value };
}

async function buildGuestAdminDetails(
  formData: FormData,
  existing: Record<string, unknown>,
  currentAdminGuest: Partial<AdminGuestDetails> | undefined,
  ownerEmail: string
): Promise<AdminGuestDetails | null> {
  const registrationGuest = existing.guest as Record<string, unknown> | null | undefined;
  if (!existing.invitingGuest || !registrationGuest) return null;

  const guestPassportUpload = await validateOptionalFile(
    formData,
    "guestPassportCopy",
    "Guest passport copy",
    false
  );
  if ("error" in guestPassportUpload) return Promise.reject(new Error(guestPassportUpload.error));

  const guestVisaUpload = await validateOptionalFile(
    formData,
    "guestVisaDocument",
    "Guest visa document",
    false
  );
  if ("error" in guestVisaUpload) return Promise.reject(new Error(guestVisaUpload.error));

  const guestETicketUpload = await validateOptionalFile(
    formData,
    "guestETicket",
    "Guest e-ticket",
    false
  );
  if ("error" in guestETicketUpload) return Promise.reject(new Error(guestETicketUpload.error));

  let passportCopy = currentAdminGuest?.passportCopy ?? null;
  if (guestPassportUpload.file) {
    passportCopy = await uploadPassportFile(
      guestPassportUpload.file,
      ownerEmail,
      "admin-guest-passport"
    );
  } else if (!passportCopy && isStoredPassportFile(registrationGuest.passportPhoto)) {
    passportCopy = registrationGuest.passportPhoto;
  }

  let visaDocument = currentAdminGuest?.visaDocument ?? null;
  if (guestVisaUpload.file) {
    visaDocument = await uploadPassportFile(
      guestVisaUpload.file,
      ownerEmail,
      "admin-guest-visa"
    );
  }

  let eTicket = currentAdminGuest?.eTicket ?? null;
  if (guestETicketUpload.file) {
    eTicket = await uploadPassportFile(
      guestETicketUpload.file,
      ownerEmail,
      "admin-guest-eticket"
    );
  }

  const guestEmail = getField(formData, "guestEmail").toLowerCase();
  if (guestEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail)) {
    throw new Error("Guest email is invalid");
  }

  return {
    firstName: getField(formData, "guestFirstName"),
    lastName: getField(formData, "guestLastName"),
    email: guestEmail || String(registrationGuest.email ?? ""),
    phone: getField(formData, "guestPhone"),
    country: getField(formData, "guestCountry"),
    passportNumber: getField(formData, "guestPassportNumber"),
    passportExpiry: getField(formData, "guestPassportExpiry"),
    passportCopy,
    qualified: parseYesNo(formData.get("guestQualified")) || currentAdminGuest?.qualified || "",
    visaStatus: parseOptionalSelect(
      formData.get("guestVisaStatus"),
      VISA_STATUS_OPTIONS.map((option) => option.value)
    ),
    visaDocument,
    visaRejectionReason: getField(formData, "guestVisaRejectionReason"),
    ticketStatus: parseOptionalSelect(
      formData.get("guestTicketStatus"),
      TICKET_STATUS_OPTIONS.map((option) => option.value)
    ),
    eTicket,
  };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) return unauthorized();

    const { id } = await params;
    const doc = await getRegistrationById(id);
    if (!doc) return notFound();

    const registration = mergeRegistrationWithAdminDetails(
      doc as Record<string, unknown>,
      id
    );

    return NextResponse.json({ success: true, registration });
  } catch (error) {
    console.error("Admin registration fetch error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load registration" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) return unauthorized();

    const { id } = await params;
    const existing = await getRegistrationById(id);
    if (!existing) return notFound();

    const formData = await request.formData();
    const ownerEmail = String(existing.email ?? "").toLowerCase();
    const currentAdmin = (existing.adminDetails ?? {}) as Partial<AdminDetails>;

    const requiredFields = [
      ["firstName", "First name"],
      ["lastName", "Last name"],
      ["email", "Email"],
      ["phone", "Phone number"],
      ["country", "Country"],
      ["address", "Address"],
      ["partnerId", "Partner ID / Referral code"],
      ["passportNumber", "Passport number"],
      ["passportExpiry", "Passport expiry date"],
    ] as const;

    for (const [field, label] of requiredFields) {
      if (!getField(formData, field)) {
        return badRequest(`${label} is required`);
      }
    }

    const existingPartner = parseYesNo(formData.get("existingPartner"));
    const qualified = parseYesNo(formData.get("qualified"));

    if (!existingPartner) {
      return badRequest("Existing partner selection is required");
    }

    if (!qualified) {
      return badRequest("Qualified selection is required");
    }

    const email = getField(formData, "email").toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return badRequest("Email is invalid");
    }

    const passportCopyUpload = await validateOptionalFile(
      formData,
      "passportCopy",
      "Passport copy",
      !currentAdmin.passportCopy && !isStoredPassportFile(existing.passportPhoto)
    );
    if ("error" in passportCopyUpload) return badRequest(passportCopyUpload.error);

    const visaDocumentUpload = await validateOptionalFile(
      formData,
      "visaDocument",
      "Visa document",
      false
    );
    if ("error" in visaDocumentUpload) return badRequest(visaDocumentUpload.error);

    const eTicketUpload = await validateOptionalFile(
      formData,
      "eTicket",
      "E-ticket",
      false
    );
    if ("error" in eTicketUpload) return badRequest(eTicketUpload.error);

    let passportCopy = currentAdmin.passportCopy ?? null;
    if (passportCopyUpload.file) {
      passportCopy = await uploadPassportFile(
        passportCopyUpload.file,
        ownerEmail,
        "admin-passport"
      );
    } else if (!passportCopy && isStoredPassportFile(existing.passportPhoto)) {
      passportCopy = existing.passportPhoto;
    }

    let visaDocument = currentAdmin.visaDocument ?? null;
    if (visaDocumentUpload.file) {
      visaDocument = await uploadPassportFile(
        visaDocumentUpload.file,
        ownerEmail,
        "admin-visa"
      );
    }

    let eTicket = currentAdmin.eTicket ?? null;
    if (eTicketUpload.file) {
      eTicket = await uploadPassportFile(
        eTicketUpload.file,
        ownerEmail,
        "admin-eticket"
      );
    }

    const adminDetails: AdminDetails = {
      firstName: getField(formData, "firstName"),
      lastName: getField(formData, "lastName"),
      email,
      phone: getField(formData, "phone"),
      country: getField(formData, "country"),
      address: getField(formData, "address"),
      existingPartner,
      partnerId: getField(formData, "partnerId"),
      passportNumber: getField(formData, "passportNumber"),
      passportExpiry: getField(formData, "passportExpiry"),
      passportCopy,
      qualified,
      visaStatus: parseOptionalSelect(
        formData.get("visaStatus"),
        VISA_STATUS_OPTIONS.map((option) => option.value)
      ),
      visaDocument,
      visaRejectionReason: getField(formData, "visaRejectionReason"),
      ticketStatus: parseOptionalSelect(
        formData.get("ticketStatus"),
        TICKET_STATUS_OPTIONS.map((option) => option.value)
      ),
      eTicket,
      airline: getField(formData, "airline"),
      flightNumber: getField(formData, "flightNumber"),
      departureDateTime: getField(formData, "departureDateTime"),
      returnDateTime: getField(formData, "returnDateTime"),
      hotelName: getField(formData, "hotelName"),
      hotelAddress: getField(formData, "hotelAddress"),
      hotelFloor: getField(formData, "hotelFloor"),
      hotelRoomNumber: getField(formData, "hotelRoomNumber"),
      checkInDateTime: getField(formData, "checkInDateTime"),
      checkOutDateTime: getField(formData, "checkOutDateTime"),
      hotelConfirmationNumber: getField(formData, "hotelConfirmationNumber"),
      pickupDetails: getField(formData, "pickupDetails"),
      dropOffDetails: getField(formData, "dropOffDetails"),
      updatedAt: new Date().toISOString(),
      guest: null,
    };

    if (existing.invitingGuest && existing.guest) {
      try {
        adminDetails.guest = await buildGuestAdminDetails(
          formData,
          existing as Record<string, unknown>,
          currentAdmin.guest ?? undefined,
          ownerEmail
        );
      } catch (guestError) {
        const message =
          guestError instanceof Error ? guestError.message : "Invalid guest details";
        return badRequest(message);
      }
    }

    const db = await getRegistrationDb();
    await db.collection(REGISTRATION_COLLECTION).updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          adminDetails,
          updatedAt: new Date(),
        },
      }
    );

    const updated = await getRegistrationById(id);
    const registration = mergeRegistrationWithAdminDetails(
      updated as Record<string, unknown>,
      id
    );

    return NextResponse.json({
      success: true,
      message: "Registration updated successfully",
      registration,
    });
  } catch (error) {
    console.error("Admin registration update error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update registration" },
      { status: 500 }
    );
  }
}
