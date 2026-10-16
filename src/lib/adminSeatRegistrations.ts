/** Client-safe types and labels for admin seat registration tabs. */

export const ADMIN_SEAT_LIST_KEYS = [
  "uae-employee",
  "international-employee",
  "media-partners",
  "seat-vip",
] as const;

export type AdminSeatListKey = (typeof ADMIN_SEAT_LIST_KEYS)[number];

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
  partnerType: string;
  organisationName: string;
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
    label: "VIP Registration",
    collectionHint: "seat_vip",
    description: "VIP guest seat bookings",
  },
};

export function isAdminSeatListKey(value: string): value is AdminSeatListKey {
  return (ADMIN_SEAT_LIST_KEYS as readonly string[]).includes(value);
}
