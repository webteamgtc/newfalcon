import type { AdminSeatListKey, AdminSeatRegistrationListItem } from "@/lib/adminSeatRegistrations";
import { csvFilename, downloadCsvFile } from "@/lib/adminCsvExport";

function escapeCsvCell(value: unknown): string {
  if (value == null) return "";
  const str = String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

type SeatExportColumn = {
  label: string;
  value: (item: AdminSeatRegistrationListItem) => string;
};

function formatSubmittedAt(value: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toISOString();
}

function seatExportColumns(listKey: AdminSeatListKey): SeatExportColumn[] {
  const columns: SeatExportColumn[] = [
    { label: "Record ID", value: (i) => i.id },
    { label: "Reference", value: (i) => i.reference },
    { label: "Full name", value: (i) => i.displayName },
    { label: "Email", value: (i) => i.email },
    { label: "Phone", value: (i) => i.phone },
    { label: "Country", value: (i) => i.country },
    { label: "Status", value: (i) => i.status },
    { label: "Source", value: (i) => i.source },
    { label: "Form type", value: (i) => i.formType },
    { label: "Submitted at", value: (i) => formatSubmittedAt(i.submittedAt) },
  ];

  if (listKey === "uae-employee") {
    columns.push({ label: "Line manager", value: (i) => i.lineManagerName });
  }

  if (listKey === "seat-vip") {
    columns.push({ label: "Who recommended you", value: (i) => i.referredBy });
    columns.push({ label: "Joining with someone", value: (i) => i.joiningWithSomeone });
    columns.push({ label: "Companion name", value: (i) => i.companionName });
  }

  if (listKey === "media-partners") {
    columns.push({ label: "Partner type", value: (i) => i.partnerType });
    columns.push({ label: "Organisation", value: (i) => i.organisationName });
    columns.push({ label: "Profile link", value: (i) => i.profileLink });
  }

  if (listKey !== "uae-employee") {
    columns.push(
      { label: "Passport number", value: (i) => i.passportNumber },
      { label: "Passport expiry", value: (i) => i.passportExpiry },
      { label: "Passport file name", value: (i) => i.passportFile?.fileName ?? "" }
    );
  }

  if (listKey === "seat-vip") {
    columns.push({
      label: "Companion passport file name",
      value: (i) => i.companionPassportFile?.fileName ?? "",
    });
  }

  return columns;
}

export function buildSeatRegistrationsCsv(
  listKey: AdminSeatListKey,
  items: AdminSeatRegistrationListItem[]
): string {
  const columns = seatExportColumns(listKey);
  const header = columns.map((column) => escapeCsvCell(column.label)).join(",");
  const rows = items.map((item) =>
    columns.map((column) => escapeCsvCell(column.value(item))).join(",")
  );
  return [header, ...rows].join("\r\n");
}

export function downloadSeatRegistrationsCsv(
  listKey: AdminSeatListKey,
  items: AdminSeatRegistrationListItem[]
) {
  if (items.length === 0) return;
  const csv = buildSeatRegistrationsCsv(listKey, items);
  downloadCsvFile(csvFilename(`gfn-seat-${listKey}`), csv);
}
