const UNKNOWN_COUNTRY_CODES = new Set(["", "XX", "T1"]);

export async function detectClientCountryCode(): Promise<string | null> {
  try {
    const response = await fetch("/api/geo/country");
    if (response.ok) {
      const data = (await response.json()) as { countryCode?: string | null };
      const code = data.countryCode?.toUpperCase();
      if (code && !UNKNOWN_COUNTRY_CODES.has(code)) {
        return code;
      }
    }
  } catch {
    // fall through to client trace lookup
  }

  try {
    const response = await fetch("https://www.cloudflare.com/cdn-cgi/trace");
    const text = await response.text();
    const match = text.match(/^loc=(.+)$/m);
    const code = match?.[1]?.trim().toUpperCase();
    if (code && !UNKNOWN_COUNTRY_CODES.has(code)) {
      return code;
    }
  } catch {
    // ignore
  }

  return null;
}

export function resolveCountryNameByCode<T extends { name: string; code?: string }>(
  countries: T[],
  countryCode?: string | null
): string | null {
  if (!countryCode) return null;

  const normalized = countryCode.toUpperCase();
  return countries.find((country) => country.code?.toUpperCase() === normalized)?.name ?? null;
}
