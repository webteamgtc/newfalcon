"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "react-toastify";
import Button from "@/components/Button";
import OtpBoxes from "@/components/ui/OtpBoxes";
import FalconPhoneInput, { isValidPhoneNumber } from "@/components/ui/FalconPhoneInput";
import { sendConfirmationEmail } from "@/lib/sendConfirmationEmail";
import { OTP_TTL_MS } from "@/lib/otpConstants";
import type { IbClientData, IbPerformanceData, VipUser } from "@/data/vipUsers";
import { useRouter } from "@/i18n/routing";

const PUBLIC_BOOKING_STORAGE_KEY = "gfn_public_vip_ticket_booking";

type PublicVipTicketBookingFormProps = {
  user?: VipUser;
  onSuccess?: () => void;
};

type GtcCountry = {
  name: string;
  phone_code?: string;
};

type FormState = {
  fullName: string;
  email: string;
  phone: string;
  countryOfResidence: string;
  ibId: string;
  terms: boolean;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

function fieldClass(error?: string) {
  return `mt-2 h-12 w-full rounded-md border bg-white px-3 font-poppins text-sm text-ink outline-none placeholder:text-ink/40 transition-colors focus:border-falcon-deep ${
    error ? "border-red-500" : "border-ink/20"
  }`;
}

function formatOtpCountdown(remainingMs: number) {
  const totalSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

type VerifiedIbClient = {
  client: IbClientData;
  performance: IbPerformanceData;
};

async function verifyIbClientBeforeBooking(email: string): Promise<VerifiedIbClient | null> {
  try {
    const response = await fetch("/api/ib-client/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim().toLowerCase() }),
    });

    const data = await response.json();

    if (!response.ok || !data?.success || !data?.client) {
      return null;
    }

    return {
      client: data.client as IbClientData,
      performance: (data.performance ?? null) as IbPerformanceData,
    };
  } catch {
    return null;
  }
}

export default function PublicVipTicketBookingForm({
  user,
  onSuccess,
}: PublicVipTicketBookingFormProps) {
  const t = useTranslations("vipPage.ticketBooking");
  const tOtp = useTranslations("vipPage.publicTicketBooking");
  const locale = useLocale();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  const [verificationToken, setVerificationToken] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpExpiresAt, setOtpExpiresAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [countries, setCountries] = useState<GtcCountry[]>([]);
  const [countriesLoading, setCountriesLoading] = useState(true);
  const [verifiedIbClient, setVerifiedIbClient] = useState<VerifiedIbClient | null>(null);
  const [verifiedIbClientEmail, setVerifiedIbClientEmail] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({
    fullName: user ? `${user.firstName} ${user.lastName}`.trim() : "",
    email: user?.email ?? "",
    phone: "",
    countryOfResidence: "",
    ibId: user?.ibId ?? "",
    terms: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const otpRemainingMs = otpExpiresAt && otpExpiresAt > now ? otpExpiresAt - now : 0;
  const sortedCountries = [...countries].sort((a, b) => a.name.localeCompare(b.name));

  const expireOtpSession = useCallback(() => {
    setShowOtp(false);
    setOtpInput("");
    setVerificationToken("");
    setOtpExpiresAt(null);
    setOtpError(tOtp("otpExpired"));
  }, [tOtp]);

  useEffect(() => {
    if (!otpExpiresAt || otpVerified) return;

    const interval = window.setInterval(() => {
      const current = Date.now();
      setNow(current);
      if (current >= otpExpiresAt) {
        expireOtpSession();
      }
    }, 1000);

    return () => window.clearInterval(interval);
  }, [otpExpiresAt, otpVerified, expireOtpSession]);

  useEffect(() => {
    let cancelled = false;

    async function loadCountries() {
      try {
        const response = await fetch("/api/gtc/get-country", { method: "POST" });
        const data = await response.json();
        if (!cancelled && data?.code === 200 && Array.isArray(data.data)) {
          setCountries(data.data);
        }
      } catch {
        // ignore
      } finally {
        if (!cancelled) setCountriesLoading(false);
      }
    }

    void loadCountries();
    return () => {
      cancelled = true;
    };
  }, []);

  const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));

    if (key === "email" && typeof value === "string") {
      const normalized = value.trim().toLowerCase();
      if (verifiedIbClientEmail && verifiedIbClientEmail !== normalized) {
        setVerifiedIbClient(null);
        setVerifiedIbClientEmail(null);
        setShowOtp(false);
        setOtpVerified(false);
        setOtpInput("");
        setVerificationToken("");
        setOtpExpiresAt(null);
      }
    }
  };

  const validateEmailFormat = () => {
    const trimmedEmail = form.email.trim().toLowerCase();
    if (!trimmedEmail) {
      setErrors((prev) => ({ ...prev, email: tOtp("emailRequired") }));
      return null;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setErrors((prev) => ({ ...prev, email: tOtp("emailInvalid") }));
      return null;
    }
    setErrors((prev) => ({ ...prev, email: undefined }));
    return trimmedEmail;
  };
  

  const handleGetOtp = async () => {
    const trimmedEmail = validateEmailFormat();
    if (!trimmedEmail) return;

    setOtpLoading(true);
    setOtpError("");

    try {
      let ibClientData =
        verifiedIbClientEmail === trimmedEmail ? verifiedIbClient : null;

      if (verifiedIbClientEmail !== trimmedEmail) {
        ibClientData = await verifyIbClientBeforeBooking(trimmedEmail);
        setVerifiedIbClient(ibClientData);
        setVerifiedIbClientEmail(trimmedEmail);
      }

      const ibIdForEmail =
        form.ibId.trim() ||
        ibClientData?.client.memberId ||
        user?.ibId ||
        user?.memberId ||
        "";

      const response = await fetch("/api/otp-smtp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: trimmedEmail,
          first_name: form.fullName.trim() || trimmedEmail.split("@")[0] || "Guest",
          ibId: ibIdForEmail,
          locale,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || data?.error || tOtp("otpSendFailed"));
      }

      setForm((prev) => ({ ...prev, email: trimmedEmail }));
      setShowOtp(true);
      setOtpInput("");
      setVerificationToken(data.verificationToken || "");
      setOtpVerified(false);
      setOtpExpiresAt(Date.now() + OTP_TTL_MS);
      setNow(Date.now());
    } catch (error) {
      setOtpError(error instanceof Error ? error.message : tOtp("otpSendFailed"));
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setOtpError("");

    if (otpExpiresAt && Date.now() >= otpExpiresAt) {
      expireOtpSession();
      return false;
    }

    if (!showOtp || otpInput.length !== 6) {
      setOtpError(tOtp("otpRequired"));
      return false;
    }

    if (!verificationToken) {
      setOtpError(tOtp("otpSendFailed"));
      return false;
    }

    setOtpVerifying(true);

    try {
      const response = await fetch("/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email.trim(),
          otp: otpInput.trim(),
          verificationToken,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data?.success) {
        setOtpError(tOtp("otpInvalid"));
        return false;
      }

      setOtpVerified(true);
      toast.success(tOtp("emailVerified"));
      return true;
    } catch {
      setOtpError(tOtp("otpInvalid"));
      return false;
    } finally {
      setOtpVerifying(false);
    }
  };

  const validate = () => {
    const nextErrors: FormErrors = {};

    if (!otpVerified) {
      toast.error(tOtp("verifyEmailFirst"));
      return false;
    }

    if (!form.fullName.trim()) nextErrors.fullName = t("errors.fullName");
    if (!form.phone.trim()) {
      nextErrors.phone = t("errors.phone");
    } else if (!isValidPhoneNumber(form.phone)) {
      nextErrors.phone = t("errors.phoneInvalid");
    }
    if (!form.countryOfResidence.trim()) {
      nextErrors.countryOfResidence = tOtp("countryRequired");
    }
    if (!form.terms) nextErrors.terms = t("errors.terms");

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!otpVerified) {
      toast.error(tOtp("verifyEmailFirst"));
      return;
    }
    if (!validate()) return;

    setLoading(true);

    try {
      const registrationUserId = user?.id ?? `public_${form.email.trim().toLowerCase()}`;
      const normalizedEmail = form.email.trim().toLowerCase();
      const cachedIbClient =
        verifiedIbClientEmail === normalizedEmail ? verifiedIbClient : null;

      const memberId = cachedIbClient?.client.memberId || user?.memberId || "PUBLIC";
      const ibId = form.ibId.trim() || cachedIbClient?.client.memberId || user?.ibId || "";

      const payload = new FormData();
      payload.append("leadForm", "true");
      payload.append("fullName", form.fullName);
      payload.append("email", form.email);
      payload.append("phone", form.phone);
      payload.append("nationality", form.countryOfResidence);
      payload.append("passportNumber", "");
      payload.append("passportExpiry", "");
      payload.append("dateOfBirth", "");
      payload.append("invitingGuest", "no");
      payload.append("specialRequirements", "");
      payload.append("memberId", memberId);
      payload.append("userId", registrationUserId);
      payload.append("ibId", ibId);
      payload.append("ibClient", cachedIbClient ? JSON.stringify(cachedIbClient) : "null");
      payload.append("terms", String(form.terms));

      const response = await fetch("/api/vip-ticket-booking", {
        method: "POST",
        body: payload,
      });

      const data = await response.json();

      if (!response.ok || !data?.success) {
        if (data?.code === "EMAIL_ALREADY_EXISTS") {
          setErrors((prev) => ({ ...prev, email: t("errors.emailAlreadyExists") }));
          toast.error(t("errors.emailAlreadyExists"));
          return;
        }

        throw new Error(data?.message || t("submitFailed"));
      }

      try {
        sessionStorage.setItem(
          `${PUBLIC_BOOKING_STORAGE_KEY}_${registrationUserId}`,
          JSON.stringify({
            ...form,
            memberId,
            ibClient: cachedIbClient,
            submittedAt: new Date().toISOString(),
            mongoId: data.id,
          })
        );
      } catch {
        // ignore
      }

      await sendConfirmationEmail({
        email: form.email,
        first_name: form.fullName,
        formType: "vip_ticket_booking",
        referenceId: data.id,
        locale,
      });

      onSuccess?.();
      router.push(
        `/success?email=${encodeURIComponent(form.email)}&name=${encodeURIComponent(form.fullName)}`
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("submitFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-xl border border-[#382910]/15 bg-white/70 p-4 md:p-5">
        <p className="font-display text-base font-medium text-ink">{tOtp("verificationTitle")}</p>
        <p className="mt-1 TextSmall !font-poppins !text-ink/70">{tOtp("verificationDescription")}</p>

        <div className="mt-4">
          <label className="form-field-label font-poppins text-sm text-ink/70">
            {t("fields.email")} *
          </label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => updateField("email", e.target.value)}
            readOnly={otpVerified}
            className={`${fieldClass(errors.email)} ${otpVerified ? "bg-ink/5" : ""}`}
            placeholder={tOtp("emailPlaceholder")}
          />
          {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
        </div>

        {!otpVerified && (
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleGetOtp}
              disabled={otpLoading || otpVerified}
              className="rounded-full border border-falcon-deep px-4 py-2 font-poppins text-xs uppercase tracking-[0.08em] text-falcon-deep transition-colors hover:bg-falcon-deep hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {otpLoading ? tOtp("sendingOtp") : tOtp("getOtp")}
            </button>
          </div>
        )}

        {showOtp && !otpVerified && (
          <div className="mt-4 space-y-3">
            <label className="form-field-label font-poppins text-sm text-ink/70">
              {tOtp("otpLabel")}
            </label>
            <OtpBoxes value={otpInput} onChange={setOtpInput} disabled={otpVerifying} />
            {otpRemainingMs > 0 && (
              <p className="font-poppins text-xs text-ink/55">
                {tOtp("otpExpiresIn", { time: formatOtpCountdown(otpRemainingMs) })}
              </p>
            )}
            {otpError && <p className="text-xs text-red-600">{otpError}</p>}
            <button
              type="button"
              onClick={handleVerifyOtp}
              disabled={otpVerifying || otpInput.length !== 6}
              className="rounded-full bg-falcon-deep px-4 py-2 font-poppins text-xs uppercase tracking-[0.08em] text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {otpVerifying ? tOtp("verifyingOtp") : tOtp("verifyOtp")}
            </button>
          </div>
        )}

        {otpVerified && (
          <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 font-poppins text-sm text-emerald-800">
            {tOtp("emailVerified")}
          </p>
        )}
      </div>

      <fieldset disabled={!otpVerified} className="space-y-4 disabled:opacity-60">
        <p className="TextSmall !font-poppins !text-ink/75">{tOtp("leadDescription")}</p>

        <div>
          <label className="form-field-label font-poppins text-sm text-ink/70">
            {t("fields.fullName")} *
          </label>
          <input
            type="text"
            value={form.fullName}
            onChange={(e) => updateField("fullName", e.target.value)}
            className={fieldClass(errors.fullName)}
            placeholder={t("placeholders.fullName")}
          />
          {errors.fullName && <p className="mt-1 text-xs text-red-600">{errors.fullName}</p>}
        </div>

        <div>
          <label htmlFor="public-vip-phone" className="form-field-label font-poppins text-sm text-ink/70">
            {t("fields.phone")} *
          </label>
          <FalconPhoneInput
            id="public-vip-phone"
            value={form.phone}
            onChange={(value) => updateField("phone", value)}
            error={errors.phone}
          />
          {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
        </div>

        <div>
          <label htmlFor="public-vip-country" className="form-field-label font-poppins text-sm text-ink/70">
            {tOtp("countryOfResidenceLabel")} *
          </label>
          <select
            id="public-vip-country"
            value={form.countryOfResidence}
            onChange={(e) => updateField("countryOfResidence", e.target.value)}
            className={`${fieldClass(errors.countryOfResidence)} appearance-none`}
          >
            <option value="">
              {countriesLoading ? tOtp("countryLoading") : tOtp("countrySelect")}
            </option>
            {sortedCountries.map((country) => (
              <option key={country.name} value={country.name}>
                {country.name}
              </option>
            ))}
          </select>
          {errors.countryOfResidence && (
            <p className="mt-1 text-xs text-red-600">{errors.countryOfResidence}</p>
          )}
        </div>

        <div>
          <label className="form-field-label font-poppins text-sm text-ink/70">
            {tOtp("ibIdLabel")}
          </label>
          <input
            type="text"
            value={form.ibId}
            onChange={(e) => updateField("ibId", e.target.value)}
            className={fieldClass(errors.ibId)}
            placeholder={tOtp("ibIdPlaceholder")}
          />
          {errors.ibId && <p className="mt-1 text-xs text-red-600">{errors.ibId}</p>}
        </div>

        <label className="flex items-start gap-3 text-sm text-ink/80">
          <input
            type="checkbox"
            checked={form.terms}
            onChange={(e) => updateField("terms", e.target.checked)}
            className="mt-0.5 h-5 w-5 rounded border-ink/25"
          />
          <span>{t("termsLabel")}</span>
        </label>
        {errors.terms && <p className="text-xs text-red-600">{errors.terms}</p>}

        <Button
          type="submit"
          variant="gold"
          className="w-full justify-between"
          textClassName="text-white flex-1"
          disabled={loading || !otpVerified}
        >
          {loading ? t("submitting") : tOtp("submitLead")}
        </Button>
      </fieldset>
    </form>
  );
}

export function hasPublicTicketBooking(userId: string) {
  if (typeof window === "undefined") return false;
  try {
    return Boolean(sessionStorage.getItem(`${PUBLIC_BOOKING_STORAGE_KEY}_${userId}`));
  } catch {
    return false;
  }
}
