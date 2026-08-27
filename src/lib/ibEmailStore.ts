import { getRegistrationDb, IB_EMAIL_COLLECTION } from "@/lib/mongodb";

export type IbEmailRecord = {
  email: string;
  ibId: string;
  firstName?: string;
  locale?: string;
  createdAt: Date;
  updatedAt: Date;
};

let indexesEnsured = false;

async function ensureIbEmailIndexes() {
  if (indexesEnsured) return;

  const db = await getRegistrationDb();
  const collection = db.collection(IB_EMAIL_COLLECTION);

  await Promise.all([
    collection.createIndex({ email: 1 }, { unique: true, name: "ib_email_unique_email" }),
    collection.createIndex({ ibId: 1 }, { unique: true, name: "ib_email_unique_ibId" }),
  ]);

  indexesEnsured = true;
}

export type SaveIbEmailResult =
  | { success: true; created: boolean }
  | { success: false; code: "EMAIL_IN_USE" | "IB_ID_IN_USE" | "INVALID" };

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

  await ensureIbEmailIndexes();

  const db = await getRegistrationDb();
  const collection = db.collection<IbEmailRecord>(IB_EMAIL_COLLECTION);
  const now = new Date();

  const [existingByEmail, existingByIbId] = await Promise.all([
    collection.findOne({ email }),
    collection.findOne({ ibId }),
  ]);

  if (existingByEmail && existingByEmail.ibId === ibId) {
    await collection.updateOne(
      { email },
      {
        $set: {
          firstName: input.firstName?.trim() || existingByEmail.firstName,
          locale: input.locale?.trim() || existingByEmail.locale,
          updatedAt: now,
        },
      }
    );
    return { success: true, created: false };
  }

  if (existingByEmail && existingByEmail.ibId !== ibId) {
    return { success: false, code: "EMAIL_IN_USE" };
  }

  if (existingByIbId && existingByIbId.email !== email) {
    return { success: false, code: "IB_ID_IN_USE" };
  }

  try {
    await collection.insertOne({
      email,
      ibId,
      firstName: input.firstName?.trim() || undefined,
      locale: input.locale?.trim() || undefined,
      createdAt: now,
      updatedAt: now,
    });
    return { success: true, created: true };
  } catch (error) {
    const mongoError = error as { code?: number };
    if (mongoError.code === 11000) {
      const [byEmail, byIbId] = await Promise.all([
        collection.findOne({ email }),
        collection.findOne({ ibId }),
      ]);

      if (byEmail?.ibId === ibId) {
        return { success: true, created: false };
      }
      if (byEmail && byEmail.email === email) {
        return { success: false, code: "EMAIL_IN_USE" };
      }
      if (byIbId && byIbId.ibId === ibId) {
        return { success: false, code: "IB_ID_IN_USE" };
      }
    }

    throw error;
  }
}
