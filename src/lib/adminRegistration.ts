import { isStoredPassportFile, type StoredPassportFile } from "@/lib/s3";

export type VisaStatus =
  | "not_started"
  | "applied"
  | "under_processing"
  | "approved"
  | "rejected";

export type TicketStatus =
  | "not_started"
  | "requested"
  | "under_process"
  | "confirmed"
  | "cancelled";

export type AdminGuestDetails = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  passportNumber: string;
  passportExpiry: string;
  passportCopy?: StoredPassportFile | null;
  qualified: "yes" | "no" | "";
  visaStatus?: VisaStatus | "";
  visaDocument?: StoredPassportFile | null;
  visaRejectionReason?: string;
  ticketStatus?: TicketStatus | "";
  eTicket?: StoredPassportFile | null;
};

export type AdminDetails = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  address: string;
  existingPartner: "yes" | "no" | "";
  partnerId: string;
  passportNumber: string;
  passportExpiry: string;
  passportCopy?: StoredPassportFile | null;
  qualified: "yes" | "no" | "";
  visaStatus?: VisaStatus | "";
  visaDocument?: StoredPassportFile | null;
  visaRejectionReason?: string;
  ticketStatus?: TicketStatus | "";
  eTicket?: StoredPassportFile | null;
  airline?: string;
  flightNumber?: string;
  departureDateTime?: string;
  returnDateTime?: string;
  hotelName?: string;
  hotelAddress?: string;
  hotelFloor?: string;
  hotelRoomNumber?: string;
  checkInDateTime?: string;
  checkOutDateTime?: string;
  hotelConfirmationNumber?: string;
  pickupDetails?: string;
  dropOffDetails?: string;
  updatedAt?: string;
  guest?: AdminGuestDetails | null;
};

export type AdminRegistrationListItem = {
  id: string;
  registrationEmail: string;
  fullName: string;
  submittedAt: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  qualified: string;
  visaStatus: string;
  ticketStatus: string;
  hasAdminDetails: boolean;
};

export type AdminRegistrationRecord = AdminDetails & {
  id: string;
  registrationEmail: string;
  registrationFullName: string;
  submittedAt: string;
  registrationPassportPhoto?: StoredPassportFile | null;
  hasGuest: boolean;
};

function splitFullName(fullName: string) {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length <= 1) {
    return { firstName: parts[0] || "", lastName: "" };
  }
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
}

function readStoredFile(value: unknown): StoredPassportFile | null {
  if (isStoredPassportFile(value)) return value;
  return null;
}

function readAdminDetails(value: unknown): Partial<AdminDetails> {
  if (!value || typeof value !== "object") return {};
  return value as Partial<AdminDetails>;
}

function readAdminGuestDetails(value: unknown): Partial<AdminGuestDetails> {
  if (!value || typeof value !== "object") return {};
  return value as Partial<AdminGuestDetails>;
}

export function mergeGuestAdminDetails(
  registrationGuest: Record<string, unknown> | null | undefined,
  adminGuest: Partial<AdminGuestDetails> | undefined
): AdminGuestDetails | null {
  if (!registrationGuest || typeof registrationGuest !== "object") return null;

  const regName = String(registrationGuest.firstName ?? "");
  const nameParts = splitFullName(regName);

  return {
    firstName: adminGuest?.firstName ?? nameParts.firstName,
    lastName: adminGuest?.lastName ?? nameParts.lastName,
    email: adminGuest?.email ?? String(registrationGuest.email ?? ""),
    phone: adminGuest?.phone ?? String(registrationGuest.phone ?? ""),
    country: adminGuest?.country ?? String(registrationGuest.nationality ?? ""),
    passportNumber:
      adminGuest?.passportNumber ?? String(registrationGuest.passportNumber ?? ""),
    passportExpiry:
      adminGuest?.passportExpiry ?? String(registrationGuest.passportExpiry ?? ""),
    passportCopy:
      adminGuest?.passportCopy ?? readStoredFile(registrationGuest.passportPhoto),
    qualified: adminGuest?.qualified ?? "",
    visaStatus: adminGuest?.visaStatus ?? "",
    visaDocument: adminGuest?.visaDocument ?? null,
    visaRejectionReason: adminGuest?.visaRejectionReason ?? "",
    ticketStatus: adminGuest?.ticketStatus ?? "",
    eTicket: adminGuest?.eTicket ?? null,
  };
}

