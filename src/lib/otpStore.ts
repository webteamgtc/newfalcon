import crypto from "crypto";
import { getRegistrationDb } from "@/lib/mongodb";

export const OTP_COLLECTION = "otp_verifications";
const OTP_TTL_MS = 10 * 60 * 1000;

type OtpRecord = {
  otpHash: string;
  expiresAt: number;
};

declare global {
  // eslint-disable-next-line no-var
  var _otpMemoryStore: Map<string, OtpRecord> | undefined;
}

function getMemoryStore() {
  if (!global._otpMemoryStore) {
    global._otpMemoryStore = new Map();
  }
  return global._otpMemoryStore;
}

function getOtpSecret() {
  const secret = process.env.OTP_SECRET?.trim();
  if (secret) return secret;
  throw new Error("Missing OTP_SECRET environment variable");
}

function hashOtp(email: string, otp: string) {
  return crypto
    .createHmac("sha256", getOtpSecret())
    .update(`${email.toLowerCase()}:${otp}`)
    .digest("hex");
}

async function storeOtpInMongo(email: string, otp: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const db = await getRegistrationDb();

  await db.collection(OTP_COLLECTION).updateOne(
    { email: normalizedEmail },
    {
      $set: {
        email: normalizedEmail,
        otpHash: hashOtp(normalizedEmail, otp),
        expiresAt: new Date(Date.now() + OTP_TTL_MS),
        createdAt: new Date(),
      },
    },
    { upsert: true }
  );
}

function storeOtpInMemory(email: string, otp: string) {
  const normalizedEmail = email.trim().toLowerCase();
  getMemoryStore().set(normalizedEmail, {
    otpHash: hashOtp(normalizedEmail, otp),
    expiresAt: Date.now() + OTP_TTL_MS,
  });
}

export async function storeOtp(email: string, otp: string) {
  try {
    await storeOtpInMongo(email, otp);
  } catch (mongoError) {
    console.warn("MongoDB OTP store failed, using memory fallback:", mongoError);
    storeOtpInMemory(email, otp);
  }
}

async function verifyOtpFromMongo(email: string, otp: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const db = await getRegistrationDb();
  const doc = await db.collection(OTP_COLLECTION).findOne({ email: normalizedEmail });

  if (!doc?.expiresAt || new Date(doc.expiresAt) < new Date()) {
    return false;
  }

  const isValid = doc.otpHash === hashOtp(normalizedEmail, otp);

  if (isValid) {
    await db.collection(OTP_COLLECTION).deleteOne({ email: normalizedEmail });
  }

  return isValid;
}

function verifyOtpFromMemory(email: string, otp: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const doc = getMemoryStore().get(normalizedEmail);

  if (!doc || doc.expiresAt < Date.now()) {
    getMemoryStore().delete(normalizedEmail);
    return false;
  }

  const isValid = doc.otpHash === hashOtp(normalizedEmail, otp);

  if (isValid) {
    getMemoryStore().delete(normalizedEmail);
  }

  return isValid;
}

export async function verifyStoredOtp(email: string, otp: string) {
  const normalizedOtp = otp.trim();

  if (!/^\d{6}$/.test(normalizedOtp)) {
    return false;
  }

  try {
    const verified = await verifyOtpFromMongo(email, normalizedOtp);
    if (verified) return true;
  } catch (mongoError) {
    console.warn("MongoDB OTP verify failed, trying memory fallback:", mongoError);
  }

  return verifyOtpFromMemory(email, normalizedOtp);
}
