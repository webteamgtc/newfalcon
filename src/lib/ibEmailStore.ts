import { getRegistrationDb, IB_EMAIL_COLLECTION } from "@/lib/mongodb";

export type IbEmailRecord = {
  email: string;
  ibId: string;
  firstName?: string;
  locale?: string;
  createdAt: Date;
};

let legacyIndexesDropped = false;

async function dropLegacyUniqueIndexes() {
  if (legacyIndexesDropped) return;

  const db = await getRegistrationDb();
  const collection = db.collection(IB_EMAIL_COLLECTION);

  await Promise.allSettled([
    collection.dropIndex("ib_email_unique_email"),
    collection.dropIndex("ib_email_unique_ibId"),
  ]);

  legacyIndexesDropped = true;
}

export type SaveIbEmailResult =
  | { success: true }
  | { success: false; code: "INVALID" };

export async function saveIbEmailAccess(input: {
  email: string;
  ibId: string;
  firstName?: string;
  locale?: string;
}): Promise<SaveIbEmailResult> {
  const email = input.email.trim().toLowerCase();
  const ibId = input.ibId.trim();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !ibId) {
    return { success: false, code: "INVALID" };
  }

  await dropLegacyUniqueIndexes();

  const db = await getRegistrationDb();
  const collection = db.collection<IbEmailRecord>(IB_EMAIL_COLLECTION);

  await collection.insertOne({
    email,
    ibId,
    firstName: input.firstName?.trim() || undefined,
    locale: input.locale?.trim() || undefined,
    createdAt: new Date(),
  });

  return { success: true };
}
