import crypto from "crypto";
import { getRegistrationDb } from "@/lib/mongodb";

export const OTP_COLLECTION = "otp_verifications";
const OTP_TTL_MS = 10 * 60 * 1000;

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

export async function storeOtp(email: string, otp: string) {
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

export async function verifyStoredOtp(email: string, otp: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedOtp = otp.trim();

  if (!/^\d{6}$/.test(normalizedOtp)) {
    return false;
  }

  const db = await getRegistrationDb();
  const doc = await db.collection(OTP_COLLECTION).findOne({ email: normalizedEmail });

  if (!doc?.expiresAt || new Date(doc.expiresAt) < new Date()) {
    return false;
  }

  const isValid = doc.otpHash === hashOtp(normalizedEmail, normalizedOtp);

  if (isValid) {
    await db.collection(OTP_COLLECTION).deleteOne({ email: normalizedEmail });
  }

  return isValid;
}
