/**
 * Seat booking categories for Golden Falcon Awards 2026.
 * Shared by the client form and the API, so keep this file free of server-only imports.
 */

export const SEAT_CATEGORY_SLUGS = [
  "international-employee",
  "uae-employee",
  "vip",
  "media-partners",
] as const;

export type SeatCategorySlug = (typeof SEAT_CATEGORY_SLUGS)[number];

export type SeatCategory = {
  slug: SeatCategorySlug;
  /** Stored on every document so exports stay self-describing. */
  formType: string;
  /** Key under `seatBooking.categories` in messages/*.json */
  i18nKey: "internationalEmployee" | "uaeEmployee" | "vip" | "mediaPartners";
  requiresPassport: boolean;
  /** Show the "Will you join with someone?" question. */
  allowCompanion: boolean;
  /** Media / Partner / Influencer extras: type, organisation, profile link. */
  hasOrganisation: boolean;
  /** VIP: who recommended or invited the guest. */
  collectReferral: boolean;
  defaultPhoneCountry: string;
};

export const SEAT_CATEGORIES: Record<SeatCategorySlug, SeatCategory> = {
  "international-employee": {
    slug: "international-employee",
    formType: "seat_international_employee",
    i18nKey: "internationalEmployee",
    requiresPassport: true,
    allowCompanion: false,
    hasOrganisation: false,
    collectReferral: false,
    defaultPhoneCountry: "AE",
  },
  "uae-employee": {
    slug: "uae-employee",
    // Same formType as the existing staff form so check-status keeps working.
    formType: "staff_registration",
    i18nKey: "uaeEmployee",
    requiresPassport: false,
    allowCompanion: false,
    hasOrganisation: false,
    collectReferral: false,
    defaultPhoneCountry: "AE",
  },
  vip: {
    slug: "vip",
    formType: "seat_vip",
    i18nKey: "vip",
    requiresPassport: true,
    allowCompanion: true,
    hasOrganisation: false,
    collectReferral: true,
    defaultPhoneCountry: "AE",
  },
  "media-partners": {
    slug: "media-partners",
    formType: "seat_media_partner",
    i18nKey: "mediaPartners",
    requiresPassport: true,
    allowCompanion: true,
    hasOrganisation: true,
    collectReferral: false,
    defaultPhoneCountry: "AE",
  },
};

export const MEDIA_PARTNER_TYPES = ["media", "partner", "influencer"] as const;
export type MediaPartnerType = (typeof MEDIA_PARTNER_TYPES)[number];

export const COMPANION_RELATIONSHIPS = [
  "spouse",
  "family",
  "colleague",
  "friend",
  "other",
] as const;
export type CompanionRelationship = (typeof COMPANION_RELATIONSHIPS)[number];

export const PASSPORT_ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
] as const;

export const PASSPORT_MAX_BYTES = 10 * 1024 * 1024;

/** Event day; passports should stay valid at least 6 months beyond it for UAE entry. */
export const EVENT_DATE_ISO = "2026-12-12";

export function isSeatCategorySlug(value: string): value is SeatCategorySlug {
  return (SEAT_CATEGORY_SLUGS as readonly string[]).includes(value);
}

export function getSeatCategory(slug: string): SeatCategory | null {
  return isSeatCategorySlug(slug) ? SEAT_CATEGORIES[slug] : null;
}

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PASSPORT_NUMBER_PATTERN = /^[A-Z0-9]{5,20}$/;

export function normalizePassportNumber(value: string) {
  return value.replace(/[\s-]+/g, "").toUpperCase();
}
