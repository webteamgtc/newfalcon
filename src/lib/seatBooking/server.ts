import crypto from "crypto";
import type { Collection, Document } from "mongodb";
import { getRegistrationDb } from "@/lib/mongodb";
import type { SeatCategorySlug } from "@/lib/seatBooking/categories";

/**
 * One MongoDB collection per category. Override with env vars if needed.
 */
const COLLECTION_NAMES: Record<SeatCategorySlug, string> = {
  "international-employee":
    process.env.MONGODB_SEAT_INTL_EMPLOYEE_COLLECTION || "seat_international_employee",
  // Shared with the existing staff form and check-status page.
  "uae-employee":
    process.env.MONGODB_SEAT_UAE_EMPLOYEE_COLLECTION ||
    process.env.MONGODB_STAFF_COLLECTION ||
    "staff_registration",
  vip: process.env.MONGODB_SEAT_VIP_COLLECTION || "seat_vip",
  "partner-ib":
    process.env.MONGODB_SEAT_PARTNER_IB_COLLECTION || "seat_partner_ib",
  "media-partners": process.env.MONGODB_SEAT_MEDIA_PARTNER_COLLECTION || "seat_media_partner",
};

export function getSeatCollectionName(slug: SeatCategorySlug) {
  return COLLECTION_NAMES[slug];
}

declare global {
  // eslint-disable-next-line no-var
  var _seatIndexesReady: Set<string> | undefined;
}

export async function getSeatCollection(slug: SeatCategorySlug): Promise<Collection<Document>> {
  const db = await getRegistrationDb();
  const name = getSeatCollectionName(slug);
  const collection = db.collection(name);

  global._seatIndexesReady ??= new Set();
  if (!global._seatIndexesReady.has(name)) {
    // Never block a registration because an index can't be built
    // (e.g. older data in a shared collection already has duplicate emails).
    try {
      await collection.createIndex({ email: 1 }, { unique: true, name: "email_unique" });
    } catch (error) {
      console.warn(`Seat booking: unique email index not created on ${name}:`, error);
    }
    try {
      await collection.createIndex({ submittedAt: -1 }, { name: "submitted_at" });
    } catch (error) {
      console.warn(`Seat booking: submittedAt index not created on ${name}:`, error);
    }
    global._seatIndexesReady.add(name);
  }

  return collection;
}

/* ------------------------------------------------------------------ */
/* Email proof token: issued after OTP verification, required on submit */
/* ------------------------------------------------------------------ */

const PROOF_TTL_MS = 45 * 60 * 1000;

function getProofSecret() {
  const secret = process.env.OTP_SECRET?.trim();
  if (!secret) throw new Error("Missing OTP_SECRET environment variable");
  return secret;
}

function signProof(encoded: string) {
  return crypto
    .createHmac("sha256", getProofSecret())
    .update(`seat-proof:${encoded}`)
    .digest("base64url");
}

export function createEmailProofToken(email: string) {
  const payload = JSON.stringify({ e: email.trim().toLowerCase(), exp: Date.now() + PROOF_TTL_MS });
  const encoded = Buffer.from(payload).toString("base64url");
  return `${encoded}.${signProof(encoded)}`;
}

export function verifyEmailProofToken(token: string | null | undefined, email: string) {
  if (!token || !token.includes(".")) return false;
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return false;

  const expected = signProof(encoded);
  if (
    signature.length !== expected.length ||
    !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
  ) {
    return false;
  }

  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as {
      e?: string;
      exp?: number;
    };
    return payload.e === email.trim().toLowerCase() && !!payload.exp && Date.now() < payload.exp;
  } catch {
    return false;
  }
}

/* ------------------------------------------------------------------ */
/* Best-effort in-memory rate limiting (per server process).          */
/* For multiple instances, swap for Redis/Upstash.                    */
/* ------------------------------------------------------------------ */

declare global {
  // eslint-disable-next-line no-var
  var _seatRateBuckets: Map<string, number[]> | undefined;
}

export function rateLimit(key: string, limit: number, windowMs: number) {
  global._seatRateBuckets ??= new Map();
  const buckets = global._seatRateBuckets;
  const now = Date.now();
  const hits = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);

  if (hits.length >= limit) {
    buckets.set(key, hits);
    const retryAfterMs = windowMs - (now - hits[0]);
    return { ok: false as const, retryAfterSeconds: Math.ceil(retryAfterMs / 1000) };
  }

  hits.push(now);
  buckets.set(key, hits);

  if (buckets.size > 5000) {
    buckets.forEach((value, k) => {
      if (!value.some((t) => now - t < windowMs)) buckets.delete(k);
    });
  }

  return { ok: true as const };
}

export function getClientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") || request.headers.get("cf-connecting-ip") || "unknown";
}
