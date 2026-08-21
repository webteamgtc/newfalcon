import {
  isLegacyPassportFile,
  isStoredPassportFile,
  type StoredPassportFile,
} from "@/lib/s3";
import { mergeRegistrationWithAdminDetails, mergeGuestAdminDetails } from "@/lib/adminRegistration";

export type PublicPassportDocument = {
  fileName?: string;
  mimeType?: string;
  uploaded: boolean;
  url?: string;
  legacyStored?: boolean;
};

export type PublicGuestAdminStatus = {
  fullName: string;
  email: string;
  phone: string;
  country: string;
  qualificationStatus: "" | "not_yet_reached" | "qualified";
  visaStatus: string;
  visaDocument?: PublicPassportDocument;
  ticketStatus: string;
  eTicket?: PublicPassportDocument;
  passportCopy?: PublicPassportDocument;
  hotelFloor: string;
  hotelRoomNumber: string;
};

export type PublicGuestDetails = {
  firstName: string;
  email: string;
  phone: string;
  passportNumber: string;
  passportExpiry: string;
  nationality: string;
  bedroomPreference: string;
  passportPhotoUploaded: boolean;
  passportPhotoFileName?: string;
  passportPhoto?: PublicPassportDocument;
  adminStatus?: PublicGuestAdminStatus;
};

export type PublicUserRegistration = {
  id: string;
  formType: "vip_ticket_booking" | "staff_registration";
  status: "under_review" | "registered";
  fullName: string;
  email: string;
  phone: string;
  passportNumber?: string;
  passportExpiry?: string;
  nationality?: string;
  dateOfBirth?: string;
  invitingGuest?: boolean;
  guest?: PublicGuestDetails | null;
  specialRequirements?: string;
  memberId?: string;
  ibId?: string;
  lineManagerName?: string;
  passportPhotoUploaded: boolean;
  passportPhotoFileName?: string;
  passportPhoto?: PublicPassportDocument;
  submittedAt: string;
  adminStatus?: PublicAdminStatus;
};

export type PublicAdminStatus = {
  hasUpdates: boolean;
  fullName: string;
  email: string;
  partnerId: string;
  phone: string;
  country: string;
  qualificationStatus: "" | "not_yet_reached" | "qualified";
  visaStatus: string;
  visaDocument?: PublicPassportDocument;
  ticketStatus: string;
  eTicket?: PublicPassportDocument;
  airline: string;
  flightNumber: string;
  departureDateTime: string;
  returnDateTime: string;
  hotelName: string;
  hotelAddress: string;
  hotelFloor: string;
  hotelRoomNumber: string;
  checkInDateTime: string;
  checkOutDateTime: string;
  hotelConfirmationNumber: string;
  pickupDetails: string;
  dropOffDetails: string;
  passportCopy?: PublicPassportDocument;
};

function formatDateValue(value: unknown) {
  if (!value) return "";
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") return value;
  return String(value);
}

function inferMimeType(fileName?: string, mimeType?: string) {
  if (mimeType?.trim()) return mimeType;

  const extension = fileName?.split(".").pop()?.toLowerCase();
  if (extension === "pdf") return "application/pdf";
  if (extension === "png") return "image/png";
  if (extension === "webp") return "image/webp";
  if (extension === "jpg" || extension === "jpeg") return "image/jpeg";
  return "application/octet-stream";
}

function buildDocumentProxyUrl(ownerEmail: string, s3Key: string) {
  return `/api/user-status/document?email=${encodeURIComponent(ownerEmail)}&s3Key=${encodeURIComponent(s3Key)}`;
}

