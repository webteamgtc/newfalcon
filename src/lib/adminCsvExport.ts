import type { AdminRegistrationListItem } from "@/lib/adminRegistration";
import type { IbEmailListItem } from "@/lib/ibEmailStore";

export type RegistrationExportColumnId =
  | "registrationId"
  | "fullName"
  | "firstName"
  | "lastName"
  | "registrationEmail"
  | "contactEmail"
  | "phone"
  | "memberId"
  | "userId"
  | "ibId"
  | "submittedAt"
  | "adminQualified"
  | "visaStatus"
  | "ticketStatus"
  | "needsReview"
  | "ibClientFirstName"
  | "ibClientEmail"
  | "ibClientMemberId"
  | "ibClientStatus"
  | "ibKycStatus"
  | "ibUserType"
  | "depositUsd"
  | "netDepositUsd"
  | "tradeLots"
  | "withdrawalUsd"
  | "vipStageName"
  | "vipStageNumber"
  | "vipProgressPercent"
  | "vipCapitalCurrent"
  | "vipCapitalPercent"
  | "vipActivityCurrent"
  | "vipActivityPercent"
  | "vipFullyQualified"
  | "vipHasIbData";

export const REGISTRATION_EXPORT_COLUMNS: {
  id: RegistrationExportColumnId;
  label: string;
  group: "core" | "ib" | "vip" | "status";
}[] = [
  { id: "registrationId", label: "Registration ID", group: "core" },
  { id: "fullName", label: "Full name (registration)", group: "core" },
  { id: "firstName", label: "First name (admin)", group: "core" },
  { id: "lastName", label: "Last name (admin)", group: "core" },
  { id: "registrationEmail", label: "Registration email", group: "core" },
  { id: "contactEmail", label: "Contact email", group: "core" },
  { id: "phone", label: "Phone", group: "core" },
  { id: "memberId", label: "Member ID", group: "core" },
  { id: "userId", label: "User ID", group: "core" },
  { id: "ibId", label: "Reference / IB ID", group: "core" },
  { id: "submittedAt", label: "Submitted at", group: "core" },
  { id: "adminQualified", label: "Admin qualified", group: "status" },
  { id: "visaStatus", label: "Visa status", group: "status" },
  { id: "ticketStatus", label: "Ticket status", group: "status" },
  { id: "needsReview", label: "Needs review", group: "status" },
  { id: "ibClientFirstName", label: "IB client first name", group: "ib" },
  { id: "ibClientEmail", label: "IB client email", group: "ib" },
  { id: "ibClientMemberId", label: "IB client member ID", group: "ib" },
  { id: "ibClientStatus", label: "IB client status", group: "ib" },
  { id: "ibKycStatus", label: "IB KYC status", group: "ib" },
  { id: "ibUserType", label: "IB user type", group: "ib" },
  { id: "depositUsd", label: "Deposit (USD)", group: "ib" },
  { id: "netDepositUsd", label: "Net deposit (USD)", group: "ib" },
  { id: "tradeLots", label: "Trade lots", group: "ib" },
  { id: "withdrawalUsd", label: "Withdrawal (USD)", group: "ib" },
  { id: "vipStageName", label: "VIP stage name", group: "vip" },
  { id: "vipStageNumber", label: "VIP stage number", group: "vip" },
  { id: "vipProgressPercent", label: "VIP progress %", group: "vip" },
  { id: "vipCapitalCurrent", label: "VIP net deposit current", group: "vip" },
  { id: "vipCapitalPercent", label: "VIP capital progress %", group: "vip" },
  { id: "vipActivityCurrent", label: "VIP activity current", group: "vip" },
  { id: "vipActivityPercent", label: "VIP activity progress %", group: "vip" },
  { id: "vipFullyQualified", label: "VIP fully qualified", group: "vip" },
  { id: "vipHasIbData", label: "Has IB performance data", group: "vip" },
];

export const REGISTRATION_EXPORT_PRESETS: {
  id: string;
  label: string;
  description: string;
  columns: RegistrationExportColumnId[];
}[] = [
  {
    id: "all",
    label: "All registration data",
    description: "Every column available for VIP registrations",
    columns: REGISTRATION_EXPORT_COLUMNS.map((column) => column.id),
  },
  {
    id: "core",
    label: "Contact & registration",
    description: "Names, emails, phone, IDs, and submit date",
    columns: [
      "registrationId",
      "fullName",
      "firstName",
      "lastName",
      "registrationEmail",
      "contactEmail",
      "phone",
      "memberId",
      "userId",
      "ibId",
      "submittedAt",
    ],
  },
  {
    id: "vip",
    label: "VIP performance",
    description: "IB deposits, lots, and VIP progress fields",
    columns: [
      "registrationEmail",
      "fullName",
      "memberId",
      "ibId",
      "depositUsd",
      "netDepositUsd",
      "tradeLots",
      "withdrawalUsd",
      "vipStageName",
      "vipStageNumber",
      "vipProgressPercent",
      "vipCapitalCurrent",
      "vipCapitalPercent",
      "vipActivityCurrent",
      "vipActivityPercent",
      "vipFullyQualified",
      "vipHasIbData",
    ],
  },
  {
    id: "status",
    label: "Admin status",
    description: "Qualification, visa, ticket, and review flags",
    columns: [
      "registrationEmail",
      "fullName",
      "memberId",
      "submittedAt",
      "adminQualified",
      "visaStatus",
      "ticketStatus",
      "needsReview",
    ],
  },
];

