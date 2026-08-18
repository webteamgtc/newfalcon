import crypto from "crypto";

export const OTP_TTL_MS = 10 * 60 * 1000;

function getOtpSecret() {
  const secret = process.env.OTP_SECRET?.trim();
  if (secret) return secret;
  throw new Error("Missing OTP_SECRET environment variable");
}

function getEncryptionKey() {
  return crypto.createHash("sha256").update(getOtpSecret()).digest();
}

function hashOtp(email: string, otp: string) {
  return crypto
    .createHmac("sha256", getOtpSecret())
    .update(`${email.toLowerCase()}:${otp}`)
    .digest("hex");
}

export function generateRandomOtp() {
  return crypto.randomInt(0, 1_000_000).toString().padStart(6, "0");
}

export function createVerificationToken(email: string, otp: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const payload = JSON.stringify({
    e: normalizedEmail,
    h: hashOtp(normalizedEmail, otp),
    exp: Date.now() + OTP_TTL_MS,
  });

  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", getEncryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(payload, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return Buffer.concat([iv, authTag, encrypted]).toString("base64url");
}

export function verifyOtpWithToken(email: string, otp: string, token: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedOtp = otp.trim();

  if (!/^\d{6}$/.test(normalizedOtp) || !token?.trim()) {
    return false;
  }

  try {
    const data = Buffer.from(token, "base64url");
    const iv = data.subarray(0, 12);
    const authTag = data.subarray(12, 28);
    const encrypted = data.subarray(28);

    const decipher = crypto.createDecipheriv("aes-256-gcm", getEncryptionKey(), iv);
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]).toString(
      "utf8"
    );
    const payload = JSON.parse(decrypted) as {
      e: string;
      h: string;
      exp: number;
    };

    if (payload.e !== normalizedEmail) return false;
    if (Date.now() > payload.exp) return false;
    if (payload.h !== hashOtp(normalizedEmail, normalizedOtp)) return false;

    return true;
  } catch {
    return false;
  }
}

/** @deprecated Use verifyOtpWithToken instead. */
export async function verifyStoredOtp(email: string, otp: string) {
  return verifyOtpWithToken(email, otp, "");
}

/** @deprecated Stateless OTP no longer needs storage. */
export async function storeOtp(_email: string, _otp: string) {
  return;
}

/** @deprecated Use generateRandomOtp instead. */
export function generateOtp(_email: string) {
  return generateRandomOtp();
}
