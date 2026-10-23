/** Client-safe types and labels for admin seat registration tabs. */

export const ADMIN_SEAT_LIST_KEYS = [
  "uae-employee",
  "international-employee",
  "media-partners",
  "seat-vip",
  "partner-ib",
] as const;

export type AdminSeatListKey = (typeof ADMIN_SEAT_LIST_KEYS)[number];

export type AdminSeatDocumentFile = {
  fileName: string;
  mimeType: string;
  s3Key: string;
};

export type AdminSeatRegistrationListItem = {
  id: string;
  reference: string;
  displayName: string;
  email: string;
  phone: string;
  country: string;
  status: string;
  formType: string;
  source: string;
  lineManagerName: string;
  referredBy: string;
  partnerType: string;
  organisationName: string;
  profileLink: string;
  passportNumber: string;
  passportExpiry: string;
  passportFile: AdminSeatDocumentFile | null;
  companionPassportFile: AdminSeatDocumentFile | null;
  joiningWithSomeone: string;
  companionName: string;
  submittedAt: string;
};

export const ADMIN_SEAT_LIST_META: Record<
  AdminSeatListKey,
  { label: string; collectionHint: string; description: string }
> = {
  "uae-employee": {
    label: "UAE Based Employee",
    collectionHint: "staff_registration",
    description: "Staff and UAE-based seat bookings",
  },
  "international-employee": {
    label: "International Employee",
    collectionHint: "seat_international_employee",
    description: "International employee seat registrations",
  },
  "media-partners": {
    label: "Media / Influencer",
    collectionHint: "seat_media_partner",
    description: "Media, partners and influencers",
  },
  "seat-vip": {
    label: "VIP (Book Your Seat)",
    collectionHint: "seat_vip",
    description: "VIP seat bookings from /book-your-seat/vip — includes who recommended them",
  },
  "partner-ib": {
    label: "Partner / IB (Book Your Seat)",
    collectionHint: "seat_partner_ib",
    description: "Partner and IB seat bookings from /book-your-seat/partner-ib",
  },
};

export function isAdminSeatListKey(value: string): value is AdminSeatListKey {
  return (ADMIN_SEAT_LIST_KEYS as readonly string[]).includes(value);
}
