"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { Country } from "react-phone-number-input";
import { useRouter } from "@/i18n/routing";
import FalconPhoneInput, { isValidPhoneNumber } from "@/components/ui/FalconPhoneInput";
import FalconDatePicker from "@/components/ui/FalconDatePicker";
import { detectClientCountryCode } from "@/lib/detectClientCountryCode";
import {
  COMPANION_RELATIONSHIPS,
  EMAIL_PATTERN,
  MEDIA_PARTNER_TYPES,
  PASSPORT_NUMBER_PATTERN,
  normalizePassportNumber,
  type SeatCategory,
} from "@/lib/seatBooking/categories";
import EmailVerification from "./EmailVerification";
import {
  CountrySelect,
  Field,
  PassportUpload,
  SectionTitle,
  SelectInput,
  YesNo,
  inputClass,
  type FileErrorKind,
} from "./fields";

type Values = {
  fullName: string;
  email: string;
  phone: string;
  countryOfResidence: string;
  passportNumber: string;
  passportExpiry: string;
  partnerType: string;
  organisation: string;
  profileLink: string;
  joiningWithSomeone: "" | "yes" | "no";
  companionFullName: string;
  companionRelationship: string;
  companionEmail: string;
  companionPhone: string;
  companionPassportNumber: string;
  companionPassportExpiry: string;
  consent: boolean;
};

const INITIAL: Values = {
  fullName: "",
  email: "",
  phone: "",
  countryOfResidence: "",
  passportNumber: "",
  passportExpiry: "",
  partnerType: "",
  organisation: "",
  profileLink: "",
  joiningWithSomeone: "",
  companionFullName: "",
  companionRelationship: "",
  companionEmail: "",
  companionPhone: "",
  companionPassportNumber: "",
  companionPassportExpiry: "",
  consent: false,
};

type Errors = Partial<Record<keyof Values | "passportFile" | "companionPassportFile", string>>;

function tomorrow() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 1);
  return d;
}

function inTwentyYears() {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 20);
  return d;
}

