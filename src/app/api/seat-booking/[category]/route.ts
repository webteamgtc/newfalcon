import crypto from "crypto";
import { NextResponse } from "next/server";
import { isValidPhoneNumber } from "libphonenumber-js";
import { uploadPassportFile, type StoredPassportFile } from "@/lib/s3";
import {
  COMPANION_RELATIONSHIPS,
  EMAIL_PATTERN,
  MEDIA_PARTNER_TYPES,
  PASSPORT_ALLOWED_TYPES,
  PASSPORT_MAX_BYTES,
  PASSPORT_NUMBER_PATTERN,
  getSeatCategory,
  normalizePassportNumber,
  type SeatCategory,
} from "@/lib/seatBooking/categories";
import {
  getClientIp,
  getSeatCollection,
  rateLimit,
  verifyEmailProofToken,
} from "@/lib/seatBooking/server";
import { normalizeEmailLocale, sendSeatReceivedEmail } from "@/lib/seatBooking/emails";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type FieldErrors = Record<string, string>;

const CATEGORY_LABELS: Record<SeatCategory["i18nKey"], { en: string; zh: string }> = {
  internationalEmployee: { en: "International Employee", zh: "国际员工" },
  uaeEmployee: { en: "UAE-Based Employee", zh: "阿联酋员工" },
  vip: { en: "VIP Guest", zh: "VIP 嘉宾" },
  partner: { en: "Partner", zh: "合作伙伴" },
  mediaPartners: { en: "Media, Partner & Influencer", zh: "媒体、合作伙伴与达人" },
};

function text(form: FormData, key: string, max = 200) {
  const value = form.get(key);
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function isFutureIsoDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return false;
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  return date.getTime() > today.getTime();
}

/** Check the real file signature, not just the browser-reported MIME type. */
async function sniffFileType(file: File) {
  const head = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const hex = Array.from(head, (b) => b.toString(16).padStart(2, "0")).join("");
  if (hex.startsWith("ffd8ff")) return "image/jpeg";
  if (hex.startsWith("89504e47")) return "image/png";
  if (hex.startsWith("25504446")) return "application/pdf";
  if (hex.startsWith("52494646") && hex.slice(16, 24) === "57454250") return "image/webp";
  return null;
}

async function checkPassportFile(entry: FormDataEntryValue | null): Promise<File | string> {
  if (!(entry instanceof File) || entry.size === 0) return "PASSPORT_FILE_REQUIRED";
  if (entry.size > PASSPORT_MAX_BYTES) return "PASSPORT_FILE_TOO_LARGE";
  const sniffed = await sniffFileType(entry);
  if (!sniffed || !(PASSPORT_ALLOWED_TYPES as readonly string[]).includes(sniffed)) {
    return "PASSPORT_FILE_TYPE";
  }
  return entry;
}

function isDuplicateKeyError(error: unknown) {
  return typeof error === "object" && error !== null && (error as { code?: number }).code === 11000;
}

function makeReference() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.randomBytes(6);
  return `GFA-${Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("")}`;
}

