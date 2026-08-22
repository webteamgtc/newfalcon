"use client";

import { Suspense, useEffect, useState, type FormEvent, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import type {
  PublicAdminStatus,
  PublicGuestAdminStatus,
  PublicPassportDocument,
  PublicUserRegistration,
} from "@/lib/userStatus";
import { SHOW_VISA_SECTION } from "@/lib/featureFlags";

/* ─── helpers ─── */

function getDateLocale(locale: string) {
  if (locale === "ar") return "ar-AE";
  if (locale === "zh") return "zh-CN";
  return "en-GB";
}

function formatDisplayDate(value: string, locale: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(getDateLocale(locale), {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatDisplayDateTime(value: string, locale: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(getDateLocale(locale), {
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

/** Uppercase section headings for EN/AR; leave zh unchanged. */
function statusHeadingClass(locale: string, extra = "") {
  if (locale === "zh") return extra;
  return [extra, "uppercase", "tracking-[0.06em]"].filter(Boolean).join(" ");
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

const toneCardSurface: Record<StatusTone, string> = {
  neutral: "border-ink/10 bg-[#FFFDF8]",
  pending: "border-amber-200/90 bg-gradient-to-br from-amber-50/80 to-[#FFFDF8]",
  progress: "border-sky-200/90 bg-gradient-to-br from-sky-50/70 to-[#FFFDF8]",
  success: "border-emerald-200/90 bg-gradient-to-br from-emerald-50/70 to-[#FFFDF8]",
  danger: "border-red-200/90 bg-gradient-to-br from-red-50/70 to-[#FFFDF8]",
};

const toneBadge: Record<StatusTone, string> = {
  neutral: "bg-ink/8 text-ink/60",
  pending: "bg-amber-100 text-amber-800",
  progress: "bg-sky-100 text-sky-800",
  success: "bg-emerald-100 text-emerald-800",
  danger: "bg-red-100 text-red-800",
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

function IconMail({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
    </svg>
  );
}

function IconPhone({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
    </svg>
  );
}

/* ─── shared surfaces ─── */

const statusPanelClass =
  "rounded-2xl border border-[#382910]/12 bg-gradient-to-br from-[#FDFCFA] via-[#FBF6EB] to-[#FFFDF8] shadow-[0_20px_50px_-24px_rgba(56,41,16,0.12)]";

const statusInnerClass =
  "overflow-hidden rounded-xl border border-[#382910]/10 bg-white/80 backdrop-blur-sm";

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
  const locale = useLocale();

  return (
    <div className={`${statusPanelClass} ${className}`}>
      <div className="border-b border-[#382910]/10 px-4 py-3 sm:px-6 sm:py-5 md:px-8">
        <div className="flex items-start gap-2.5 sm:gap-3">
          {icon && (
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-falcon-deep/10 text-falcon-deep sm:h-10 sm:w-10 sm:rounded-xl">
              {icon}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h3 className={statusHeadingClass(locale, "font-display text-base text-ink sm:text-xl")}>{title}</h3>
            {subtitle && (
              <p className="mt-0.5 font-poppins text-xs leading-relaxed text-ink/55 sm:mt-1 sm:text-sm">{subtitle}</p>
            )}
          </div>
        </div>
      </div>
      <div className="px-4 py-3 sm:px-6 sm:py-5 md:px-8">{children}</div>
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

function MetaGrid({ items }: { items: { label: string; value: string }[] }) {
  const visible = items.filter((item) => item.value?.trim());
  if (!visible.length) return null;

  return (
    <dl className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-[#382910]/10 bg-[#382910]/8 sm:mt-5 sm:grid-cols-3 lg:grid-cols-5">
      {visible.map((item) => (
        <div key={item.label} className="min-w-0 bg-white/90 px-3 py-2.5 sm:px-4 sm:py-3">
          <dt className="font-poppins text-[10px] uppercase tracking-[0.08em] text-ink/45">{item.label}</dt>
          <dd className="mt-0.5 break-words font-poppins text-xs font-medium leading-snug text-ink sm:text-sm">
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function ProfileCardShell({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-[#382910]/12 bg-gradient-to-br from-[#FDFCFA] via-[#FBF6EB] to-[#F3E5CB] shadow-[0_20px_50px_-24px_rgba(56,41,16,0.18)] ${className}`}
    >
      <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-falcon-deep/5 sm:h-40 sm:w-40" />
      <div className="pointer-events-none absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-falcon-gold/10 sm:h-28 sm:w-28" />
      <div className="relative">{children}</div>
    </div>
  );
}

function ProfileHeader({
  welcomeText,
  displayName,
  email,
  phone,
  metaItems,
  paddingClass = "p-4 sm:p-6 md:p-8",
}: {
  welcomeText: string;
  displayName: string;
  email?: string;
  phone?: string;
  metaItems: { label: string; value: string }[];
  paddingClass?: string;
}) {
  return (
    <div className={paddingClass}>
      <div className="flex items-start gap-3 sm:items-center sm:gap-5">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-falcon-deep font-display text-lg text-white shadow-md sm:h-16 sm:w-16 sm:rounded-2xl sm:text-2xl">
          {getInitials(displayName)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-poppins text-xs text-ink/55 sm:text-sm">{welcomeText}</p>
          <h2 className="mt-0.5 break-words font-display text-lg leading-tight text-ink sm:text-2xl md:text-3xl">
            {displayName}
          </h2>
          {(email || phone) && (
            <div className="mt-2 space-y-1 sm:mt-1.5">
              {email && (
                <p className="flex items-center gap-1.5 font-poppins text-xs text-ink/60 sm:text-sm">
                  <IconMail className="h-3.5 w-3.5 shrink-0 text-falcon-deep/70" />
                  <span className="min-w-0 break-all">{email}</span>
                </p>
              )}
              {phone && (
                <p className="flex items-center gap-1.5 font-poppins text-xs text-ink/60 sm:text-sm">
                  <IconPhone className="h-3.5 w-3.5 shrink-0 text-falcon-deep/70" />
                  <span className="break-all">{phone}</span>
                </p>
              )}
            </div>
          )}
        </div>
      </div>
      <MetaGrid items={metaItems} />
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
  const t = useTranslations("userStatusPage");
  const locale = useLocale();
  const completedCount = steps.filter((s) => s.tone === "success").length;
  const percentComplete = Math.round((completedCount / steps.length) * 100);
  const gridClass =
    steps.length === 2
      ? "sm:grid-cols-2"
      : steps.length === 3
        ? "md:grid-cols-3"
        : "sm:grid-cols-2 xl:grid-cols-4";

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="rounded-xl border border-[#382910]/10 bg-gradient-to-r from-[#FBF6EB]/90 via-[#FFFDF8] to-[#FBF6EB]/70 p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
          <div>
            <p className="font-poppins text-[10px] uppercase tracking-[0.12em] text-ink/45">
              {t("progressSummary.label")}
            </p>
            <p className="mt-1 font-display text-2xl leading-none text-ink sm:text-3xl">
              {completedCount}
              <span className="text-lg text-ink/35 sm:text-xl"> / {steps.length}</span>
            </p>
            <p className="mt-1 font-poppins text-xs text-ink/55">
              {t("progressSummary.complete", { completed: completedCount, total: steps.length })}
            </p>
          </div>

          <div className="w-full sm:max-w-xs sm:flex-1">
            <div className="flex items-center justify-between gap-3">
              <span className="font-poppins text-[10px] uppercase tracking-[0.1em] text-ink/45">
                {t("progressSummary.percentComplete", { percent: percentComplete })}
              </span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-ink/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-falcon-deep via-falcon-deep to-[#C9A227] transition-all duration-500"
                style={{ width: `${percentComplete}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className={`grid grid-cols-1 gap-3 ${gridClass}`}>
        {steps.map((step, index) => (
          <article
            key={step.label}
            className={`relative rounded-xl border p-4 transition-shadow hover:shadow-[0_8px_24px_-12px_rgba(56,41,16,0.18)] sm:p-5 ${toneCardSurface[step.tone]}`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 sm:h-11 sm:w-11 ${
                  step.tone === "success"
                    ? "border-emerald-500 bg-emerald-500 text-white shadow-sm"
                    : toneRing[step.tone]
                }`}
              >
                {step.tone === "success" ? (
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                ) : (
                  <span className={`h-2.5 w-2.5 rounded-full ${toneDot[step.tone]}`} />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-poppins text-[10px] uppercase tracking-[0.1em] text-ink/45">
                  {t("progressSummary.stepLabel", { step: index + 1 })}
                </p>
                <h4 className={statusHeadingClass(locale, "mt-0.5 font-poppins text-sm font-semibold text-ink sm:text-base")}>
                  {step.label}
                </h4>
                <span
                  className={`mt-2 inline-flex rounded-full px-2.5 py-1 font-poppins text-[10px] font-semibold uppercase tracking-[0.06em] ${toneBadge[step.tone]}`}
                >
                  {step.status}
                </span>
                <p className="mt-2.5 font-poppins text-xs leading-relaxed text-ink/60 sm:mt-3 sm:text-sm sm:leading-relaxed">
                  {step.hint}
                </p>
              </div>
            </div>
          </article>
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

  const locale = useLocale();
  const isPdf = document.mimeType === "application/pdf";
  const ext = isPdf ? "PDF" : "IMG";
  const badgeClass = isPdf
    ? "bg-red-50 text-red-700 ring-red-100"
    : "bg-sky-50 text-sky-700 ring-sky-100";

  return (
    <a
      href={document.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-3 rounded-xl border border-[#382910]/10 bg-white/80 p-3.5 backdrop-blur-sm transition-all hover:border-falcon-deep/30 hover:bg-white hover:shadow-[0_8px_24px_-12px_rgba(56,41,16,0.14)] sm:gap-4 sm:p-4"
    >
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-poppins text-[10px] font-bold tracking-wider ring-1 sm:h-12 sm:w-12 ${badgeClass}`}
      >
        {ext}
      </div>
      <div className="min-w-0 flex-1">
        <p className={statusHeadingClass(locale, "font-poppins text-sm font-semibold text-ink")}>{label}</p>
        {document.fileName && (
          <p className="mt-0.5 truncate font-poppins text-xs text-ink/50">{document.fileName}</p>
        )}
      </div>
      <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-falcon-deep/20 bg-falcon-deep/5 px-2.5 py-1.5 font-poppins text-[9px] font-semibold uppercase tracking-[0.06em] text-falcon-deep transition-colors group-hover:border-falcon-deep group-hover:bg-falcon-deep group-hover:text-white sm:px-3 sm:text-[10px]">
        <span className="max-w-[72px] truncate sm:max-w-none">{actionLabel}</span>
        <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5M10.5 13.5 21 3m0 0h-5.25M21 3v5.25" />
        </svg>
      </span>
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

function InfoFieldGrid({
  items,
}: {
  items: { label: string; value: string; mono?: boolean }[];
}) {
  const visible = items.filter((item) => item.value?.trim());
  if (!visible.length) return null;

  return (
    <dl className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-[#382910]/10 bg-[#382910]/8 sm:grid-cols-2">
      {visible.map((item) => (
        <div key={item.label} className="min-w-0 bg-white/90 px-3 py-2.5 sm:px-4 sm:py-3">
          <dt className="font-poppins text-[10px] uppercase tracking-[0.08em] text-ink/45">{item.label}</dt>
          <dd
            className={`mt-0.5 break-words text-sm text-ink ${
              item.mono ? "font-mono font-medium" : "font-poppins"
            }`}
          >
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function TravelBlock({
  icon,
  eyebrow,
  title,
  subtitle,
  children,
}: {
  icon: ReactNode;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <article className={`${statusInnerClass} bg-gradient-to-br from-white/90 to-[#FBF6EB]/40`}>
      <div className="flex items-start gap-3 border-b border-[#382910]/8 px-4 py-3 sm:px-5 sm:py-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-falcon-deep/10 text-falcon-deep">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          {eyebrow && (
            <p className="font-poppins text-[10px] uppercase tracking-[0.12em] text-ink/45">{eyebrow}</p>
          )}
          {title && (
            <h4 className="mt-0.5 break-words font-display text-base text-ink sm:text-lg">{title}</h4>
          )}
          {subtitle && (
            <p className="mt-0.5 break-words font-poppins text-xs text-ink/60 sm:text-sm">{subtitle}</p>
          )}
        </div>
      </div>
      <div className="px-4 py-3 sm:px-5 sm:py-4">{children}</div>
    </article>
  );
}

function TransportNote({
  icon,
  label,
  details,
}: {
  icon: ReactNode;
  label: string;
  details: string;
}) {
  if (!details?.trim()) return null;

  return (
    <div className={`${statusInnerClass} bg-gradient-to-br from-white/90 to-[#FBF6EB]/40 p-4`}>
      <div className="flex items-center gap-2 text-falcon-deep">
        {icon}
        <p className="font-poppins text-[10px] uppercase tracking-[0.1em]">{label}</p>
      </div>
      <p className="mt-2 font-poppins text-sm leading-relaxed text-ink/75">{details}</p>
    </div>
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
  variant = "standalone",
}: {
  activeTab: "primary" | "guest";
  onTabChange: (tab: "primary" | "guest") => void;
  primaryLabel: string;
  guestLabel: string;
  variant?: "standalone" | "embedded";
}) {
  const tabClass = (tab: "primary" | "guest") =>
    `min-w-0 flex-1 rounded-lg px-3 py-2.5 text-center transition-all sm:px-4 sm:py-3 ${
      activeTab === tab
        ? variant === "embedded"
          ? "bg-white/95 text-ink shadow-sm ring-1 ring-falcon-deep/25"
          : "bg-white text-ink shadow-sm ring-1 ring-falcon-deep/30"
        : "text-ink/50 hover:bg-white/40 hover:text-ink/70"
    }`;

  const tabs = (
    <div className="grid grid-cols-2 gap-1.5">
      <button
        type="button"
        role="tab"
        aria-selected={activeTab === "primary"}
        onClick={() => onTabChange("primary")}
        className={tabClass("primary")}
      >
        <span className="block truncate font-poppins text-xs font-semibold sm:text-sm">{primaryLabel}</span>
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={activeTab === "guest"}
        onClick={() => onTabChange("guest")}
        className={tabClass("guest")}
      >
        <span className="block truncate font-poppins text-xs font-semibold sm:text-sm">{guestLabel}</span>
      </button>
    </div>
  );

  if (variant === "embedded") {
    return (
      <div
        className="border-b border-[#382910]/10 bg-white/30 px-3 py-2 sm:px-4"
        role="tablist"
        aria-label="Registration details"
      >
        {tabs}
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl border border-[#382910]/10 bg-[#FFFDF8] p-1.5 shadow-[0_4px_24px_-4px_rgba(56,41,16,0.06)]"
      role="tablist"
      aria-label="Registration details"
    >
      {tabs}
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
    <ProfileCardShell>
      <ProfileHeader
        welcomeText={t("adminStatus.guestStatusDescription", { name: firstName })}
        displayName={displayName}
        email={guestStatus?.email || guest.email}
        phone={displayPhone}
        metaItems={[
          ...(displayCountry
            ? [{ label: t("adminStatus.fields.country"), value: displayCountry }]
            : []),
          ...(guest.passportNumber
            ? [{ label: t("fields.guestPassportNumber"), value: guest.passportNumber }]
            : []),
          ...(guest.passportExpiry
            ? [
                {
                  label: t("fields.guestPassportExpiry"),
                  value: formatDisplayDate(guest.passportExpiry, locale),
                },
              ]
            : []),
        ]}
      />
    </ProfileCardShell>
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
    <ProfileCardShell>
      <ProfileHeader
        welcomeText={t("welcome", { name: firstName })}
        displayName={displayName}
        email={registration.email}
        phone={displayPhone}
        metaItems={[
          { label: t("referenceId"), value: registration.id.slice(-8).toUpperCase() },
          { label: t("cards.submitted"), value: formatDisplayDate(registration.submittedAt, locale) },
          ...(displayCountry
            ? [{ label: t("adminStatus.fields.country"), value: displayCountry }]
            : []),
          ...(partnerId ? [{ label: t("adminStatus.fields.partnerId"), value: partnerId }] : []),
          ...(registration.memberId
            ? [{ label: t("fields.memberId"), value: registration.memberId }]
            : []),
        ]}
      />
    </ProfileCardShell>
  );
}

function ProfileSwitcherCard({
  activeTab,
  onTabChange,
  primaryLabel,
  guestLabel,
  registration,
  adminStatus,
  locale,
}: {
  activeTab: "primary" | "guest";
  onTabChange: (tab: "primary" | "guest") => void;
  primaryLabel: string;
  guestLabel: string;
  registration: PublicUserRegistration;
  adminStatus?: PublicAdminStatus;
  locale: string;
}) {
  const t = useTranslations("userStatusPage");
  const guest = registration.guest;
  if (!guest) return null;

  const primaryName = adminStatus?.fullName || registration.fullName;
  const primaryPhone = adminStatus?.phone || registration.phone;
  const primaryCountry = adminStatus?.country || registration.nationality || "";
  const partnerId = adminStatus?.partnerId || registration.ibId || "";

  const guestStatus = guest.adminStatus;
  const guestName = guestStatus?.fullName || guest.firstName || t("sections.guest");
  const guestPhone = guestStatus?.phone || guest.phone;
  const guestCountry = guestStatus?.country || guest.nationality || "";

  const primaryProfile = {
    welcomeText: t("welcome", { name: primaryName.split(" ")[0] }),
    displayName: primaryName,
    email: registration.email,
    phone: primaryPhone,
    metaItems: [
      { label: t("referenceId"), value: registration.id.slice(-8).toUpperCase() },
      { label: t("cards.submitted"), value: formatDisplayDate(registration.submittedAt, locale) },
      ...(primaryCountry
        ? [{ label: t("adminStatus.fields.country"), value: primaryCountry }]
        : []),
      ...(partnerId ? [{ label: t("adminStatus.fields.partnerId"), value: partnerId }] : []),
      ...(registration.memberId
        ? [{ label: t("fields.memberId"), value: registration.memberId }]
        : []),
    ],
  };

  const guestProfile = {
    welcomeText: t("adminStatus.guestStatusDescription", { name: guestName.split(" ")[0] }),
    displayName: guestName,
    email: guestStatus?.email || guest.email,
    phone: guestPhone,
    metaItems: [
      ...(guestCountry
        ? [{ label: t("adminStatus.fields.country"), value: guestCountry }]
        : []),
      ...(guest.passportNumber
        ? [{ label: t("fields.guestPassportNumber"), value: guest.passportNumber }]
        : []),
      ...(guest.passportExpiry
        ? [
            {
              label: t("fields.guestPassportExpiry"),
              value: formatDisplayDate(guest.passportExpiry, locale),
            },
          ]
        : []),
    ],
  };

  const profile = activeTab === "primary" ? primaryProfile : guestProfile;

  return (
    <ProfileCardShell>
      <PersonTabs
        variant="embedded"
        activeTab={activeTab}
        onTabChange={onTabChange}
        primaryLabel={primaryLabel}
        guestLabel={guestLabel}
      />
      <ProfileHeader
        {...profile}
        paddingClass="p-4 pt-3 sm:p-6 sm:pt-4 md:p-8 md:pt-5"
      />
    </ProfileCardShell>
  );
}

function JourneySection({ adminStatus }: { adminStatus?: PublicAdminStatus }) {
  const t = useTranslations("userStatusPage");
  const steps = buildStatusSteps(adminStatus, t);
  const completedCount = steps.filter((s) => s.tone === "success").length;

  return (
    <SectionCard
      title={t("sections.journey")}
      subtitle={t("adminStatus.journeyDescription")}
      className="overflow-hidden"
    >
      <ProgressTimeline steps={steps} />
      {completedCount === steps.length && (
        <p className="mt-4 rounded-lg border border-emerald-200/80 bg-emerald-50/60 px-4 py-3 text-center font-poppins text-xs text-emerald-800 sm:text-sm">
          {t("progressSummary.allComplete")}
        </p>
      )}
    </SectionCard>
  );
}

function getHotelAssignment(
  adminStatus: PublicAdminStatus | PublicGuestAdminStatus | undefined
) {
  if (!adminStatus) return { floor: "", room: "" };
  return {
    floor: adminStatus.hotelFloor?.trim() ?? "",
    room: adminStatus.hotelRoomNumber?.trim() ?? "",
  };
}

function buildStatusSteps(
  adminStatus: PublicAdminStatus | PublicGuestAdminStatus | undefined,
  t: ReturnType<typeof useTranslations>
) {
  const qVal = adminStatus?.qualificationStatus ?? "";
  const vVal = adminStatus?.visaStatus ?? "";
  const tVal = adminStatus?.ticketStatus ?? "";
  const { floor: hotelFloor, room: hotelRoomNumber } = getHotelAssignment(adminStatus);
  const hotelConfirmed = Boolean(hotelFloor && hotelRoomNumber);

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
    ...(SHOW_VISA_SECTION
      ? [
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
        ]
      : []),
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
    {
      label: t("adminStatus.fields.hotelStatus"),
      status: hotelConfirmed
        ? t("adminStatus.hotel.confirmed")
        : t("adminStatus.hotel.pending"),
      tone: hotelConfirmed ? ("success" as StatusTone) : ("pending" as StatusTone),
      hint: hotelConfirmed
        ? t("adminStatus.hints.hotelConfirmed")
        : t("adminStatus.hints.hotelPending"),
      done: hotelConfirmed,
    },
  ];
}

function GuestStatusSection({
  guest,
}: {
  guest: NonNullable<PublicUserRegistration["guest"]>;
}) {
  const t = useTranslations("userStatusPage");
  const steps = buildStatusSteps(guest.adminStatus, t);
  const completedCount = steps.filter((s) => s.tone === "success").length;

  return (
    <SectionCard
      title={t("sections.journey")}
      subtitle={t("adminStatus.journeyDescription")}
      className="overflow-hidden"
    >
      <ProgressTimeline steps={steps} />
      {completedCount === steps.length && (
        <p className="mt-4 rounded-lg border border-emerald-200/80 bg-emerald-50/60 px-4 py-3 text-center font-poppins text-xs text-emerald-800 sm:text-sm">
          {t("progressSummary.allComplete")}
        </p>
      )}
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
  const showVisa =
    SHOW_VISA_SECTION &&
    adminStatus?.visaStatus === "approved" &&
    adminStatus.visaDocument?.uploaded;
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
        <div className="space-y-2.5">
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

function GuestHotelSection({
  adminStatus,
}: {
  adminStatus?: PublicGuestAdminStatus;
}) {
  const t = useTranslations("userStatusPage");
  const { floor, room } = getHotelAssignment(adminStatus);
  const hasHotel = Boolean(floor || room);

  return (
    <SectionCard
      icon={<IconHotel />}
      title={t("sections.travelArrangements")}
      subtitle={t("sections.hotel")}
    >
      {!hasHotel ? (
        <EmptyState message={t("adminStatus.noTravelYet")} />
      ) : (
        <TravelBlock icon={<IconHotel className="h-5 w-5" />} eyebrow={t("sections.hotel")}>
          <InfoFieldGrid
            items={[
              ...(floor ? [{ label: t("adminStatus.fields.hotelFloor"), value: floor }] : []),
              ...(room ? [{ label: t("adminStatus.fields.hotelRoomNumber"), value: room }] : []),
            ]}
          />
        </TravelBlock>
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
  const showVisa =
    SHOW_VISA_SECTION &&
    guestStatus?.visaStatus === "approved" &&
    guestStatus.visaDocument?.uploaded;
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
        <div className="space-y-2.5">
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
    adminStatus?.hotelFloor || adminStatus?.hotelRoomNumber ||
    adminStatus?.checkInDateTime || adminStatus?.checkOutDateTime ||
    adminStatus?.hotelConfirmationNumber;
  const hasFlight =
    adminStatus?.airline || adminStatus?.flightNumber ||
    adminStatus?.departureDateTime || adminStatus?.returnDateTime;
  const hasTransport = adminStatus?.pickupDetails || adminStatus?.dropOffDetails;

  const flightSummary = [
    adminStatus?.airline,
    adminStatus?.flightNumber ? `#${adminStatus.flightNumber}` : "",
  ]
    .filter(Boolean)
    .join(" · ");

  const showFlightIdentityInHeader = Boolean(adminStatus?.airline && adminStatus?.flightNumber);

  const flightGridItems = [
    ...(adminStatus?.airline && !showFlightIdentityInHeader
      ? [{ label: t("adminStatus.fields.airline"), value: adminStatus.airline }]
      : []),
    ...(adminStatus?.flightNumber && !showFlightIdentityInHeader
      ? [{ label: t("adminStatus.fields.flightNumber"), value: adminStatus.flightNumber, mono: true }]
      : []),
    ...(adminStatus?.departureDateTime
      ? [
          {
            label: t("adminStatus.fields.departureDateTime"),
            value: formatDisplayDateTime(adminStatus.departureDateTime, locale),
          },
        ]
      : []),
    ...(adminStatus?.returnDateTime
      ? [
          {
            label: t("adminStatus.fields.returnDateTime"),
            value: formatDisplayDateTime(adminStatus.returnDateTime, locale),
          },
        ]
      : []),
  ];

  const hotelGridItems = [
    ...(adminStatus?.checkInDateTime
      ? [
          {
            label: t("adminStatus.fields.checkInDateTime"),
            value: formatDisplayDateTime(adminStatus.checkInDateTime, locale),
          },
        ]
      : []),
    ...(adminStatus?.checkOutDateTime
      ? [
          {
            label: t("adminStatus.fields.checkOutDateTime"),
            value: formatDisplayDateTime(adminStatus.checkOutDateTime, locale),
          },
        ]
      : []),
    ...(adminStatus?.hotelConfirmationNumber
      ? [
          {
            label: t("adminStatus.fields.hotelConfirmationNumber"),
            value: adminStatus.hotelConfirmationNumber,
            mono: true,
          },
        ]
      : []),
    ...(adminStatus?.hotelFloor
      ? [{ label: t("adminStatus.fields.hotelFloor"), value: adminStatus.hotelFloor }]
      : []),
    ...(adminStatus?.hotelRoomNumber
      ? [{ label: t("adminStatus.fields.hotelRoomNumber"), value: adminStatus.hotelRoomNumber }]
      : []),
  ];

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
      subtitle={t("adminStatus.travelDescription")}
    >
      <div className="space-y-3">
        {hasFlight && (
          <TravelBlock
            icon={<IconPlane className="h-5 w-5" />}
            eyebrow={t("sections.flight")}
            title={showFlightIdentityInHeader ? flightSummary : undefined}
          >
            <InfoFieldGrid items={flightGridItems} />
          </TravelBlock>
        )}

        {hasHotel && (
          <TravelBlock
            icon={<IconHotel className="h-5 w-5" />}
            eyebrow={t("sections.hotel")}
            title={adminStatus?.hotelName || undefined}
            subtitle={adminStatus?.hotelAddress || undefined}
          >
            <InfoFieldGrid items={hotelGridItems} />
          </TravelBlock>
        )}

        {hasTransport && (
          <div className="grid gap-3 sm:grid-cols-2">
            <TransportNote
              icon={<IconCar className="h-4 w-4" />}
              label={t("adminStatus.fields.pickupDetails")}
              details={adminStatus?.pickupDetails ?? ""}
            />
            <TransportNote
              icon={<IconCar className="h-4 w-4" />}
              label={t("adminStatus.fields.dropOffDetails")}
              details={adminStatus?.dropOffDetails ?? ""}
            />
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
          className="flex w-full flex-col gap-3 px-4 py-4 text-left sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6 sm:py-5 md:px-8"
        >
          <div className="min-w-0 flex-1">
            <h3 className={statusHeadingClass(locale, "font-display text-lg text-ink sm:text-xl")}>{t("sections.guestSubmission")}</h3>
            <p className="mt-1 font-poppins text-sm text-ink/55">{t("adminStatus.submissionDescription")}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className="font-poppins text-[10px] uppercase tracking-[0.1em] text-falcon-deep sm:text-xs">
              {open ? t("adminStatus.hideDetails") : t("adminStatus.showDetails")}
            </span>
            <IconChevron open={open} />
          </div>
        </button>

        {open && (
          <div className="border-t border-ink/8 px-4 pb-5 sm:px-6 sm:pb-6 md:px-8">
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
        className="flex w-full flex-col gap-3 px-4 py-4 text-left sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6 sm:py-5 md:px-8"
      >
        <div className="min-w-0 flex-1">
          <h3 className={statusHeadingClass(locale, "font-display text-lg text-ink sm:text-xl")}>{t("sections.submission")}</h3>
          <p className="mt-1 font-poppins text-sm text-ink/55">{t("adminStatus.submissionDescription")}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="font-poppins text-[10px] uppercase tracking-[0.1em] text-falcon-deep sm:text-xs">
            {open ? t("adminStatus.hideDetails") : t("adminStatus.showDetails")}
          </span>
          <IconChevron open={open} />
        </div>
      </button>

      {open && (
        <div className="border-t border-ink/8 px-4 pb-5 sm:px-6 sm:pb-6 md:px-8">
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
  showHero = true,
}: {
  registration: PublicUserRegistration;
  adminStatus?: PublicAdminStatus;
  locale: string;
  bedroomLabel: (v: string) => string;
  showHero?: boolean;
}) {
  return (
    <div className="space-y-4 sm:space-y-5" role="tabpanel">
      {showHero && (
        <WelcomeHero registration={registration} adminStatus={adminStatus} locale={locale} />
      )}
      <JourneySection adminStatus={adminStatus} />
      <div className="space-y-4 sm:space-y-5">
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
  showHero = true,
}: {
  registration: PublicUserRegistration;
  locale: string;
  bedroomLabel: (v: string) => string;
  showHero?: boolean;
}) {
  const guest = registration.guest;
  if (!guest) return null;

  return (
    <div className="space-y-4 sm:space-y-5" role="tabpanel">
      {showHero && <GuestHero guest={guest} locale={locale} />}
      <GuestStatusSection guest={guest} />
      <GuestHotelSection adminStatus={guest.adminStatus} />
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
  const locale = useLocale();

  return (
    <div className="rounded-2xl border border-falcon-deep/20 bg-gradient-to-r from-[#FBF6EB] to-[#F3E5CB] p-4 sm:p-6 md:p-8">
      <h3 className={statusHeadingClass(locale, "font-display text-base text-ink sm:text-xl")}>{t("sections.nextSteps")}</h3>
      <p className="mt-1.5 font-poppins text-xs leading-relaxed text-ink/70 sm:mt-2 sm:text-sm">
        {t("nextStepsDescription")}
      </p>
      <a
        href="mailto:support@gtcfx.com"
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-falcon-deep px-5 py-2.5 font-poppins text-xs uppercase tracking-[0.1em] text-white transition-opacity hover:opacity-90 sm:w-auto"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
        </svg>
        support@gtcfx.com
      </a>
    </div>
  );
}

/* ─── email lookup ─── */

function EmailLookupForm({
  initialEmail = "",
  onSubmit,
  submitting = false,
  lookupError,
}: {
  initialEmail?: string;
  onSubmit: (email: string) => void;
  submitting?: boolean;
  lookupError?: string;
}) {
  const t = useTranslations("userStatusPage");
  const locale = useLocale();
  const [email, setEmail] = useState(initialEmail);
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    setEmail(initialEmail);
  }, [initialEmail]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = email.trim().toLowerCase();

    if (!trimmed) {
      setValidationError(t("lookup.errors.emailRequired"));
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setValidationError(t("lookup.errors.emailInvalid"));
      return;
    }

    setValidationError("");
    onSubmit(trimmed);
  }

  const displayError = validationError || lookupError;

  return (
    <div className="mx-auto max-w-lg">
      <div className="relative overflow-hidden rounded-2xl border border-[#382910]/12 bg-gradient-to-br from-[#FDFCFA] via-[#FBF6EB] to-[#F3E5CB] p-4 shadow-[0_28px_70px_-28px_rgba(56,41,16,0.22)] sm:p-6 md:p-8">
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-falcon-deep/5" />
        <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-falcon-gold/10" />

        <div className="relative">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-falcon-deep/10 text-falcon-deep">
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
            </svg>
          </div>

          <h2 className={statusHeadingClass(locale, "mt-5 text-center font-display text-xl text-ink sm:text-2xl")}>{t("lookup.title")}</h2>
          <p className="mt-2 text-center font-poppins text-sm leading-relaxed text-ink/60">
            {t("lookup.description")}
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="user-status-email" className="form-field-label font-poppins text-xs uppercase tracking-[0.08em] text-ink/55">
                {t("lookup.emailLabel")}
              </label>
              <input
                id="user-status-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  if (validationError) setValidationError("");
                }}
                placeholder={t("lookup.emailPlaceholder")}
                disabled={submitting}
                className="mt-2 h-12 w-full rounded-lg border border-[#382910]/15 bg-white/95 px-4 font-poppins text-sm text-ink shadow-sm outline-none transition-all placeholder:text-ink/35 focus:border-falcon-deep focus:ring-2 focus:ring-falcon-deep/10 disabled:opacity-70"
              />
            </div>

            {displayError && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-center">
                <p className="font-poppins text-sm text-red-700">{displayError}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-falcon-deep px-6 font-poppins text-xs uppercase tracking-[0.12em] text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? t("lookup.submitting") : t("lookup.submit")}
              {!submitting && (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

/* ─── page ─── */

function UserStatusContent() {
  const t = useTranslations("userStatusPage");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const email = searchParams.get("email")?.trim().toLowerCase() ?? "";

  const [loading, setLoading] = useState(Boolean(email));
  const [registration, setRegistration] = useState<PublicUserRegistration | null>(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"primary" | "guest">("primary");
  const [submittingEmail, setSubmittingEmail] = useState(false);

  function handleEmailSubmit(nextEmail: string) {
    setSubmittingEmail(true);
    router.push(`${pathname}?email=${encodeURIComponent(nextEmail)}`);
  }

  useEffect(() => {
    if (!email) {
      setLoading(false);
      setRegistration(null);
      setError("");
      setSubmittingEmail(false);
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
        if (!cancelled) {
          setLoading(false);
          setSubmittingEmail(false);
        }
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
    <section className="relative overflow-x-hidden pb-12 pt-20 sm:pb-20 sm:pt-28 md:pb-28 md:pt-36">
      <div className="container max-w-6xl">
        <div className="mb-5 px-1 text-center sm:mb-8 md:mb-10">
          <p className="eyebrow text-ink/55">
            <span className={statusHeadingClass(locale, "font-poppins")}>{t("eyebrow")}</span>
          </p>
          <h1 className={statusHeadingClass(locale, "mt-2 font-display text-xl !font-medium !text-ink sm:mt-3 sm:text-3xl md:text-4xl")}>
            {t("headingPlain")}
            <span className="italic text-falcon-deep"> {t("headingItalic")}</span>
          </h1>
        </div>

        {loading && email && <LoadingSkeleton />}

        {!loading && !email && (
          <EmailLookupForm onSubmit={handleEmailSubmit} submitting={submittingEmail} />
        )}

        {!loading && email && error && !registration && (
          <EmailLookupForm
            initialEmail={email}
            onSubmit={handleEmailSubmit}
            submitting={submittingEmail}
            lookupError={error}
          />
        )}

        {!loading && registration && (
          <div className="space-y-4 sm:space-y-5">
            {isVip && hasGuest ? (
              <>
                <ProfileSwitcherCard
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                  primaryLabel={primaryTabLabel}
                  guestLabel={guestTabLabel}
                  registration={registration}
                  adminStatus={adminStatus}
                  locale={locale}
                />

                {activeTab === "primary" ? (
                  <PrimaryTabPanel
                    showHero={false}
                    registration={registration}
                    adminStatus={adminStatus}
                    locale={locale}
                    bedroomLabel={bedroomLabel}
                  />
                ) : (
                  <GuestTabPanel
                    showHero={false}
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
                    <div className="space-y-4 sm:space-y-5">
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
        <section className="relative overflow-x-hidden pb-12 pt-20 sm:pb-20 sm:pt-28 md:pb-28 md:pt-36">
          <div className="container max-w-6xl">
            <LoadingSkeleton />
          </div>
        </section>
      }
    >
      <UserStatusContent />
    </Suspense>
  );
}
