import { NextResponse } from "next/server";
import { REGISTRATION_CLOSED_MESSAGE, REGISTRATION_OPEN } from "@/lib/registrationGate";

export function registrationClosedResponse() {
  return NextResponse.json(
    { success: false, message: REGISTRATION_CLOSED_MESSAGE },
    { status: 403 }
  );
}

/** Returns a 403 response when registration is closed, otherwise null. */
export function requireRegistrationOpen(): NextResponse | null {
  if (!REGISTRATION_OPEN) return registrationClosedResponse();
  return null;
}
