import {
  type AdminSeatListKey,
  type AdminSeatRegistrationListItem,
  isAdminSeatListKey,
} from "@/lib/adminSeatRegistrations";
import { STAFF_REGISTRATION_COLLECTION } from "@/lib/mongodb";
import { getSeatCollectionName } from "@/lib/seatBooking/server";

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

export function mapSeatRegistrationDocument(
  doc: Record<string, unknown>,
  id: string
): AdminSeatRegistrationListItem {
  const fullName = readString(doc.fullName);
  const firstName = readString(doc.firstName);
  const organisation = doc.organisation;
  let partnerType = "";
  let organisationName = "";
  if (organisation && typeof organisation === "object") {
    const org = organisation as Record<string, unknown>;
    partnerType = readString(org.partnerType);
    organisationName = readString(org.organisation);
  }

  const companion = doc.companion;
  let companionName = "";
  if (companion && typeof companion === "object") {
    companionName = readString((companion as Record<string, unknown>).fullName);
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
    joiningWithSomeone,
    companionName,
    submittedAt: readSubmittedAt(doc.submittedAt),
  };
}
