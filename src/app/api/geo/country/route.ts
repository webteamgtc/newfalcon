import { NextRequest, NextResponse } from "next/server";
import { getCountryCode } from "@/lib/localeDetection";

const UNKNOWN_COUNTRY_CODES = new Set(["", "XX", "T1"]);

export async function GET(request: NextRequest) {
  const countryCode = getCountryCode(request);

  if (!countryCode || UNKNOWN_COUNTRY_CODES.has(countryCode)) {
    return NextResponse.json({ countryCode: null });
  }

  return NextResponse.json({ countryCode });
}