export function mergeRegistrationWithAdminDetails(
  doc: Record<string, unknown>,
  id: string
): AdminRegistrationRecord {
  const admin = readAdminDetails(doc.adminDetails);
  const nameParts = splitFullName(String(doc.fullName ?? ""));
  const registrationEmail = String(doc.email ?? "").toLowerCase();
  const registrationPassportPhoto = readStoredFile(doc.passportPhoto);

  return {
    id,
    registrationEmail,
    registrationFullName: String(doc.fullName ?? ""),
    submittedAt:
      doc.submittedAt instanceof Date
        ? doc.submittedAt.toISOString()
        : String(doc.submittedAt ?? ""),
    firstName: admin.firstName ?? nameParts.firstName,
    lastName: admin.lastName ?? nameParts.lastName,
    email: admin.email ?? registrationEmail,
    phone: admin.phone ?? String(doc.phone ?? ""),
    country: admin.country ?? String(doc.nationality ?? ""),
    address: admin.address ?? "",
    existingPartner: admin.existingPartner ?? (doc.ibId ? "yes" : ""),
    partnerId: admin.partnerId ?? String(doc.ibId ?? ""),
    passportNumber: admin.passportNumber ?? String(doc.passportNumber ?? ""),
    passportExpiry: admin.passportExpiry ?? String(doc.passportExpiry ?? ""),
    passportCopy: admin.passportCopy ?? registrationPassportPhoto,
    qualified: admin.qualified ?? "",
    visaStatus: admin.visaStatus ?? "",
    visaDocument: admin.visaDocument ?? null,
    visaRejectionReason: admin.visaRejectionReason ?? "",
    ticketStatus: admin.ticketStatus ?? "",
    eTicket: admin.eTicket ?? null,
    airline: admin.airline ?? "",
    flightNumber: admin.flightNumber ?? "",
    departureDateTime: admin.departureDateTime ?? "",
    returnDateTime: admin.returnDateTime ?? "",
    hotelName: admin.hotelName ?? "",
    hotelAddress: admin.hotelAddress ?? "",
    hotelFloor: admin.hotelFloor ?? "",
    hotelRoomNumber: admin.hotelRoomNumber ?? "",
    checkInDateTime: admin.checkInDateTime ?? "",
    checkOutDateTime: admin.checkOutDateTime ?? "",
    hotelConfirmationNumber: admin.hotelConfirmationNumber ?? "",
    pickupDetails: admin.pickupDetails ?? "",
    dropOffDetails: admin.dropOffDetails ?? "",
    updatedAt: admin.updatedAt,
    guest: mergeGuestAdminDetails(
      doc.guest as Record<string, unknown> | null | undefined,
      readAdminGuestDetails(admin.guest)
    ),
    hasGuest: Boolean(doc.invitingGuest && doc.guest),
  };
}

export function toListItem(record: AdminRegistrationRecord): AdminRegistrationListItem {
  return {
    id: record.id,
    registrationEmail: record.registrationEmail,
    fullName: record.registrationFullName,
    submittedAt: record.submittedAt,
    firstName: record.firstName,
    lastName: record.lastName,
    email: record.email,
    phone: record.phone,
    qualified: record.qualified,
    visaStatus: record.visaStatus ?? "",
    ticketStatus: record.ticketStatus ?? "",
    hasAdminDetails: Boolean(record.updatedAt),
  };
}

export const VISA_STATUS_OPTIONS: { value: VisaStatus; label: string }[] = [
  { value: "not_started", label: "Not Started" },
  { value: "applied", label: "Applied" },
  { value: "under_processing", label: "Under Processing" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

export const TICKET_STATUS_OPTIONS: { value: TicketStatus; label: string }[] = [
  { value: "not_started", label: "Not Started" },
  { value: "requested", label: "Requested" },
  { value: "under_process", label: "Under Process" },
  { value: "confirmed", label: "Confirmed" },
  { value: "cancelled", label: "Cancelled" },
];

export function parseYesNo(value: FormDataEntryValue | null) {
  const normalized = typeof value === "string" ? value.trim().toLowerCase() : "";
  if (normalized === "yes" || normalized === "no") return normalized;
  return "";
}

export function parseOptionalSelect<T extends string>(
  value: FormDataEntryValue | null,
  allowed: readonly T[]
) {
  const normalized = typeof value === "string" ? value.trim() : "";
  return allowed.includes(normalized as T) ? (normalized as T) : "";
}
