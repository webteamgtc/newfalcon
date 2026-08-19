import crypto from "crypto";
import { cookies } from "next/headers";

export const ADMIN_SESSION_COOKIE = "gfn_admin_session";
const SESSION_TTL_MS = 24 * 60 * 60 * 1000;

function getSessionSecret() {
  const secret =
    process.env.ADMIN_SESSION_SECRET?.trim() || process.env.OTP_SECRET?.trim();
  if (secret) return secret;
  throw new Error("Missing ADMIN_SESSION_SECRET or OTP_SECRET environment variable");
}

export function getAdminCredentials() {
  return {
    email: process.env.ADMIN_EMAIL?.trim().toLowerCase() || "admin@gtcfx.com",
    password: process.env.ADMIN_PASSWORD?.trim() || "admin123",
  };
}

export function verifyAdminCredentials(email: string, password: string) {
  const admin = getAdminCredentials();
  return (
    email.trim().toLowerCase() === admin.email && password === admin.password
  );
}

function signPayload(payload: string) {
  return crypto.createHmac("sha256", getSessionSecret()).update(payload).digest("hex");
}

export function createAdminSessionToken(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const payload = JSON.stringify({
    email: normalizedEmail,
    exp: Date.now() + SESSION_TTL_MS,
  });
  const encoded = Buffer.from(payload).toString("base64url");
  const signature = signPayload(encoded);
  return `${encoded}.${signature}`;
}

export function verifyAdminSessionToken(token: string | undefined | null) {
  if (!token?.includes(".")) return null;

  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return null;

  const expected = signPayload(encoded);
  if (
    signature.length !== expected.length ||
    !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as {
      email?: string;
      exp?: number;
    };

    if (!payload.email || !payload.exp || Date.now() > payload.exp) {
      return null;
    }

    return { email: payload.email };
  } catch {
    return null;
  }
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  return verifyAdminSessionToken(token);
}

export function adminSessionCookieOptions(token: string) {
  return {
    name: ADMIN_SESSION_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  };
}