async function buildPassportDocument(
  value: unknown,
  ownerEmail: string
): Promise<PublicPassportDocument> {
  if (isStoredPassportFile(value)) {
    const mimeType = inferMimeType(value.fileName, value.mimeType);

    return {
      fileName: value.fileName,
      mimeType,
      uploaded: true,
      url: buildDocumentProxyUrl(ownerEmail, value.s3Key),
    };
  }

  if (isLegacyPassportFile(value)) {
    const legacy = value as { fileName?: string; mimeType?: string };
    return {
      fileName: legacy.fileName,
      mimeType: inferMimeType(legacy.fileName, legacy.mimeType),
      uploaded: true,
      legacyStored: true,
    };
  }

  if (typeof value === "object" && value !== null && "fileName" in value) {
    const file = value as { fileName?: string; mimeType?: string; s3Key?: string };
    const mimeType = inferMimeType(file.fileName, file.mimeType);

    if (file.s3Key) {
      return {
        fileName: file.fileName,
        mimeType,
        uploaded: true,
        url: buildDocumentProxyUrl(ownerEmail, file.s3Key),
      };
    }

    return {
      fileName: file.fileName,
      mimeType,
      uploaded: Boolean(file.fileName),
    };
  }

  return { uploaded: false };
}

async function buildAdminStatus(
  doc: Record<string, unknown>,
  id: string,
  ownerEmail: string
): Promise<PublicAdminStatus> {
  const merged = mergeRegistrationWithAdminDetails(doc, id);
  const admin = doc.adminDetails as { updatedAt?: string } | undefined;
  const hasUpdates = Boolean(admin?.updatedAt);

  const passportCopy = await buildPassportDocument(
    merged.passportCopy ?? doc.passportPhoto,
    ownerEmail
  );

  let visaDocument: PublicPassportDocument | undefined;
  if (merged.visaStatus === "approved" && merged.visaDocument) {
    visaDocument = await buildPassportDocument(merged.visaDocument, ownerEmail);
    if (!visaDocument.uploaded) visaDocument = undefined;
  }

  let eTicket: PublicPassportDocument | undefined;
  if (merged.ticketStatus === "confirmed" && merged.eTicket) {
    eTicket = await buildPassportDocument(merged.eTicket, ownerEmail);
    if (!eTicket.uploaded) eTicket = undefined;
  }

  const qualificationStatus =
    merged.qualified === "yes"
      ? "qualified"
      : merged.qualified === "no"
        ? "not_yet_reached"
        : "";

  const fullName =
    [merged.firstName, merged.lastName].filter(Boolean).join(" ") ||
    merged.registrationFullName;

  return {
    hasUpdates,
    fullName,
    email: merged.email,
    partnerId: merged.partnerId,
    phone: merged.phone,
    country: merged.country,
    qualificationStatus,
    visaStatus: merged.visaStatus ?? "",
    visaDocument,
    ticketStatus: merged.ticketStatus ?? "",
    eTicket,
    airline: merged.airline ?? "",
    flightNumber: merged.flightNumber ?? "",
    departureDateTime: merged.departureDateTime ?? "",
    returnDateTime: merged.returnDateTime ?? "",
    hotelName: merged.hotelName ?? "",
    hotelAddress: merged.hotelAddress ?? "",
    hotelFloor: merged.hotelFloor ?? "",
    hotelRoomNumber: merged.hotelRoomNumber ?? "",
    checkInDateTime: merged.checkInDateTime ?? "",
    checkOutDateTime: merged.checkOutDateTime ?? "",
    hotelConfirmationNumber: merged.hotelConfirmationNumber ?? "",
    pickupDetails: merged.pickupDetails ?? "",
    dropOffDetails: merged.dropOffDetails ?? "",
    passportCopy: passportCopy.uploaded ? passportCopy : undefined,
  };
}

