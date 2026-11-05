import {
  ADMIN_SEAT_LIST_KEYS,
  ADMIN_SEAT_LIST_META,
  type AdminSeatListKey,
} from "@/lib/adminSeatRegistrations";
import {
  getCollectionNameForSeatList,
  mapSeatRegistrationDocument,
} from "@/lib/adminSeatRegistrations.server";
import { mergeRegistrationWithAdminDetails } from "@/lib/adminRegistration";
import {
  marketFromCountry,
  type UnifiedContactRow,
} from "@/lib/adminUnifiedContactsExport";
import { getRegistrationDb, REGISTRATION_COLLECTION } from "@/lib/mongodb";

function readDisplayCountry(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return trimmed;
}

function pushRow(
  rows: UnifiedContactRow[],
  row: Omit<UnifiedContactRow, "market"> & { country: string }
) {
  const email = row.email.trim().toLowerCase();
  if (!email && !row.fullName.trim()) return;

  rows.push({
    fullName: row.fullName.trim(),
    email,
    country: readDisplayCountry(row.country),
    market: marketFromCountry(row.country),
    registrationType: row.registrationType,
  });
}

async function loadSeatContacts(listKey: AdminSeatListKey): Promise<UnifiedContactRow[]> {
  const collectionName = getCollectionNameForSeatList(listKey);
  const db = await getRegistrationDb();
  const documents = await db.collection(collectionName).find({}).toArray();
  const label = ADMIN_SEAT_LIST_META[listKey].label;
  const rows: UnifiedContactRow[] = [];

  for (const doc of documents) {
    const mapped = mapSeatRegistrationDocument(doc as Record<string, unknown>, String(doc._id));
    pushRow(rows, {
      fullName: mapped.displayName === "—" ? "" : mapped.displayName,
      email: mapped.email,
      country: mapped.country,
      registrationType: label,
    });
  }

  return rows;
}

async function loadVipTicketContacts(): Promise<UnifiedContactRow[]> {
  const db = await getRegistrationDb();
  const documents = await db
    .collection(REGISTRATION_COLLECTION)
    .find({ formType: "vip_ticket_booking" })
    .toArray();

  const rows: UnifiedContactRow[] = [];

  for (const doc of documents) {
    const id = String(doc._id);
    const record = mergeRegistrationWithAdminDetails(doc as Record<string, unknown>, id);
    pushRow(rows, {
      fullName: record.registrationFullName,
      email: record.registrationEmail || record.email,
      country: record.country || record.nationality,
      registrationType: "VIP registrations",
    });
  }

  return rows;
}

export async function fetchAllUnifiedContactRows(): Promise<UnifiedContactRow[]> {
  const vipRows = await loadVipTicketContacts();
  const seatRows = await Promise.all(
    ADMIN_SEAT_LIST_KEYS.map((listKey) => loadSeatContacts(listKey))
  );

  const combined = [...vipRows, ...seatRows.flat()];

  combined.sort((a, b) => {
    const typeCompare = a.registrationType.localeCompare(b.registrationType);
    if (typeCompare !== 0) return typeCompare;
    return a.fullName.localeCompare(b.fullName, undefined, { sensitivity: "base" });
  });

  return combined;
}
