import { isStoredPassportFile, type StoredPassportFile } from "@/lib/s3";
import { computeVipProgressSnapshot, type VipProgressSnapshot } from "@/data/vipUsers";

export type AdminIbClientInfo = {
  email: string;
  memberId: string;
  clientStatus: string;
  kycStatus: string;
  userType: string;
  firstName: string;
};

export type AdminIbPerformanceInfo = {
  email: string;
  depositUsd: number;
  netDepositUsd: number;
  tradeLots: number;
  withdrawalUsd: number;
};

export type AdminIbClientSnapshot = {
  client: AdminIbClientInfo;
  performance: AdminIbPerformanceInfo;
} | null;

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
  hotelFloor?: string;
  hotelRoomNumber?: string;
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
  memberId: string;
  userId: string;
  ibId: string | null;
  ibClient: AdminIbClientSnapshot;
  vipProgress: VipProgressSnapshot;
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
  memberId: string;
  userId: string;
  ibId: string | null;
  ibClient: AdminIbClientSnapshot;
  vipProgress: VipProgressSnapshot;
  nationality: string;
  dateOfBirth: string;
  specialRequirements: string;
  invitingGuest: boolean;
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

function readNumber(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value.replace(/,/g, ""));
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function readString(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return "";
}

function readNullableString(value: unknown): string | null {
  if (value == null) return null;
  const normalized = readString(value);
  return normalized || null;
}

function readIbClientInfo(value: unknown): AdminIbClientInfo | null {
  if (!value || typeof value !== "object") return null;

  const record = value as Record<string, unknown>;
  const email = readString(record.email).toLowerCase();
  const memberId = readString(record.memberId);

  if (!email && !memberId) return null;

  return {
    email,
    memberId,
    clientStatus: readString(record.clientStatus),
    kycStatus: readString(record.kycStatus),
    userType: readString(record.userType),
    firstName: readString(record.firstName),
  };
}

function readIbPerformanceInfo(value: unknown, fallbackEmail: string): AdminIbPerformanceInfo {
  if (!value || typeof value !== "object") {
    return {
      email: fallbackEmail,
      depositUsd: 0,
      netDepositUsd: 0,
      tradeLots: 0,
      withdrawalUsd: 0,
    };
  }

  const record = value as Record<string, unknown>;

  return {
    email: readString(record.email).toLowerCase() || fallbackEmail,
    depositUsd: readNumber(record.depositUsd),
    netDepositUsd: readNumber(record.netDepositUsd),
    tradeLots: readNumber(record.tradeLots),
    withdrawalUsd: readNumber(record.withdrawalUsd),
  };
}

export function readIbClientSnapshot(value: unknown): AdminIbClientSnapshot {
  if (!value || typeof value !== "object") return null;

  const record = value as Record<string, unknown>;
  const client = readIbClientInfo(record.client);

  if (!client) return null;

  return {
    client,
    performance: readIbPerformanceInfo(record.performance, client.email),
  };
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
    hotelFloor: adminGuest?.hotelFloor ?? "",
    hotelRoomNumber: adminGuest?.hotelRoomNumber ?? "",
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
  const ibClient = readIbClientSnapshot(doc.ibClient);
  const memberId = readString(doc.memberId) || ibClient?.client.memberId || "";
  const userId = readString(doc.userId);
  const ibId = readNullableString(doc.ibId);

  return {
    id,
    registrationEmail,
    registrationFullName: String(doc.fullName ?? ""),
    submittedAt:
      doc.submittedAt instanceof Date
        ? doc.submittedAt.toISOString()
        : String(doc.submittedAt ?? ""),
    memberId,
    userId,
    ibId,
    ibClient,
    vipProgress: computeVipProgressSnapshot(ibClient?.performance ?? null),
    nationality: String(doc.nationality ?? ""),
    dateOfBirth: String(doc.dateOfBirth ?? ""),
    specialRequirements: String(doc.specialRequirements ?? ""),
    invitingGuest: Boolean(doc.invitingGuest),
    firstName: admin.firstName ?? nameParts.firstName,
    lastName: admin.lastName ?? nameParts.lastName,
    email: admin.email ?? registrationEmail,
    phone: admin.phone ?? String(doc.phone ?? ""),
    country: admin.country ?? String(doc.nationality ?? ""),
    address: admin.address ?? "",
    existingPartner: admin.existingPartner ?? (ibClient || ibId ? "yes" : ""),
    partnerId: admin.partnerId ?? ibId ?? ibClient?.client.memberId ?? "",
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
    memberId: record.memberId,
    userId: record.userId,
    ibId: record.ibId,
    ibClient: record.ibClient,
    vipProgress: record.vipProgress,
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