export default function SeatBookingForm({ category }: { category: SeatCategory }) {
  const t = useTranslations("seatBooking");
  const locale = useLocale();
  const router = useRouter();

  const [values, setValues] = useState<Values>(INITIAL);
  const [passportFile, setPassportFile] = useState<File | null>(null);
  const [companionPassportFile, setCompanionPassportFile] = useState<File | null>(null);
  const [proofToken, setProofToken] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [countryDetected, setCountryDetected] = useState(false);
  const [phoneCountry, setPhoneCountry] = useState<Country>(category.defaultPhoneCountry as Country);

  const showCompanion = category.allowCompanion && values.joiningWithSomeone === "yes";

  useEffect(() => {
    let cancelled = false;
    detectClientCountryCode().then((code) => {
      if (cancelled || !code) return;
      setValues((v) => (v.countryOfResidence ? v : { ...v, countryOfResidence: code }));
      setPhoneCountry(code as Country);
      setCountryDetected(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const set = <K extends keyof Values>(key: K, value: Values[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e));
  };

  const fileError = (kind: FileErrorKind) =>
    kind === "type" ? t("errors.fileType") : t("errors.fileSize");

  const validate = (): Errors => {
    const e: Errors = {};
    if (values.fullName.trim().length < 2) e.fullName = t("errors.fullName");
    if (!EMAIL_PATTERN.test(values.email.trim())) e.email = t("errors.email");
    else if (!proofToken) e.email = t("otp.required");
    if (!values.phone || !isValidPhoneNumber(values.phone)) e.phone = t("errors.phone");
    if (!values.countryOfResidence) e.countryOfResidence = t("errors.country");

    if (category.requiresPassport) {
      if (!PASSPORT_NUMBER_PATTERN.test(normalizePassportNumber(values.passportNumber))) {
        e.passportNumber = t("errors.passportNumber");
      }
      if (!values.passportExpiry) e.passportExpiry = t("errors.passportExpiry");
      if (!passportFile) e.passportFile = t("errors.passportFile");
    }

    if (category.hasOrganisation) {
      if (!values.partnerType) e.partnerType = t("errors.partnerType");
      if (values.organisation.trim().length < 2) e.organisation = t("errors.organisation");
      if (values.profileLink && !/^https?:\/\/\S+$/i.test(values.profileLink.trim())) {
        e.profileLink = t("errors.profileLink");
      }
    }

    if (category.allowCompanion) {
      if (!values.joiningWithSomeone) e.joiningWithSomeone = t("errors.joining");
      if (showCompanion) {
        if (values.companionFullName.trim().length < 2) e.companionFullName = t("errors.fullName");
        if (!values.companionRelationship) e.companionRelationship = t("errors.relationship");
        const cEmail = values.companionEmail.trim().toLowerCase();
        if (!EMAIL_PATTERN.test(cEmail)) e.companionEmail = t("errors.email");
        else if (cEmail === values.email.trim().toLowerCase()) e.companionEmail = t("errors.sameEmail");
        if (!values.companionPhone || !isValidPhoneNumber(values.companionPhone)) {
          e.companionPhone = t("errors.phone");
        }
        if (category.requiresPassport) {
          if (!PASSPORT_NUMBER_PATTERN.test(normalizePassportNumber(values.companionPassportNumber))) {
            e.companionPassportNumber = t("errors.passportNumber");
          }
          if (!values.companionPassportExpiry) e.companionPassportExpiry = t("errors.passportExpiry");
          if (!companionPassportFile) e.companionPassportFile = t("errors.passportFile");
        }
      }
    }

    if (!values.consent) e.consent = t("errors.consent");
    return e;
  };

  const serverFieldError = (field: string, code: string): string => {
    if (code === "PASSPORT_FILE_TOO_LARGE") return t("errors.fileSize");
    if (code === "PASSPORT_FILE_TYPE") return t("errors.fileType");
    if (code === "SAME_AS_PRIMARY") return t("errors.sameEmail");
    const map: Record<string, string> = {
      fullName: t("errors.fullName"),
      companionFullName: t("errors.fullName"),
      email: t("errors.email"),
      companionEmail: t("errors.email"),
      phone: t("errors.phone"),
      companionPhone: t("errors.phone"),
      countryOfResidence: t("errors.country"),
      passportNumber: t("errors.passportNumber"),
      companionPassportNumber: t("errors.passportNumber"),
      passportExpiry: t("errors.passportExpiry"),
      companionPassportExpiry: t("errors.passportExpiry"),
      passportFile: t("errors.passportFile"),
      companionPassportFile: t("errors.passportFile"),
      partnerType: t("errors.partnerType"),
      organisation: t("errors.organisation"),
      profileLink: t("errors.profileLink"),
      companionRelationship: t("errors.relationship"),
      consent: t("errors.consent"),
    };
    return map[field] ?? t("errors.required");
  };

  const scrollToFirstError = () => {
    window.requestAnimationFrame(() => {
      const el = document.querySelector('[role="alert"], [aria-invalid="true"]');
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError("");
    const found = validate();
    setErrors(found);
    if (Object.values(found).some(Boolean)) {
      setFormError(t("errors.fixFields"));
      scrollToFirstError();
      return;
    }

    const fd = new FormData();
    fd.set("locale", locale);
    fd.set("proofToken", proofToken);
    fd.set("fullName", values.fullName.trim());
    fd.set("email", values.email.trim().toLowerCase());
    fd.set("phone", values.phone);
    fd.set("countryOfResidence", values.countryOfResidence);
    fd.set("consent", String(values.consent));

    if (category.requiresPassport) {
      fd.set("passportNumber", normalizePassportNumber(values.passportNumber));
      fd.set("passportExpiry", values.passportExpiry);
      if (passportFile) fd.set("passportFile", passportFile);
    }
    if (category.hasOrganisation) {
      fd.set("partnerType", values.partnerType);
      fd.set("organisation", values.organisation.trim());
      fd.set("profileLink", values.profileLink.trim());
    }
    if (category.allowCompanion) {
      fd.set("joiningWithSomeone", values.joiningWithSomeone);
      if (showCompanion) {
        fd.set("companionFullName", values.companionFullName.trim());
        fd.set("companionRelationship", values.companionRelationship);
        fd.set("companionEmail", values.companionEmail.trim().toLowerCase());
        fd.set("companionPhone", values.companionPhone);
        if (category.requiresPassport) {
          fd.set("companionPassportNumber", normalizePassportNumber(values.companionPassportNumber));
          fd.set("companionPassportExpiry", values.companionPassportExpiry);
          if (companionPassportFile) fd.set("companionPassportFile", companionPassportFile);
        }
      }
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/seat-booking/${category.slug}`, { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success) {
        router.push(`/book-your-seat/thank-you?ref=${encodeURIComponent(data.reference)}&type=${category.slug}`);
        return;
      }

      if (data.code === "VALIDATION" && data.errors) {
        const mapped: Errors = {};
        for (const [field, code] of Object.entries(data.errors as Record<string, string>)) {
          mapped[field as keyof Errors] = serverFieldError(field, code);
        }
        setErrors(mapped);
        setFormError(t("errors.fixFields"));
        scrollToFirstError();
      } else if (data.code === "EMAIL_NOT_VERIFIED") {
        setProofToken("");
        setErrors({ email: t("errors.notVerified") });
        scrollToFirstError();
      } else if (data.code === "ALREADY_REGISTERED") {
        setFormError(t("errors.alreadyRegistered"));
      } else if (res.status === 429) {
        setFormError(t("errors.rateLimited"));
      } else {
        setFormError(t("errors.generic"));
      }
    } catch {
      setFormError(t("errors.generic"));
    } finally {
      setSubmitting(false);
    }
  };

  const minExpiry = tomorrow();
  const maxExpiry = inTwentyYears();
  let section = 0;
  const nextIndex = () => String(++section).padStart(2, "0");

  return (
    <form noValidate onSubmit={handleSubmit} className="space-y-10">
      {/* Personal */}
      <fieldset>
        <SectionTitle index={nextIndex()}>{t("form.sections.personal")}</SectionTitle>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            className="sm:col-span-2"
            label={category.requiresPassport ? t("form.fullName") : t("form.fullNameNoPassport")}
            htmlFor="seat-fullName"
            error={errors.fullName}
          >
            <input
              id="seat-fullName"
              autoComplete="name"
              value={values.fullName}
              onChange={(e) => set("fullName", e.target.value)}
              className={inputClass(errors.fullName)}
              aria-invalid={!!errors.fullName}
            />
          </Field>

          <div className="sm:col-span-2">
            <EmailVerification
              email={values.email}
              onEmailChange={(v) => set("email", v)}
              name={values.fullName}
              category={category.slug}
              locale={locale}
              proofToken={proofToken}
              onVerified={(token) => {
                setProofToken(token);
                setErrors((e) => ({ ...e, email: undefined }));
              }}
              onReset={() => setProofToken("")}
              error={errors.email}
            />
          </div>

          <Field label={t("form.phone")} htmlFor="seat-phone" error={errors.phone}>
            <FalconPhoneInput
              key={phoneCountry}
              id="seat-phone"
              value={values.phone}
              onChange={(v) => set("phone", v ?? "")}
              defaultCountry={phoneCountry}
              error={errors.phone}
            />
          </Field>

          <Field
            label={t("form.country")}
            htmlFor="seat-country"
            error={errors.countryOfResidence}
            hint={countryDetected ? t("form.countryDetected") : undefined}
          >
            <CountrySelect
              id="seat-country"
              value={values.countryOfResidence}
              onChange={(v) => set("countryOfResidence", v)}
              locale={locale}
              placeholder={t("form.countryPlaceholder")}
              error={errors.countryOfResidence}
            />
          </Field>
        </div>
      </fieldset>

      {/* Organisation */}
      {category.hasOrganisation && (
        <fieldset>
          <SectionTitle index={nextIndex()}>{t("form.sections.organisation")}</SectionTitle>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              className="sm:col-span-2"
              label={t("form.partnerType")}
              error={errors.partnerType}
            >
              <div role="radiogroup" className="grid gap-3 sm:grid-cols-3">
                {MEDIA_PARTNER_TYPES.map((type) => {
                  const active = values.partnerType === type;
                  return (
                    <label
                      key={type}
                      className={`flex min-h-12 cursor-pointer items-center justify-center rounded-xl border px-3 py-2 text-center font-poppins text-sm font-medium transition ${
                        active
                          ? "border-ink bg-ink text-falcon-light shadow-md"
                          : `bg-white text-ink/70 hover:border-falcon-gold ${errors.partnerType ? "border-red-400" : "border-ink/15"}`
                      }`}
                    >
                      <input
                        type="radio"
                        name="partnerType"
                        value={type}
                        checked={active}
                        onChange={() => set("partnerType", type)}
                        className="sr-only"
                      />
                      {t(`form.partnerTypes.${type}`)}
                    </label>
                  );
                })}
              </div>
            </Field>
            <Field label={t("form.organisation")} htmlFor="seat-org" error={errors.organisation}>
              <input
                id="seat-org"
                autoComplete="organization"
                value={values.organisation}
                onChange={(e) => set("organisation", e.target.value)}
                className={inputClass(errors.organisation)}
                aria-invalid={!!errors.organisation}
              />
            </Field>
            <Field label={t("form.profileLink")} htmlFor="seat-link" error={errors.profileLink}>
              <input
                id="seat-link"
                type="url"
                inputMode="url"
                placeholder={t("form.profileLinkPlaceholder")}
                value={values.profileLink}
                onChange={(e) => set("profileLink", e.target.value)}
                className={inputClass(errors.profileLink)}
                aria-invalid={!!errors.profileLink}
              />
            </Field>
          </div>
        </fieldset>
      )}

      {/* Passport */}
      {category.requiresPassport && (
        <fieldset>
          <SectionTitle index={nextIndex()}>{t("form.sections.passport")}</SectionTitle>
          <PassportBlock
            prefix="seat"
            number={values.passportNumber}
            onNumber={(v) => set("passportNumber", v)}
            expiry={values.passportExpiry}
            onExpiry={(v) => set("passportExpiry", v)}
            file={passportFile}
            onFile={(f) => {
              setPassportFile(f);
              setErrors((e) => ({ ...e, passportFile: undefined }));
            }}
            onFileInvalid={(k) => setErrors((e) => ({ ...e, passportFile: fileError(k) }))}
            labels={{
              number: t("form.passportNumber"),
              expiry: t("form.passportExpiry"),
              file: t("form.passportFile"),
            }}
            errors={{
              number: errors.passportNumber,
              expiry: errors.passportExpiry,
              file: errors.passportFile,
            }}
            minDate={minExpiry}
            maxDate={maxExpiry}
          />
        </fieldset>
      )}

      {/* Companion */}
      {category.allowCompanion && (
        <fieldset>
          <SectionTitle index={nextIndex()}>{t("form.sections.companion")}</SectionTitle>
          <Field label={t("form.joining")} error={errors.joiningWithSomeone}>
            <YesNo
              name="joiningWithSomeone"
              value={values.joiningWithSomeone}
              onChange={(v) => set("joiningWithSomeone", v)}
              yes={t("form.yes")}
              no={t("form.no")}
              error={errors.joiningWithSomeone}
            />
          </Field>

          <div
            className={`grid transition-all duration-500 ease-out ${
              showCompanion ? "mt-6 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
            }`}
            aria-hidden={!showCompanion}
          >
            <div className="overflow-hidden">
              {showCompanion && (
                <div className="rounded-2xl border border-falcon-gold/30 bg-parchment-light/70 p-4 sm:p-6">
                  <p className="mb-5 font-poppins text-sm text-ink/60">{t("form.companionIntro")}</p>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field
                      label={t("form.companionFullName")}
                      htmlFor="seat-c-name"
                      error={errors.companionFullName}
                    >
                      <input
                        id="seat-c-name"
                        value={values.companionFullName}
                        onChange={(e) => set("companionFullName", e.target.value)}
                        className={inputClass(errors.companionFullName)}
                        aria-invalid={!!errors.companionFullName}
                      />
                    </Field>
                    <Field
                      label={t("form.companionRelationship")}
                      htmlFor="seat-c-rel"
                      error={errors.companionRelationship}
                    >
                      <SelectInput
                        id="seat-c-rel"
                        value={values.companionRelationship}
                        onChange={(v) => set("companionRelationship", v)}
                        placeholder={t("form.relationshipPlaceholder")}
                        options={COMPANION_RELATIONSHIPS.map((r) => ({
                          value: r,
                          label: t(`form.relationships.${r}`),
                        }))}
                        error={errors.companionRelationship}
                      />
                    </Field>
                    <Field
                      label={t("form.companionEmail")}
                      htmlFor="seat-c-email"
                      error={errors.companionEmail}
                    >
                      <input
                        id="seat-c-email"
                        type="email"
                        inputMode="email"
                        value={values.companionEmail}
                        onChange={(e) => set("companionEmail", e.target.value)}
                        className={inputClass(errors.companionEmail)}
                        aria-invalid={!!errors.companionEmail}
                      />
                    </Field>
                    <Field
                      label={t("form.companionPhone")}
                      htmlFor="seat-c-phone"
                      error={errors.companionPhone}
                    >
                      <FalconPhoneInput
                        key={`c-${phoneCountry}`}
                        id="seat-c-phone"
                        value={values.companionPhone}
                        onChange={(v) => set("companionPhone", v ?? "")}
                        defaultCountry={phoneCountry}
                        error={errors.companionPhone}
                      />
                    </Field>
                  </div>

                  {category.requiresPassport && (
                    <div className="mt-6 border-t border-ink/10 pt-6">
                      <PassportBlock
                        prefix="seat-c"
                                    number={values.companionPassportNumber}
                        onNumber={(v) => set("companionPassportNumber", v)}
                        expiry={values.companionPassportExpiry}
                        onExpiry={(v) => set("companionPassportExpiry", v)}
                        file={companionPassportFile}
                        onFile={(f) => {
                          setCompanionPassportFile(f);
                          setErrors((e) => ({ ...e, companionPassportFile: undefined }));
                        }}
                        onFileInvalid={(k) =>
                          setErrors((e) => ({ ...e, companionPassportFile: fileError(k) }))
                        }
                        labels={{
                          number: t("form.companionPassportNumber"),
                          expiry: t("form.companionPassportExpiry"),
                          file: t("form.companionPassportFile"),
                        }}
                        errors={{
                          number: errors.companionPassportNumber,
                          expiry: errors.companionPassportExpiry,
                          file: errors.companionPassportFile,
                        }}
                        minDate={minExpiry}
                        maxDate={maxExpiry}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </fieldset>
      )}

      {/* Consent + submit */}
      <div className="space-y-5 border-t border-ink/10 pt-8">
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={values.consent}
            onChange={(e) => set("consent", e.target.checked)}
            className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer rounded border-ink/30 accent-[#1C1912]"
            aria-invalid={!!errors.consent}
          />
          <span className="font-poppins text-[13px] leading-relaxed text-ink/70">{t("form.consent")}</span>
        </label>
        {errors.consent && (
          <p role="alert" className="-mt-3 ps-8 font-poppins text-xs text-red-600">
            {errors.consent}
          </p>
        )}

        {formError && (
          <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 font-poppins text-sm text-red-700">
            {formError}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="group relative flex h-14 w-full items-center justify-center gap-3 overflow-hidden rounded-full bg-ink font-poppins text-[15px] font-semibold tracking-wide text-falcon-light shadow-[0_12px_30px_-12px_rgba(28,25,18,0.6)] transition hover:bg-ink-soft disabled:cursor-wait disabled:opacity-80"
        >
          <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-falcon-gold/25 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
          {submitting && (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-falcon-light/30 border-t-falcon-light" />
          )}
          <span className="relative">{submitting ? t("form.submitting") : t("form.submit")}</span>
          {!submitting && (
            <span className="relative flex h-7 w-7 items-center justify-center rounded-full bg-falcon-gold text-ink transition group-hover:translate-x-1 rtl:-scale-x-100">
              <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                <path d="M3 8h10m0 0L9 4m4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          )}
        </button>
      </div>
    </form>
  );
}

function PassportBlock({
  prefix,
  number,
  onNumber,
  expiry,
  onExpiry,
  file,
  onFile,
  onFileInvalid,
  labels,
  errors,
  minDate,
  maxDate,
}: {
  prefix: string;
  number: string;
  onNumber: (v: string) => void;
  expiry: string;
  onExpiry: (v: string) => void;
  file: File | null;
  onFile: (f: File | null) => void;
  onFileInvalid: (k: FileErrorKind) => void;
  labels: { number: string; expiry: string; file: string };
  errors: { number?: string; expiry?: string; file?: string };
  minDate: Date;
  maxDate: Date;
}) {
  const t = useTranslations("seatBooking");
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <Field label={labels.number} htmlFor={`${prefix}-pp-number`} error={errors.number}>
        <input
          id={`${prefix}-pp-number`}
          value={number}
          autoCapitalize="characters"
          spellCheck={false}
          onChange={(e) => onNumber(e.target.value.toUpperCase())}
          className={`${inputClass(errors.number)} uppercase tracking-[0.15em]`}
          aria-invalid={!!errors.number}
        />
      </Field>
      <Field
        label={labels.expiry}
        htmlFor={`${prefix}-pp-expiry`}
        error={errors.expiry}
        hint={t("form.passportExpiryHint")}
      >
        <FalconDatePicker
          id={`${prefix}-pp-expiry`}
          value={expiry}
          onChange={onExpiry}
          error={errors.expiry}
          placeholder={t("form.datePlaceholder")}
          minDate={minDate}
          maxDate={maxDate}
        />
      </Field>
      <Field
        className="sm:col-span-2"
        label={labels.file}
        error={errors.file}
        hint={t("form.passportFileHint")}
      >
        <PassportUpload
          id={`${prefix}-pp-file`}
          file={file}
          onChange={onFile}
          onInvalid={onFileInvalid}
          cta={t("form.uploadCta")}
          replaceLabel={t("form.replaceFile")}
          removeLabel={t("form.removeFile")}
          error={errors.file}
        />
      </Field>
    </div>
  );
}