function escapeCsvCell(value: unknown): string {
  if (value == null) return "";
  const str = String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function formatSubmittedAt(value: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toISOString();
}

function yesNo(value: boolean) {
  return value ? "Yes" : "No";
}

export function registrationExportCell(
  item: AdminRegistrationListItem,
  columnId: RegistrationExportColumnId
): string | number {
  const ib = item.ibClient;
  const perf = ib?.performance;
  const vip = item.vipProgress;

  switch (columnId) {
    case "registrationId":
      return item.id;
    case "fullName":
      return item.fullName || `${item.firstName} ${item.lastName}`.trim();
    case "firstName":
      return item.firstName;
    case "lastName":
      return item.lastName;
    case "registrationEmail":
      return item.registrationEmail;
    case "contactEmail":
      return item.email;
    case "phone":
      return item.phone;
    case "memberId":
      return item.memberId;
    case "userId":
      return item.userId;
    case "ibId":
      return item.ibId ?? "";
    case "submittedAt":
      return formatSubmittedAt(item.submittedAt);
    case "adminQualified":
      return item.qualified || "";
    case "visaStatus":
      return item.visaStatus || "";
    case "ticketStatus":
      return item.ticketStatus || "";
    case "needsReview":
      return yesNo(!item.hasAdminDetails);
    case "ibClientFirstName":
      return ib?.client.firstName ?? "";
    case "ibClientEmail":
      return ib?.client.email ?? "";
    case "ibClientMemberId":
      return ib?.client.memberId ?? "";
    case "ibClientStatus":
      return ib?.client.clientStatus ?? "";
    case "ibKycStatus":
      return ib?.client.kycStatus ?? "";
    case "ibUserType":
      return ib?.client.userType ?? "";
    case "depositUsd":
      return perf?.depositUsd ?? "";
    case "netDepositUsd":
      return perf?.netDepositUsd ?? "";
    case "tradeLots":
      return perf?.tradeLots ?? "";
    case "withdrawalUsd":
      return perf?.withdrawalUsd ?? "";
    case "vipStageName":
      return vip.stageName;
    case "vipStageNumber":
      return vip.stageNumber;
    case "vipProgressPercent":
      return vip.progressPercent;
    case "vipCapitalCurrent":
      return vip.capitalCurrent;
    case "vipCapitalPercent":
      return vip.capitalPercent;
    case "vipActivityCurrent":
      return vip.activityCurrent;
    case "vipActivityPercent":
      return vip.activityPercent;
    case "vipFullyQualified":
      return yesNo(vip.isFullyQualified);
    case "vipHasIbData":
      return yesNo(vip.hasPerformanceData);
    default:
      return "";
  }
}

export function buildRegistrationsCsv(
  items: AdminRegistrationListItem[],
  columnIds: RegistrationExportColumnId[]
): string {
  const columns = REGISTRATION_EXPORT_COLUMNS.filter((column) => columnIds.includes(column.id));
  const header = columns.map((column) => escapeCsvCell(column.label)).join(",");
  const rows = items.map((item) =>
    columns
      .map((column) => escapeCsvCell(registrationExportCell(item, column.id)))
      .join(",")
  );

  return [header, ...rows].join("\r\n");
}

export function buildIbEmailCsv(items: IbEmailListItem[]): string {
  const header = ["Email", "IB ID", "First name", "Locale", "Submitted at"]
    .map(escapeCsvCell)
    .join(",");
  const rows = items.map((item) =>
    [
      item.email,
      item.ibId,
      item.firstName,
      item.locale,
      formatSubmittedAt(item.createdAt),
    ]
      .map(escapeCsvCell)
      .join(",")
  );

  return [header, ...rows].join("\r\n");
}

export function downloadCsvFile(filename: string, csvContent: string) {
  const blob = new Blob(["\uFEFF", csvContent], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function csvFilename(prefix: string) {
  const date = new Date();
  const stamp = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
  return `${prefix}-${stamp}.csv`;
}
