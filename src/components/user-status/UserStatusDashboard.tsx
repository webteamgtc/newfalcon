"use client";

import { Suspense, useEffect, useState, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import type {
  PublicAdminStatus,
  PublicGuestAdminStatus,
  PublicPassportDocument,
  PublicUserRegistration,
} from "@/lib/userStatus";

/* ─── helpers ─── */

function formatDisplayDate(value: string, locale: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-AE" : "en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatDisplayDateTime(value: string, locale: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-AE" : "en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

type StatusTone = "neutral" | "pending" | "progress" | "success" | "danger";

function statusTone(value: string, type: "qualification" | "visa" | "ticket"): StatusTone {
  if (!value) return "neutral";
  if (type === "qualification") {
    if (value === "qualified") return "success";
    if (value === "not_yet_reached") return "pending";
  }
  if (type === "visa") {
    if (value === "approved") return "success";
    if (value === "rejected") return "danger";
    if (value === "under_processing" || value === "applied") return "progress";
  }
  if (type === "ticket") {
    if (value === "confirmed") return "success";
    if (value === "cancelled") return "danger";
    if (value === "requested" || value === "under_process") return "progress";
  }
  return "pending";
}

const toneDot: Record<StatusTone, string> = {
  neutral: "bg-ink/30",
  pending: "bg-amber-400",
  progress: "bg-sky-500",
  success: "bg-emerald-500",
  danger: "bg-red-500",
};

const toneRing: Record<StatusTone, string> = {
  neutral: "border-ink/20 bg-ink/5",
  pending: "border-amber-300 bg-amber-50",
  progress: "border-sky-300 bg-sky-50",
  success: "border-emerald-300 bg-emerald-50",
  danger: "border-red-300 bg-red-50",
};

const toneText: Record<StatusTone, string> = {
  neutral: "text-ink/50",
  pending: "text-amber-800",
  progress: "text-sky-800",
  success: "text-emerald-800",
  danger: "text-red-800",
};

/* ─── icons ─── */

function IconFile({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
    </svg>
  );
}

function IconHotel({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205 3 1m1.5.5-1.5-.5M6.75 7.364V3h-3v18m3-13.636 10.5-3.819" />
    </svg>
  );
}

function IconCar({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
    </svg>
  );
}

function IconPlane({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875 5.25 5.25 0 0 1 6 12Zm0 0h7.5" />
    </svg>
  );
}

function IconChevron({ open }: { open: boolean }) {
  return (
    <svg
      className={`h-4 w-4 text-falcon-deep transition-transform ${open ? "rotate-180" : ""}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
    </svg>
  );
}

/* ─── sub-components ─── */

function SectionCard({
  icon,
  title,
  subtitle,
  children,
  className = "",
}: {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl border border-[#382910]/10 bg-white shadow-[0_4px_24px_-4px_rgba(56,41,16,0.08)] ${className}`}>
      <div className="border-b border-ink/8 px-6 py-5 md:px-8">
        <div className="flex items-start gap-3">
          {icon && (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-falcon-deep/10 text-falcon-deep">
              {icon}
            </div>
          )}
          <div>
            <h3 className="font-display text-xl text-ink">{title}</h3>
            {subtitle && (
              <p className="mt-1 font-poppins text-sm leading-relaxed text-ink/55">{subtitle}</p>
            )}
          </div>
        </div>
      </div>
      <div className="px-6 py-5 md:px-8">{children}</div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed border-ink/15 bg-[#FFFDF8] px-6 py-10 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-ink/5 text-ink/30">
        <IconFile className="h-6 w-6" />
      </div>
      <p className="mt-4 max-w-xs font-poppins text-sm leading-relaxed text-ink/50">{message}</p>
    </div>
  );
}

function MetaChip({ label, value }: { label: string; value: string }) {
  if (!value?.trim()) return null;
  return (
    <div className="rounded-lg bg-white/60 px-3 py-2">
      <p className="font-poppins text-[10px] uppercase tracking-[0.1em] text-ink/45">{label}</p>
      <p className="mt-0.5 font-poppins text-sm font-medium text-ink">{value}</p>
    </div>
  );
}

function ProgressTimeline({
  steps,
}: {
  steps: {
    label: string;
    status: string;
    tone: StatusTone;
    hint: string;
    done: boolean;
  }[];
}) {
  const completedCount = steps.filter((s) => s.tone === "success").length;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <p className="font-poppins text-xs uppercase tracking-[0.1em] text-ink/45">
          {completedCount} / {steps.length} complete
        </p>
        <div className="h-1.5 w-32 overflow-hidden rounded-full bg-ink/10">
          <div
            className="h-full rounded-full bg-falcon-deep transition-all duration-500"
            style={{ width: `${(completedCount / steps.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="relative grid gap-0 md:grid-cols-3">
        {steps.map((step, index) => (
          <div key={step.label} className="relative flex md:flex-col md:items-center md:text-center">
            {index < steps.length - 1 && (
              <div className="absolute left-[19px] top-10 hidden h-full w-px bg-ink/15 md:left-1/2 md:top-5 md:block md:h-px md:w-full md:-translate-x-0" />
            )}

            <div className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 ${toneRing[step.tone]}`}>
              {step.tone === "success" ? (
                <svg className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
              ) : (
                <span className={`h-2.5 w-2.5 rounded-full ${toneDot[step.tone]}`} />
              )}
            </div>

            <div className="ms-4 min-w-0 flex-1 pb-6 md:ms-0 md:mt-3 md:pb-0 md:px-2">
              <p className="font-poppins text-xs uppercase tracking-[0.08em] text-ink/45">
                Step {index + 1}
              </p>
              <p className="mt-0.5 font-poppins text-sm font-semibold text-ink">{step.label}</p>
              <p className={`mt-1 font-poppins text-xs font-medium ${toneText[step.tone]}`}>
                {step.status}
              </p>
              <p className="mt-1.5 font-poppins text-xs leading-relaxed text-ink/50">{step.hint}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DocumentCard({
  label,
  document,
  actionLabel,
}: {
  label: string;
  document?: PublicPassportDocument;
  actionLabel: string;
}) {
  if (!document?.uploaded || !document.url) return null;

  const isPdf = document.mimeType === "application/pdf";
  const ext = isPdf ? "PDF" : "IMG";

  return (
    <a
      href={document.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-4 rounded-xl border border-ink/10 bg-[#FFFDF8] p-4 transition-all hover:border-falcon-deep/40 hover:shadow-md"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-falcon-deep/10 font-poppins text-[10px] font-bold tracking-wider text-falcon-deep">
        {ext}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-poppins text-sm font-medium text-ink">{label}</p>
        {document.fileName && (
          <p className="mt-0.5 truncate font-poppins text-xs text-ink/50">{document.fileName}</p>
        )}
      </div>
      <span className="shrink-0 rounded-full bg-falcon-deep px-3 py-1.5 font-poppins text-[10px] uppercase tracking-[0.08em] text-white opacity-0 transition-opacity group-hover:opacity-100">
        {actionLabel}
      </span>
      <svg className="h-4 w-4 shrink-0 text-ink/30 group-hover:text-falcon-deep" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5M10.5 13.5 21 3m0 0h-5.25M21 3v5.25" />
      </svg>
    </a>
  );
}

function DetailGrid({ items }: { items: { label: string; value: string }[] }) {
  const visible = items.filter((item) => item.value?.trim());
  if (!visible.length) return null;

  return (
    <dl className="grid gap-3 sm:grid-cols-2">
      {visible.map((item) => (
        <div key={item.label} className="rounded-lg bg-[#FFFDF8] px-4 py-3">
          <dt className="font-poppins text-[10px] uppercase tracking-[0.1em] text-ink/45">{item.label}</dt>
          <dd className="mt-1 font-poppins text-sm text-ink">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-48 rounded-2xl bg-ink/5" />
      <div className="h-64 rounded-2xl bg-ink/5" />
      <div className="grid gap-6 md:grid-cols-2">
        <div className="h-40 rounded-2xl bg-ink/5" />
        <div className="h-40 rounded-2xl bg-ink/5" />
      </div>
    </div>
  );
}

/* ─── main sections ─── */

function PersonTabs({
  activeTab,
  onTabChange,
  primaryLabel,
  guestLabel,
}: {
  activeTab: "primary" | "guest";
  onTabChange: (tab: "primary" | "guest") => void;
  primaryLabel: string;
  guestLabel: string;
}) {
  const tabClass = (tab: "primary" | "guest") =>
    `flex-1 rounded-lg px-4 py-3 text-center transition-all ${
      activeTab === tab
        ? "bg-white text-ink shadow-sm ring-1 ring-ink/10"
        : "text-ink/55 hover:text-ink/75"
    }`;

  return (
    <div
      className="rounded-2xl border border-[#382910]/10 bg-[#FFFDF8] p-1.5 shadow-[0_4px_24px_-4px_rgba(56,41,16,0.06)]"
      role="tablist"
      aria-label="Registration details"
    >
      <div className="grid grid-cols-2 gap-1">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "primary"}
          onClick={() => onTabChange("primary")}
          className={tabClass("primary")}
        >
          <span className="block font-poppins text-sm font-semibold">{primaryLabel}</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "guest"}
          onClick={() => onTabChange("guest")}
          className={tabClass("guest")}
        >
          <span className="block font-poppins text-sm font-semibold">{guestLabel}</span>
        </button>
      </div>
    </div>
  );
}

function GuestHero({
  guest,
  locale,
}: {
  guest: NonNullable<PublicUserRegistration["guest"]>;
  locale: string;
}) {
  const t = useTranslations("userStatusPage");
  const guestStatus = guest.adminStatus;
  const displayName = guestStatus?.fullName || guest.firstName || t("sections.guest");
  const displayPhone = guestStatus?.phone || guest.phone;
  const displayCountry = guestStatus?.country || guest.nationality || "";
  const firstName = displayName.split(" ")[0];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#382910]/12 bg-gradient-to-br from-[#FDFCFA] via-[#FBF6EB] to-[#F3E5CB] shadow-[0_28px_70px_-28px_rgba(56,41,16,0.22)]">
      <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-falcon-deep/5" />
      <div className="absolute -bottom-6 -left-6 h-28 w-28 rounded-full bg-falcon-gold/10" />

      <div className="relative p-6 md:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-falcon-deep font-display text-2xl text-white shadow-lg">
            {getInitials(displayName)}
          </div>
          <div className="min-w-0">
            <p className="font-poppins text-sm text-ink/55">
              {t("adminStatus.guestStatusDescription", { name: firstName })}
            </p>
            <h2 className="mt-0.5 font-display text-2xl text-ink md:text-3xl">{displayName}</h2>
            <p className="mt-1 truncate font-poppins text-sm text-ink/60">
              {guestStatus?.email || guest.email}
            </p>
            {displayPhone && (
              <p className="font-poppins text-sm text-ink/60">{displayPhone}</p>
            )}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {displayCountry && (
            <MetaChip label={t("adminStatus.fields.country")} value={displayCountry} />
          )}
          {guest.passportNumber && (
            <MetaChip label={t("fields.guestPassportNumber")} value={guest.passportNumber} />
          )}
          {guest.passportExpiry && (
            <MetaChip
              label={t("fields.guestPassportExpiry")}
              value={formatDisplayDate(guest.passportExpiry, locale)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function WelcomeHero({
  registration,
  adminStatus,
  locale,
}: {
  registration: PublicUserRegistration;
  adminStatus?: PublicAdminStatus;
  locale: string;
}) {
  const t = useTranslations("userStatusPage");

  const displayName = adminStatus?.fullName || registration.fullName;
  const displayPhone = adminStatus?.phone || registration.phone;
  const displayCountry = adminStatus?.country || registration.nationality || "";
  const partnerId = adminStatus?.partnerId || registration.ibId || "";
  const firstName = displayName.split(" ")[0];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#382910]/12 bg-gradient-to-br from-[#FDFCFA] via-[#FBF6EB] to-[#F3E5CB] shadow-[0_28px_70px_-28px_rgba(56,41,16,0.22)]">
      <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-falcon-deep/5" />
      <div className="absolute -bottom-6 -left-6 h-28 w-28 rounded-full bg-falcon-gold/10" />

      <div className="relative p-6 md:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-falcon-deep font-display text-2xl text-white shadow-lg">
            {getInitials(displayName)}
          </div>
          <div className="min-w-0">
            <p className="font-poppins text-sm text-ink/55">
              {t("welcome", { name: firstName })}
            </p>
            <h2 className="mt-0.5 font-display text-2xl text-ink md:text-3xl">{displayName}</h2>
            <p className="mt-1 truncate font-poppins text-sm text-ink/60">{registration.email}</p>
            {displayPhone && (
              <p className="font-poppins text-sm text-ink/60">{displayPhone}</p>
            )}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <MetaChip label={t("referenceId")} value={registration.id.slice(-8).toUpperCase()} />
          <MetaChip label={t("cards.submitted")} value={formatDisplayDate(registration.submittedAt, locale)} />
          {displayCountry && <MetaChip label={t("adminStatus.fields.country")} value={displayCountry} />}
          {partnerId && <MetaChip label={t("adminStatus.fields.partnerId")} value={partnerId} />}
          {registration.memberId && <MetaChip label={t("fields.memberId")} value={registration.memberId} />}
        </div>
      </div>
    </div>
  );
}

function JourneySection({ adminStatus }: { adminStatus?: PublicAdminStatus }) {
  const t = useTranslations("userStatusPage");

  return (
    <SectionCard
      title={t("sections.journey")}
      subtitle={t("adminStatus.journeyDescription")}
    >
      <ProgressTimeline steps={buildStatusSteps(adminStatus, t)} />
    </SectionCard>
  );
}

function buildStatusSteps(
  adminStatus: PublicAdminStatus | PublicGuestAdminStatus | undefined,
  t: ReturnType<typeof useTranslations>
) {
  const qVal = adminStatus?.qualificationStatus ?? "";
  const vVal = adminStatus?.visaStatus ?? "";
  const tVal = adminStatus?.ticketStatus ?? "";

  const qLabel = qVal
    ? qVal === "qualified"
      ? t("adminStatus.qualification.qualified")
      : t("adminStatus.qualification.notYetReached")
    : t("adminStatus.pendingReview");
  const vLabel = vVal
    ? t(`adminStatus.visa.${vVal}` as "adminStatus.visa.not_started")
    : t("adminStatus.pendingReview");
  const tLabel = tVal
    ? t(`adminStatus.ticket.${tVal}` as "adminStatus.ticket.not_started")
    : t("adminStatus.pendingReview");

  return [
    {
      label: t("adminStatus.fields.qualificationStatus"),
      status: qLabel,
      tone: statusTone(qVal, "qualification"),
      hint:
        qVal === "qualified"
          ? t("adminStatus.hints.qualified")
          : t("adminStatus.hints.qualificationPending"),
      done: qVal === "qualified",
    },
    {
      label: t("adminStatus.fields.visaStatus"),
      status: vLabel,
      tone: statusTone(vVal, "visa"),
      hint:
        vVal === "approved"
          ? t("adminStatus.hints.visaApproved")
          : vVal === "rejected"
            ? t("adminStatus.hints.visaRejected")
            : t("adminStatus.hints.visaPending"),
      done: vVal === "approved",
    },
    {
      label: t("adminStatus.fields.ticketStatus"),
      status: tLabel,
      tone: statusTone(tVal, "ticket"),
      hint:
        tVal === "confirmed"
          ? t("adminStatus.hints.ticketConfirmed")
          : tVal === "cancelled"
            ? t("adminStatus.hints.ticketCancelled")
            : t("adminStatus.hints.ticketPending"),
      done: tVal === "confirmed",
    },
  ];
}

function GuestStatusSection({
  guest,
}: {
  guest: NonNullable<PublicUserRegistration["guest"]>;
}) {
  const t = useTranslations("userStatusPage");

  return (
    <SectionCard
      title={t("sections.journey")}
      subtitle={t("adminStatus.journeyDescription")}
    >
      <ProgressTimeline steps={buildStatusSteps(guest.adminStatus, t)} />
    </SectionCard>
  );
}

function PrimaryDocumentsSection({
  registration,
  adminStatus,
}: {
  registration: PublicUserRegistration;
  adminStatus?: PublicAdminStatus;
}) {
  const t = useTranslations("userStatusPage");

  const passportDoc = adminStatus?.passportCopy ?? registration.passportPhoto;
  const showVisa = adminStatus?.visaStatus === "approved" && adminStatus.visaDocument?.uploaded;
  const showETicket = adminStatus?.ticketStatus === "confirmed" && adminStatus.eTicket?.uploaded;
  const hasAny = passportDoc?.uploaded || showVisa || showETicket;

  return (
    <SectionCard
      icon={<IconFile />}
      title={t("sections.documents")}
      subtitle={t("adminStatus.documentsDescription")}
    >
      {!hasAny ? (
        <EmptyState message={t("adminStatus.noDocumentsYet")} />
      ) : (
        <div className="space-y-3">
          <DocumentCard label={t("adminStatus.fields.passportCopy")} document={passportDoc} actionLabel={t("cards.openDocument")} />
          {showVisa && (
            <DocumentCard label={t("adminStatus.fields.visaDocument")} document={adminStatus?.visaDocument} actionLabel={t("cards.downloadDocument")} />
          )}
          {showETicket && (
            <DocumentCard label={t("adminStatus.fields.eTicket")} document={adminStatus?.eTicket} actionLabel={t("cards.downloadDocument")} />
          )}
        </div>
      )}
    </SectionCard>
  );
}

function GuestDocumentsSection({
  guest,
}: {
  guest: NonNullable<PublicUserRegistration["guest"]>;
}) {
  const t = useTranslations("userStatusPage");
  const guestStatus = guest.adminStatus;

  const passportDoc = guestStatus?.passportCopy ?? guest.passportPhoto;
  const showVisa = guestStatus?.visaStatus === "approved" && guestStatus.visaDocument?.uploaded;
  const showETicket = guestStatus?.ticketStatus === "confirmed" && guestStatus.eTicket?.uploaded;
  const hasAny = passportDoc?.uploaded || showVisa || showETicket;

  return (
    <SectionCard
      icon={<IconFile />}
      title={t("sections.documents")}
      subtitle={t("adminStatus.documentsDescription")}
    >
      {!hasAny ? (
        <EmptyState message={t("adminStatus.noDocumentsYet")} />
      ) : (
        <div className="space-y-3">
          <DocumentCard label={t("adminStatus.fields.passportCopy")} document={passportDoc} actionLabel={t("cards.openDocument")} />
          {showVisa && (
            <DocumentCard label={t("adminStatus.fields.visaDocument")} document={guestStatus?.visaDocument} actionLabel={t("cards.downloadDocument")} />
          )}
          {showETicket && (
            <DocumentCard label={t("adminStatus.fields.eTicket")} document={guestStatus?.eTicket} actionLabel={t("cards.downloadDocument")} />
          )}
        </div>
      )}
    </SectionCard>
  );
}

function TravelSection({ adminStatus, locale }: { adminStatus?: PublicAdminStatus; locale: string }) {
  const t = useTranslations("userStatusPage");

  const hasHotel =
    adminStatus?.hotelName || adminStatus?.hotelAddress ||
    adminStatus?.checkInDateTime || adminStatus?.checkOutDateTime ||
    adminStatus?.hotelConfirmationNumber;
  const hasFlight =
    adminStatus?.airline || adminStatus?.flightNumber ||
    adminStatus?.departureDateTime || adminStatus?.returnDateTime;
  const hasTransport = adminStatus?.pickupDetails || adminStatus?.dropOffDetails;

  if (!hasHotel && !hasFlight && !hasTransport) {
    return (
      <SectionCard
        icon={<IconHotel />}
        title={t("sections.travelArrangements")}
        subtitle={t("sections.hotel")}
      >
        <EmptyState message={t("adminStatus.noTravelYet")} />
      </SectionCard>
    );
  }

  return (
    <SectionCard
      icon={<IconHotel />}
      title={t("sections.travelArrangements")}
    >
      <div className="space-y-4">
        {hasFlight && (
          <div className="rounded-xl border border-ink/8 bg-[#FFFDF8] p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-falcon-deep/10 text-falcon-deep">
                <IconPlane className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-poppins text-xs uppercase tracking-[0.08em] text-ink/50">
                  {t("sections.flight")}
                </p>
                {(adminStatus?.airline || adminStatus?.flightNumber) && (
                  <p className="mt-2 font-display text-lg text-ink">
                    {[adminStatus?.airline, adminStatus?.flightNumber && `#${adminStatus.flightNumber}`]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                )}
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {adminStatus?.airline && (
                    <div className="rounded-lg bg-white px-3 py-2">
                      <p className="font-poppins text-[10px] uppercase tracking-[0.1em] text-ink/45">
                        {t("adminStatus.fields.airline")}
                      </p>
                      <p className="mt-0.5 font-poppins text-sm text-ink">{adminStatus.airline}</p>
                    </div>
                  )}
                  {adminStatus?.flightNumber && (
                    <div className="rounded-lg bg-white px-3 py-2">
                      <p className="font-poppins text-[10px] uppercase tracking-[0.1em] text-ink/45">
                        {t("adminStatus.fields.flightNumber")}
                      </p>
                      <p className="mt-0.5 font-mono text-sm font-medium text-ink">
                        {adminStatus.flightNumber}
                      </p>
                    </div>
                  )}
                  {adminStatus?.departureDateTime && (
                    <div className="rounded-lg bg-white px-3 py-2">
                      <p className="font-poppins text-[10px] uppercase tracking-[0.1em] text-ink/45">
                        {t("adminStatus.fields.departureDateTime")}
                      </p>
                      <p className="mt-0.5 font-poppins text-sm text-ink">
                        {formatDisplayDateTime(adminStatus.departureDateTime, locale)}
                      </p>
                    </div>
                  )}
                  {adminStatus?.returnDateTime && (
                    <div className="rounded-lg bg-white px-3 py-2">
                      <p className="font-poppins text-[10px] uppercase tracking-[0.1em] text-ink/45">
                        {t("adminStatus.fields.returnDateTime")}
                      </p>
                      <p className="mt-0.5 font-poppins text-sm text-ink">
                        {formatDisplayDateTime(adminStatus.returnDateTime, locale)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {hasHotel && (
          <div className="rounded-xl border border-ink/8 bg-[#FFFDF8] p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-falcon-deep/10 text-falcon-deep">
                <IconHotel className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                {adminStatus?.hotelName && (
                  <p className="font-display text-lg text-ink">{adminStatus.hotelName}</p>
                )}
                {adminStatus?.hotelAddress && (
                  <p className="mt-1 font-poppins text-sm text-ink/65">{adminStatus.hotelAddress}</p>
                )}
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {adminStatus?.checkInDateTime && (
                    <div className="rounded-lg bg-white px-3 py-2">
                      <p className="font-poppins text-[10px] uppercase tracking-[0.1em] text-ink/45">
                        {t("adminStatus.fields.checkInDateTime")}
                      </p>
                      <p className="mt-0.5 font-poppins text-sm text-ink">
                        {formatDisplayDateTime(adminStatus.checkInDateTime, locale)}
                      </p>
                    </div>
                  )}
                  {adminStatus?.checkOutDateTime && (
                    <div className="rounded-lg bg-white px-3 py-2">
                      <p className="font-poppins text-[10px] uppercase tracking-[0.1em] text-ink/45">
                        {t("adminStatus.fields.checkOutDateTime")}
                      </p>
                      <p className="mt-0.5 font-poppins text-sm text-ink">
                        {formatDisplayDateTime(adminStatus.checkOutDateTime, locale)}
                      </p>
                    </div>
                  )}
                  {adminStatus?.hotelConfirmationNumber && (
                    <div className="rounded-lg bg-white px-3 py-2 sm:col-span-2">
                      <p className="font-poppins text-[10px] uppercase tracking-[0.1em] text-ink/45">
                        {t("adminStatus.fields.hotelConfirmationNumber")}
                      </p>
                      <p className="mt-0.5 font-mono text-sm font-medium text-ink">
                        {adminStatus.hotelConfirmationNumber}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {hasTransport && (
          <div className="grid gap-3 sm:grid-cols-2">
            {adminStatus?.pickupDetails && (
              <div className="rounded-xl border border-ink/8 bg-[#FFFDF8] p-4">
                <div className="flex items-center gap-2 text-falcon-deep">
                  <IconCar className="h-4 w-4" />
                  <p className="font-poppins text-xs uppercase tracking-[0.08em]">
                    {t("adminStatus.fields.pickupDetails")}
                  </p>
                </div>
                <p className="mt-2 font-poppins text-sm leading-relaxed text-ink/75">
                  {adminStatus.pickupDetails}
                </p>
              </div>
            )}
            {adminStatus?.dropOffDetails && (
              <div className="rounded-xl border border-ink/8 bg-[#FFFDF8] p-4">
                <div className="flex items-center gap-2 text-falcon-deep">
                  <IconCar className="h-4 w-4" />
                  <p className="font-poppins text-xs uppercase tracking-[0.08em]">
                    {t("adminStatus.fields.dropOffDetails")}
                  </p>
                </div>
                <p className="mt-2 font-poppins text-sm leading-relaxed text-ink/75">
                  {adminStatus.dropOffDetails}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </SectionCard>
  );
}

function SubmissionSection({
  registration,
  locale,
  bedroomLabel,
  variant = "primary",
}: {
  registration: PublicUserRegistration;
  locale: string;
  bedroomLabel: (v: string) => string;
  variant?: "primary" | "guest";
}) {
  const t = useTranslations("userStatusPage");
  const [open, setOpen] = useState(false);

  if (registration.formType !== "vip_ticket_booking") return null;

  if (variant === "guest") {
    if (!registration.guest) return null;

    const guest = registration.guest;

    return (
      <div className="overflow-hidden rounded-2xl border border-[#382910]/10 bg-white shadow-[0_4px_24px_-4px_rgba(56,41,16,0.08)]">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left md:px-8"
        >
          <div>
            <h3 className="font-display text-xl text-ink">{t("sections.guestSubmission")}</h3>
            <p className="mt-1 font-poppins text-sm text-ink/55">{t("adminStatus.submissionDescription")}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className="hidden font-poppins text-xs uppercase tracking-[0.1em] text-falcon-deep sm:inline">
              {open ? t("adminStatus.hideDetails") : t("adminStatus.showDetails")}
            </span>
            <IconChevron open={open} />
          </div>
        </button>

        {open && (
          <div className="border-t border-ink/8 px-6 pb-6 md:px-8">
            <div className="pt-5">
              <DetailGrid
                items={[
                  { label: t("fields.guestFirstName"), value: guest.firstName },
                  { label: t("fields.guestEmail"), value: guest.email },
                  { label: t("fields.guestPhone"), value: guest.phone },
                  { label: t("fields.guestPassportNumber"), value: guest.passportNumber },
                  { label: t("fields.guestPassportExpiry"), value: formatDisplayDate(guest.passportExpiry, locale) },
                  { label: t("fields.guestNationality"), value: guest.nationality },
                  { label: t("fields.bedroomPreference"), value: bedroomLabel(guest.bedroomPreference) },
                ]}
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  const submissionItems = [
    { label: t("fields.passportNumber"), value: registration.passportNumber ?? "" },
    { label: t("fields.passportExpiry"), value: formatDisplayDate(registration.passportExpiry ?? "", locale) },
    { label: t("fields.dateOfBirth"), value: formatDisplayDate(registration.dateOfBirth ?? "", locale) },
    { label: t("fields.invitingGuest"), value: registration.invitingGuest ? t("options.yes") : t("options.no") },
    ...(registration.specialRequirements
      ? [{ label: t("fields.specialRequirements"), value: registration.specialRequirements }]
      : []),
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-[#382910]/10 bg-white shadow-[0_4px_24px_-4px_rgba(56,41,16,0.08)]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left md:px-8"
      >
        <div>
          <h3 className="font-display text-xl text-ink">{t("sections.submission")}</h3>
          <p className="mt-1 font-poppins text-sm text-ink/55">{t("adminStatus.submissionDescription")}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="hidden font-poppins text-xs uppercase tracking-[0.1em] text-falcon-deep sm:inline">
            {open ? t("adminStatus.hideDetails") : t("adminStatus.showDetails")}
          </span>
          <IconChevron open={open} />
        </div>
      </button>

      {open && (
        <div className="border-t border-ink/8 px-6 pb-6 md:px-8">
          <div className="pt-5">
            <DetailGrid items={submissionItems} />
          </div>
        </div>
      )}
    </div>
  );
}

function PrimaryTabPanel({
  registration,
  adminStatus,
  locale,
  bedroomLabel,
}: {
  registration: PublicUserRegistration;
  adminStatus?: PublicAdminStatus;
  locale: string;
  bedroomLabel: (v: string) => string;
}) {
  return (
    <div className="space-y-5" role="tabpanel">
      <WelcomeHero registration={registration} adminStatus={adminStatus} locale={locale} />
      <JourneySection adminStatus={adminStatus} />
      <div className="grid gap-5 md:grid-cols-2">
        <TravelSection adminStatus={adminStatus} locale={locale} />
        <PrimaryDocumentsSection registration={registration} adminStatus={adminStatus} />
      </div>
      <SubmissionSection
        registration={registration}
        locale={locale}
        bedroomLabel={bedroomLabel}
        variant="primary"
      />
    </div>
  );
}

function GuestTabPanel({
  registration,
  locale,
  bedroomLabel,
}: {
  registration: PublicUserRegistration;
  locale: string;
  bedroomLabel: (v: string) => string;
}) {
  const guest = registration.guest;
  if (!guest) return null;

  return (
    <div className="space-y-5" role="tabpanel">
      <GuestHero guest={guest} locale={locale} />
      <GuestStatusSection guest={guest} />
      <GuestDocumentsSection guest={guest} />
      <SubmissionSection
        registration={registration}
        locale={locale}
        bedroomLabel={bedroomLabel}
        variant="guest"
      />
    </div>
  );
}

function SupportCard() {
  const t = useTranslations("userStatusPage");

  return (
    <div className="rounded-2xl border border-falcon-deep/20 bg-gradient-to-r from-[#FBF6EB] to-[#F3E5CB] p-6 md:p-8">
      <h3 className="font-display text-xl text-ink">{t("sections.nextSteps")}</h3>
      <p className="mt-2 font-poppins text-sm leading-relaxed text-ink/70">
        {t("nextStepsDescription")}
      </p>
      <a
        href="mailto:support@gtcfx.com"
        className="mt-5 inline-flex items-center gap-2 rounded-full bg-falcon-deep px-5 py-2.5 font-poppins text-xs uppercase tracking-[0.1em] text-white transition-opacity hover:opacity-90"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
        </svg>
        support@gtcfx.com
      </a>
    </div>
  );
}

/* ─── page ─── */

function UserStatusContent() {
  const t = useTranslations("userStatusPage");
  const locale = useLocale();
  const searchParams = useSearchParams();
  const email = searchParams.get("email")?.trim() ?? "";

  const [loading, setLoading] = useState(true);
  const [registration, setRegistration] = useState<PublicUserRegistration | null>(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"primary" | "guest">("primary");

  useEffect(() => {
    if (!email) {
      setLoading(false);
      setError(t("errors.emailRequired"));
      return;
    }

    let cancelled = false;

    async function loadStatus() {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(`/api/user-status?email=${encodeURIComponent(email)}`);
        const data = await response.json();
        if (cancelled) return;
        if (!response.ok || !data?.success || !data?.registration) {
          setRegistration(null);
          setError(data?.message || t("errors.notFound"));
          return;
        }
        setRegistration(data.registration);
      } catch {
        if (!cancelled) {
          setRegistration(null);
          setError(t("errors.loadFailed"));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadStatus();
    return () => { cancelled = true; };
  }, [email, t]);

  const bedroomLabel = (value: string) => {
    if (value === "single_bed") return t("bedroom.singleBed");
    if (value === "master_bed") return t("bedroom.masterBed");
    if (value === "extra_room") return t("bedroom.extraRoom");
    return value;
  };

  const adminStatus = registration?.adminStatus;
  const isVip = registration?.formType === "vip_ticket_booking";
  const hasGuest = Boolean(registration?.guest);

  const primaryTabLabel =
    adminStatus?.fullName?.split(" ")[0] ||
    registration?.fullName?.split(" ")[0] ||
    t("tabs.primary");
  const guestTabLabel =
    registration?.guest?.adminStatus?.fullName?.split(" ")[0] ||
    registration?.guest?.firstName ||
    t("tabs.guest");

  return (
    <section className="relative pb-20 pt-28 md:pb-28 md:pt-36">
      <div className="container max-w-6xl">
        {/* page header — compact */}
        <div className="mb-8 text-center md:mb-10">
          <p className="eyebrow !capitalize text-ink/55">
            <span className="font-poppins">{t("eyebrow")}</span>
          </p>
          <h1 className="mt-3 font-display text-3xl !font-medium !text-ink md:text-4xl">
            {t("headingPlain")}
            <span className="italic text-falcon-deep"> {t("headingItalic")}</span>
          </h1>
        </div>

        {loading && <LoadingSkeleton />}

        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
              </svg>
            </div>
            <p className="mt-4 font-display text-xl text-red-800">{t("errors.title")}</p>
            <p className="mt-2 font-poppins text-sm text-red-700">{error}</p>
          </div>
        )}

        {!loading && registration && (
          <div className="space-y-5">
            {isVip && hasGuest ? (
              <>
                <PersonTabs
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                  primaryLabel={primaryTabLabel}
                  guestLabel={guestTabLabel}
                />

                {activeTab === "primary" ? (
                  <PrimaryTabPanel
                    registration={registration}
                    adminStatus={adminStatus}
                    locale={locale}
                    bedroomLabel={bedroomLabel}
                  />
                ) : (
                  <GuestTabPanel
                    registration={registration}
                    locale={locale}
                    bedroomLabel={bedroomLabel}
                  />
                )}
              </>
            ) : (
              <>
                <WelcomeHero registration={registration} adminStatus={adminStatus} locale={locale} />

                {isVip && (
                  <>
                    <JourneySection adminStatus={adminStatus} />
                    <div className="grid gap-5 md:grid-cols-2">
                      <TravelSection adminStatus={adminStatus} locale={locale} />
                      <PrimaryDocumentsSection registration={registration} adminStatus={adminStatus} />
                    </div>
                  </>
                )}

                <SubmissionSection
                  registration={registration}
                  locale={locale}
                  bedroomLabel={bedroomLabel}
                  variant="primary"
                />
              </>
            )}

            <SupportCard />
          </div>
        )}
      </div>
    </section>
  );
}

export default function UserStatusDashboard() {
  const t = useTranslations("userStatusPage");

  return (
    <Suspense
      fallback={
        <section className="relative pb-20 pt-28 md:pb-28 md:pt-36">
          <div className="container max-w-3xl">
            <LoadingSkeleton />
          </div>
        </section>
      }
    >
      <UserStatusContent />
    </Suspense>
  );
}
