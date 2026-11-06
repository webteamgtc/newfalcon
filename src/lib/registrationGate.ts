/**
 * Public registration (Book Your Seat, VIP / check-status form, staff).
 * Set NEXT_PUBLIC_REGISTRATION_OPEN=true in the environment to reopen.
 */
export const REGISTRATION_OPEN = process.env.NEXT_PUBLIC_REGISTRATION_OPEN === "true";

export const REGISTRATION_CLOSED_MESSAGE = "Registration is closed.";
