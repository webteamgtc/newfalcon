import {
  type AdminSeatListKey,
  type AdminSeatRegistrationListItem,
  isAdminSeatListKey,
} from "@/lib/adminSeatRegistrations";
import { STAFF_REGISTRATION_COLLECTION } from "@/lib/mongodb";
import { getSeatCollectionName } from "@/lib/seatBooking/server";
import { isStoredPassportFile, type StoredPassportFile } from "@/lib/s3";

export { isAdminSeatListKey };

export function getCollectionNameForSeatList(list: AdminSeatListKey): string {
  switch (list) {
    case "uae-employee":
      return STAFF_REGISTRATION_COLLECTION;
    case "international-employee":
      return getSeatCollectionName("international-employee");
    case "media-partners":
      return getSeatCollectionName("media-partners");
    case "seat-vip":
      return getSeatCollectionName("vip");
    default:
      return STAFF_REGISTRATION_COLLECTION;
  }
}

function readString(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return "";
}

function readSubmittedAt(value: unknown): string {
  if (value instanceof Date) return value.toISOString();
  return readString(value);
}

function mapStoredFile(value: unknown): StoredPassportFile | null {
  return isStoredPassportFile(value) ? value : null;
}

export function collectSeatRegistrationS3Keys(doc: Record<string, unknown>): Set<string> {
  const keys = new Set<string>();

  const passport = doc.passport;
  if (passport && typeof passport === "object") {
    const file = mapStoredFile((passport as Record<string, unknown>).file);
    if (file) keys.add(file.s3Key);
  }

  const companion = doc.companion;
  if (companion && typeof companion === "object") {
    const file = mapStoredFile((companion as Record<string, unknown>).passportFile);
    if (file) keys.add(file.s3Key);
  }

  return keys;
}

function toAdminFileRef(file: StoredPassportFile | null) {
  if (!file) return null;
  return { fileName: file.fileName, mimeType: file.mimeType, s3Key: file.s3Key };
}

export function mapSeatRegistrationDocument(
  doc: Record<string, unknown>,
  id: string
): AdminSeatRegistrationListItem {
  const fullName = readString(doc.fullName);
  const firstName = readString(doc.firstName);
  let partnerType = readString(doc.partnerType);
  let organisationName = readString(doc.organisation);
  const profileLink = readString(doc.profileLink);
  const organisation = doc.organisation;
  if (!organisationName && organisation && typeof organisation === "object") {
    const org = organisation as Record<string, unknown>;
    partnerType = partnerType || readString(org.partnerType);
    organisationName = readString(org.organisation);
  }

  let passportNumber = "";
  let passportExpiry = "";
  let passportFile = null as ReturnType<typeof toAdminFileRef>;
  const passport = doc.passport;
  if (passport && typeof passport === "object") {
    const p = passport as Record<string, unknown>;
    passportNumber = readString(p.number);
    passportExpiry = readString(p.expiry);
    passportFile = toAdminFileRef(mapStoredFile(p.file));
  }

  let companionPassportFile = null as ReturnType<typeof toAdminFileRef>;

  const companion = doc.companion;
  let companionName = "";
  if (companion && typeof companion === "object") {
    const c = companion as Record<string, unknown>;
    companionName = readString(c.fullName);
    companionPassportFile = toAdminFileRef(mapStoredFile(c.passportFile));
  }

  const joiningRaw = doc.joiningWithSomeone;
  const joiningWithSomeone =
    joiningRaw === true || joiningRaw === "yes"
      ? "Yes"
      : joiningRaw === false || joiningRaw === "no"
        ? "No"
        : "";

  return {
    id,
    reference: readString(doc.reference),
    displayName: fullName || firstName || "—",
    email: readString(doc.email).toLowerCase(),
    phone: readString(doc.phone),
    country: readString(doc.countryOfResidence).toUpperCase(),
    status: readString(doc.status) || "—",
    formType: readString(doc.formType),
    source: readString(doc.source),
    lineManagerName: readString(doc.lineManagerName),
    referredBy: readString(doc.referredBy),
    partnerType,
    organisationName,
    profileLink,
    passportNumber,
    passportExpiry,
    passportFile,
    companionPassportFile,
    joiningWithSomeone,
    companionName,
    submittedAt: readSubmittedAt(doc.submittedAt),
  };
}
