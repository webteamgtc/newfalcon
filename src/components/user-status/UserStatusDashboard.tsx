"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import type { PublicPassportDocument, PublicUserRegistration } from "@/lib/userStatus";

function formatDisplayDate(value: string, locale: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-AE" : "en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function PassportDocumentCard({
  label,
  document,
  viewLabel,
  legacyLabel,
  openLabel,
}: {
  label: string;
  document?: PublicPassportDocument;
  viewLabel: string;
  legacyLabel: string;
  openLabel: string;
}) {
  if (!document?.uploaded) {
    return null;
  }

  const mimeType = document.mimeType || "";
  const isPdf = mimeType === "application/pdf";
  const isImage = mimeType.startsWith("image/");

  return (
    <div className="rounded-xl border border-ink/10 bg-[#FFFDF8] p-4 md:p-5">
      <p className="font-poppins text-xs uppercase tracking-[0.08em] text-ink/50">{label}</p>
      {document.fileName && (
        <p className="mt-1 font-poppins text-sm text-ink/75">{document.fileName}</p>
      )}

      {document.url && isImage && (
        <div className="mt-4 overflow-hidden rounded-lg border border-ink/15 bg-white p-2">
          <img
            src={document.url}
            alt={label}
            className="mx-auto max-h-80 w-full object-contain"
          />
        </div>
      )}

      {document.url && isPdf && (
        <iframe
          src={document.url}
          title={label}
          className="mt-4 h-96 w-full rounded-lg border border-ink/15 bg-white"
        />
      )}

      {document.url && (
        <a
          href={document.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center rounded-full border border-falcon-deep px-4 py-2 font-poppins text-xs uppercase tracking-[0.1em] text-falcon-deep transition-colors hover:bg-falcon-deep hover:text-white"
        >
          {openLabel}
        </a>
      )}

      {document.legacyStored && !document.url && (
        <p className="mt-2 font-poppins text-xs text-ink/55">{legacyLabel}</p>
      )}

      {!document.url && !document.legacyStored && (
        <p className="mt-2 font-poppins text-xs text-ink/55">{viewLabel}</p>
      )}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  if (!value?.trim()) return null;

  return (
    <div className="border-b border-ink/10 py-3 last:border-b-0">
      <dt className="font-poppins text-xs uppercase tracking-[0.08em] text-ink/50">{label}</dt>
      <dd className="mt-1 font-poppins text-sm text-ink">{value}</dd>
    </div>
  );
}

function StatusBadge({ status }: { status: PublicUserRegistration["status"] }) {
  const t = useTranslations("userStatusPage");

  const styles =
    status === "registered"
      ? "bg-emerald-100 text-emerald-800 border-emerald-200"
      : "bg-amber-100 text-amber-900 border-amber-200";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 font-poppins text-xs font-medium uppercase tracking-[0.08em] ${styles}`}
    >
      {t(`status.${status}`)}
    </span>
  );
}

function UserStatusContent() {
  const t = useTranslations("userStatusPage");
  const locale = useLocale();
  const searchParams = useSearchParams();
  const email = searchParams.get("email")?.trim() ?? "";

  const [loading, setLoading] = useState(true);
  const [registration, setRegistration] = useState<PublicUserRegistration | null>(null);
  const [error, setError] = useState("");

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
        const response = await fetch(
          `/api/user-status?email=${encodeURIComponent(email)}`
        );
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
    return () => {
      cancelled = true;
    };
  }, [email, t]);

  const bedroomLabel = (value: string) => {
    if (value === "single_bed") return t("bedroom.singleBed");
    if (value === "master_bed") return t("bedroom.masterBed");
    if (value === "extra_room") return t("bedroom.extraRoom");
    return value;
  };

  return (
    <section className="relative pb-16 pt-32 md:pb-24 md:pt-40">
      <div className="container max-w-4xl">
        <div className="mb-8">
          <p className="eyebrow !capitalize text-ink/65">
            <span className="font-poppins">{t("eyebrow")}</span>
          </p>
          <h1 className="mt-4 font-display HeadingH1 !font-medium !text-ink">
            {t("headingPlain")}
            <span className="italic text-falcon-deep"> {t("headingItalic")}</span>
          </h1>
          <p className="mt-4 max-w-2xl TextSmall !font-poppins !text-ink/70">{t("description")}</p>
        </div>

        {loading && (
          <div className="rounded-2xl border border-ink/10 bg-white/80 p-10 text-center shadow-sm">
            <p className="font-poppins text-sm text-ink/60">{t("loading")}</p>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
            <p className="font-display text-xl text-red-800">{t("errors.title")}</p>
            <p className="mt-2 font-poppins text-sm text-red-700">{error}</p>
          </div>
        )}

        {!loading && registration && (
          <div className="space-y-6">
            <div className="overflow-hidden rounded-2xl border border-[#382910]/12 bg-gradient-to-br from-[#FDFCFA] via-[#FBF6EB] to-[#F3E5CB] p-6 shadow-[0_28px_70px_-28px_rgba(56,41,16,0.25)] md:p-8">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="font-poppins text-xs uppercase tracking-[0.12em] text-ink/50">
                    {t("referenceId")}
                  </p>
                  <p className="mt-1 font-mono text-sm text-ink/80">{registration.id}</p>
                  <h2 className="mt-4 font-display text-2xl text-ink">{registration.fullName}</h2>
                  <p className="mt-1 font-poppins text-sm text-ink/65">{registration.email}</p>
                </div>
                <StatusBadge status={registration.status} />
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <div className="rounded-xl border border-ink/10 bg-white/70 p-4">
                  <p className="font-poppins text-xs uppercase tracking-[0.08em] text-ink/50">
                    {t("cards.submitted")}
                  </p>
                  <p className="mt-2 font-poppins text-sm text-ink">
                    {formatDisplayDate(registration.submittedAt, locale)}
                  </p>
                </div>
                <div className="rounded-xl border border-ink/10 bg-white/70 p-4">
                  <p className="font-poppins text-xs uppercase tracking-[0.08em] text-ink/50">
                    {t("cards.formType")}
                  </p>
                  <p className="mt-2 font-poppins text-sm text-ink">
                    {registration.formType === "vip_ticket_booking"
                      ? t("formTypes.vipTicket")
                      : t("formTypes.staff")}
                  </p>
                </div>
                <div className="rounded-xl border border-ink/10 bg-white/70 p-4">
                  <p className="font-poppins text-xs uppercase tracking-[0.08em] text-ink/50">
                    {t("cards.documents")}
                  </p>
                  <p className="mt-2 font-poppins text-sm text-ink">
                    {registration.passportPhotoUploaded
                      ? t("cards.documentUploaded")
                      : t("cards.noDocument")}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-ink/10 bg-white p-6 md:p-8">
              <h3 className="font-display text-xl text-ink">{t("sections.personal")}</h3>
              <dl className="mt-4">
                <DetailRow label={t("fields.fullName")} value={registration.fullName} />
                <DetailRow label={t("fields.email")} value={registration.email} />
                <DetailRow label={t("fields.phone")} value={registration.phone} />
                {registration.memberId && (
                  <DetailRow label={t("fields.memberId")} value={registration.memberId} />
                )}
                {registration.ibId && (
                  <DetailRow label={t("fields.ibId")} value={registration.ibId} />
                )}
                {registration.lineManagerName && (
                  <DetailRow
                    label={t("fields.lineManagerName")}
                    value={registration.lineManagerName}
                  />
                )}
              </dl>
            </div>

            {registration.formType === "vip_ticket_booking" && (
              <div className="rounded-2xl border border-ink/10 bg-white p-6 md:p-8">
                <h3 className="font-display text-xl text-ink">{t("sections.travel")}</h3>
                <dl className="mt-4">
                  <DetailRow
                    label={t("fields.passportNumber")}
                    value={registration.passportNumber ?? ""}
                  />
                  <DetailRow
                    label={t("fields.passportExpiry")}
                    value={formatDisplayDate(registration.passportExpiry ?? "", locale)}
                  />
                  <DetailRow
                    label={t("fields.nationality")}
                    value={registration.nationality ?? ""}
                  />
                  <DetailRow
                    label={t("fields.dateOfBirth")}
                    value={formatDisplayDate(registration.dateOfBirth ?? "", locale)}
                  />
                  <DetailRow
                    label={t("fields.invitingGuest")}
                    value={registration.invitingGuest ? t("options.yes") : t("options.no")}
                  />
                  {registration.specialRequirements && (
                    <DetailRow
                      label={t("fields.specialRequirements")}
                      value={registration.specialRequirements}
                    />
                  )}
                </dl>

                <PassportDocumentCard
                  label={t("fields.passportPhoto")}
                  document={registration.passportPhoto}
                  viewLabel={t("cards.viewDocument")}
                  legacyLabel={t("cards.legacyDocument")}
                  openLabel={t("cards.openDocument")}
                />
              </div>
            )}

            {registration.guest && (
              <div className="rounded-2xl border border-ink/10 bg-white p-6 md:p-8">
                <h3 className="font-display text-xl text-ink">{t("sections.guest")}</h3>
                <dl className="mt-4">
                  <DetailRow label={t("fields.guestFirstName")} value={registration.guest.firstName} />
                  <DetailRow label={t("fields.guestEmail")} value={registration.guest.email} />
                  <DetailRow label={t("fields.guestPhone")} value={registration.guest.phone} />
                  <DetailRow
                    label={t("fields.guestPassportNumber")}
                    value={registration.guest.passportNumber}
                  />
                  <DetailRow
                    label={t("fields.guestPassportExpiry")}
                    value={formatDisplayDate(registration.guest.passportExpiry, locale)}
                  />
                  <DetailRow
                    label={t("fields.guestNationality")}
                    value={registration.guest.nationality}
                  />
                  <DetailRow
                    label={t("fields.bedroomPreference")}
                    value={bedroomLabel(registration.guest.bedroomPreference)}
                  />
                </dl>

                <PassportDocumentCard
                  label={t("fields.guestPassportPhoto")}
                  document={registration.guest.passportPhoto}
                  viewLabel={t("cards.viewDocument")}
                  legacyLabel={t("cards.legacyDocument")}
                  openLabel={t("cards.openDocument")}
                />
              </div>
            )}

            <div className="rounded-2xl border border-ink/10 bg-[#FFFDF8] p-6 md:p-8">
              <h3 className="font-display text-xl text-ink">{t("sections.nextSteps")}</h3>
              <p className="mt-3 font-poppins text-sm leading-relaxed text-ink/70">
                {t("nextStepsDescription")}
              </p>
              <p className="mt-4 font-poppins text-sm text-ink/60">
                {t("supportNote")}{" "}
                <a href="mailto:support@gtcfx.com" className="text-falcon-deep underline">
                  support@gtcfx.com
                </a>
              </p>
            </div>
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
        <section className="relative pb-16 pt-32 md:pb-24 md:pt-40">
          <div className="container max-w-4xl">
            <div className="rounded-2xl border border-ink/10 bg-white/80 p-10 text-center shadow-sm">
              <p className="font-poppins text-sm text-ink/60">{t("loading")}</p>
            </div>
          </div>
        </section>
      }
    >
      <UserStatusContent />
    </Suspense>
  );
}