export async function POST(
  request: Request,
  { params }: { params: { category: string } }
) {
  const category = getSeatCategory(params.category);
  if (!category) {
    return NextResponse.json({ success: false, code: "UNKNOWN_CATEGORY" }, { status: 404 });
  }

  const limit = rateLimit(`seat-submit-ip:${getClientIp(request)}`, 10, 10 * 60_000);
  if (!limit.ok) {
    return NextResponse.json({ success: false, code: "RATE_LIMITED" }, { status: 429 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ success: false, code: "BAD_REQUEST" }, { status: 400 });
  }

  const errors: FieldErrors = {};
  const locale = normalizeEmailLocale(text(form, "locale", 10));

  const fullName = text(form, "fullName", 120);
  const email = text(form, "email", 254).toLowerCase();
  const phone = text(form, "phone", 30);
  const countryOfResidence = text(form, "countryOfResidence", 2).toUpperCase();
  const proofToken = text(form, "proofToken", 600);

  if (fullName.length < 2) errors.fullName = "REQUIRED";
  if (!EMAIL_PATTERN.test(email)) errors.email = "INVALID";
  if (!phone || !isValidPhoneNumber(phone)) errors.phone = "INVALID";
  if (!/^[A-Z]{2}$/.test(countryOfResidence)) errors.countryOfResidence = "REQUIRED";
  let referredBy = "";
  if (category.collectReferral) {
    referredBy = text(form, "referredBy", 120);
    if (referredBy.length < 2) errors.referredBy = "REQUIRED";
  }
  if (text(form, "consent", 10) !== "true") errors.consent = "REQUIRED";

  if (!errors.email && !verifyEmailProofToken(proofToken, email)) {
    return NextResponse.json({ success: false, code: "EMAIL_NOT_VERIFIED" }, { status: 401 });
  }

  // Passport (primary guest)
  let passportNumber = "";
  let passportExpiry = "";
  let passportFile: File | null = null;
  if (category.requiresPassport) {
    passportNumber = normalizePassportNumber(text(form, "passportNumber", 30));
    passportExpiry = text(form, "passportExpiry", 10);
    if (!PASSPORT_NUMBER_PATTERN.test(passportNumber)) errors.passportNumber = "INVALID";
    if (!isFutureIsoDate(passportExpiry)) errors.passportExpiry = "INVALID";
    const checked = await checkPassportFile(form.get("passportFile"));
    if (typeof checked === "string") errors.passportFile = checked;
    else passportFile = checked;
  }

  // Media / Partner / Influencer extras
  let organisation: Record<string, string> | null = null;
  if (category.hasOrganisation) {
    const partnerType = text(form, "partnerType", 20);
    const organisationName = text(form, "organisation", 150);
    const profileLink = text(form, "profileLink", 300);
    if (!(MEDIA_PARTNER_TYPES as readonly string[]).includes(partnerType)) {
      errors.partnerType = "REQUIRED";
    }
    if (organisationName.length < 2) errors.organisation = "REQUIRED";
    if (profileLink && !/^https?:\/\/\S+$/i.test(profileLink)) errors.profileLink = "INVALID";
    organisation = { partnerType, organisation: organisationName, profileLink };
  }

  // Companion
  const joiningWithSomeone = category.allowCompanion && text(form, "joiningWithSomeone", 3) === "yes";
  let companion: Record<string, unknown> | null = null;
  let companionPassportFile: File | null = null;
  if (joiningWithSomeone) {
    const cFullName = text(form, "companionFullName", 120);
    const cRelationship = text(form, "companionRelationship", 20);
    const cEmail = text(form, "companionEmail", 254).toLowerCase();
    const cPhone = text(form, "companionPhone", 30);

    if (cFullName.length < 2) errors.companionFullName = "REQUIRED";
    if (!(COMPANION_RELATIONSHIPS as readonly string[]).includes(cRelationship)) {
      errors.companionRelationship = "REQUIRED";
    }
    if (!EMAIL_PATTERN.test(cEmail)) errors.companionEmail = "INVALID";
    else if (cEmail === email) errors.companionEmail = "SAME_AS_PRIMARY";
    if (!cPhone || !isValidPhoneNumber(cPhone)) errors.companionPhone = "INVALID";

    companion = {
      fullName: cFullName,
      relationship: cRelationship,
      email: cEmail,
      phone: cPhone,
    };

    if (category.requiresPassport) {
      const cPassportNumber = normalizePassportNumber(text(form, "companionPassportNumber", 30));
      const cPassportExpiry = text(form, "companionPassportExpiry", 10);
      if (!PASSPORT_NUMBER_PATTERN.test(cPassportNumber)) errors.companionPassportNumber = "INVALID";
      if (!isFutureIsoDate(cPassportExpiry)) errors.companionPassportExpiry = "INVALID";
      const checked = await checkPassportFile(form.get("companionPassportFile"));
      if (typeof checked === "string") errors.companionPassportFile = checked;
      else companionPassportFile = checked;
      companion.passportNumber = cPassportNumber;
      companion.passportExpiry = cPassportExpiry;
    }
  }

  if (Object.keys(errors).length) {
    return NextResponse.json({ success: false, code: "VALIDATION", errors }, { status: 400 });
  }

  try {
    const collection = await getSeatCollection(category.slug);

    if (await collection.findOne({ email }, { projection: { _id: 1 } })) {
      return NextResponse.json({ success: false, code: "ALREADY_REGISTERED" }, { status: 409 });
    }

    let storedPassport: StoredPassportFile | null = null;
    let storedCompanionPassport: StoredPassportFile | null = null;
    if (passportFile) storedPassport = await uploadPassportFile(passportFile, email, "primary");
    if (companionPassportFile && companion) {
      storedCompanionPassport = await uploadPassportFile(companionPassportFile, email, "guest");
    }

    const reference = makeReference();
    const now = new Date();

    const document = {
      reference,
      formType: category.formType,
      category: category.slug,
      status: "pending_review",
      fullName,
      // Existing staff_registration readers (check-status, emails) use firstName.
      ...(category.slug === "uae-employee" && { firstName: fullName }),
      email,
      emailVerified: true,
      source: "book-your-seat",
      phone,
      countryOfResidence,
      ...(category.collectReferral && { referredBy }),
      ...(category.requiresPassport && {
        passport: { number: passportNumber, expiry: passportExpiry, file: storedPassport },
      }),
      ...(organisation && organisation),
      ...(category.allowCompanion && {
        joiningWithSomeone,
        companion: companion
          ? {
              ...companion,
              ...(storedCompanionPassport && { passportFile: storedCompanionPassport }),
            }
          : null,
      }),
      consentAt: now,
      locale,
      submittedAt: now,
      updatedAt: now,
    };

    await collection.insertOne(document);

    sendSeatReceivedEmail({
      to: email,
      name: fullName,
      categoryLabel: CATEGORY_LABELS[category.i18nKey][locale],
      reference,
      locale,
    }).catch((error) => console.error("Seat booking confirmation email failed:", error));

    return NextResponse.json({ success: true, reference });
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      return NextResponse.json({ success: false, code: "ALREADY_REGISTERED" }, { status: 409 });
    }
    console.error("Seat booking save error:", error);
    return NextResponse.json({ success: false, code: "SAVE_FAILED" }, { status: 500 });
  }
}
