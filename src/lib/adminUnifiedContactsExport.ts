export type UnifiedContactRow = {
  fullName: string;
  email: string;
  country: string;
  market: "China" | "Other";
  registrationType: string;
};

export function isChinaMarket(country: string): boolean {
  const raw = country.trim();
  if (!raw) return false;

  const lower = raw.toLowerCase();
  if (lower === "cn" || lower === "china" || lower === "prc") return true;
  if (lower.includes("china") || lower.includes("mainland")) return true;
  if (raw.includes("中国")) return true;

  return false;
}

export function marketFromCountry(country: string): "China" | "Other" {
  return isChinaMarket(country) ? "China" : "Other";
}

function escapeCsvCell(value: unknown): string {
  if (value == null) return "";
  const str = String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function buildUnifiedContactsCsv(rows: UnifiedContactRow[]): string {
  const header = ["Full Name", "Email", "Country", "Market", "Registration type"]
    .map(escapeCsvCell)
    .join(",");

  const lines = rows.map((row) =>
    [
      row.fullName,
      row.email,
      row.country,
      row.market,
      row.registrationType,
    ]
      .map(escapeCsvCell)
      .join(",")
  );

  return [header, ...lines].join("\r\n");
}

export function unifiedContactsCsvFilename() {
  const stamp = new Date().toISOString().slice(0, 10);
  return `gfn-all-registrations-contacts-${stamp}.csv`;
}