async function buildGuestAdminStatus(
  doc: Record<string, unknown>,
  ownerEmail: string
): Promise<PublicGuestAdminStatus | undefined> {
  const registrationGuest = doc.guest as Record<string, unknown> | null | undefined;
  if (!registrationGuest) return undefined;

  const admin = doc.adminDetails as { guest?: Record<string, unknown> } | undefined;
  const merged = mergeGuestAdminDetails(
    registrationGuest,
    admin?.guest as Parameters<typeof mergeGuestAdminDetails>[1]
  );
  if (!merged) return undefined;

  const passportCopy = await buildPassportDocument(
    merged.passportCopy ?? registrationGuest.passportPhoto,
    ownerEmail
  );

  let visaDocument: PublicPassportDocument | undefined;
  if (merged.visaStatus === "approved" && merged.visaDocument) {
    visaDocument = await buildPassportDocument(merged.visaDocument, ownerEmail);
    if (!visaDocument.uploaded) visaDocument = undefined;
  }

  let eTicket: PublicPassportDocument | undefined;
  if (merged.ticketStatus === "confirmed" && merged.eTicket) {
    eTicket = await buildPassportDocument(merged.eTicket, ownerEmail);
    if (!eTicket.uploaded) eTicket = undefined;
  }

  const qualificationStatus =
    merged.qualified === "yes"
      ? "qualified"
      : merged.qualified === "no"
        ? "not_yet_reached"
        : "";

  const fullName = [merged.firstName, merged.lastName].filter(Boolean).join(" ");

  return {
    fullName,
    email: merged.email,
    phone: merged.phone,
    country: merged.country,
    qualificationStatus,
    visaStatus: merged.visaStatus ?? "",
    visaDocument,
    ticketStatus: merged.ticketStatus ?? "",
    eTicket,
    passportCopy: passportCopy.uploaded ? passportCopy : undefined,
    hotelFloor: merged.hotelFloor ?? "",
    hotelRoomNumber: merged.hotelRoomNumber ?? "",
  };
}

async function sanitizeGuest(
  guest: Record<string, unknown> | null | undefined,
  ownerEmail: string,
  doc: Record<string, unknown>
): Promise<PublicGuestDetails | null> {
  if (!guest || typeof guest !== "object") return null;

  const passportPhoto = await buildPassportDocument(guest.passportPhoto, ownerEmail);

  return {
    firstName: String(guest.firstName ?? ""),
    email: String(guest.email ?? ""),
    phone: String(guest.phone ?? ""),
    passportNumber: String(guest.passportNumber ?? ""),
    passportExpiry: String(guest.passportExpiry ?? ""),
    nationality: String(guest.nationality ?? ""),
    bedroomPreference: String(guest.bedroomPreference ?? ""),
    passportPhotoUploaded: passportPhoto.uploaded,
    passportPhotoFileName: passportPhoto.fileName,
    passportPhoto,
    adminStatus: await buildGuestAdminStatus(doc, ownerEmail),
  };
}

export async function sanitizeRegistrationDocument(
  doc: Record<string, unknown>,
  id: string
): Promise<PublicUserRegistration | null> {
  const formType = doc.formType as PublicUserRegistration["formType"];
  const email = typeof doc.email === "string" ? doc.email : "";

  if (!email) return null;

  const passportPhoto = await buildPassportDocument(doc.passportPhoto, email);
  const submittedAt = formatDateValue(doc.submittedAt);

  if (formType === "staff_registration") {
    return {
      id,
      formType,
      status: "registered",
      fullName: String(doc.firstName ?? ""),
      email,
      phone: String(doc.phone ?? ""),
      lineManagerName: String(doc.lineManagerName ?? ""),
      passportPhotoUploaded: false,
      submittedAt: submittedAt || new Date().toISOString(),
    };
  }

  return {
    id,
    formType: "vip_ticket_booking",
    status: "under_review",
    fullName: String(doc.fullName ?? ""),
    email,
    phone: String(doc.phone ?? ""),
    passportNumber: String(doc.passportNumber ?? ""),
    passportExpiry: String(doc.passportExpiry ?? ""),
    nationality: String(doc.nationality ?? ""),
    dateOfBirth: String(doc.dateOfBirth ?? ""),
    invitingGuest: Boolean(doc.invitingGuest),
    guest: await sanitizeGuest(
      doc.guest as Record<string, unknown> | null | undefined,
      email,
      doc
    ),
    specialRequirements: String(doc.specialRequirements ?? ""),
    memberId: String(doc.memberId ?? ""),
    ibId: String(doc.ibId ?? ""),
    passportPhotoUploaded: passportPhoto.uploaded,
    passportPhotoFileName: passportPhoto.fileName,
    passportPhoto,
    submittedAt: submittedAt || new Date().toISOString(),
    adminStatus: await buildAdminStatus(doc, id, email),
  };
}

export type { StoredPassportFile };
