"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "react-toastify";
import Button from "@/components/Button";
import OtpBoxes from "@/components/ui/OtpBoxes";
import { sendConfirmationEmail } from "@/lib/sendConfirmationEmail";
import { OTP_TTL_MS } from "@/lib/otpConstants";
import PublicRegistrationSuccess from "@/components/vip/PublicRegistrationSuccess";
import type { IbClientData, IbPerformanceData, VipUser } from "@/data/vipUsers";
import { useRouter } from "@/i18n/routing";

const PUBLIC_BOOKING_STORAGE_KEY = "gfn_public_vip_ticket_booking";

type SubmitSuccessDetails = {
  email: string;
  fullName: string;
};

type PublicVipTicketBookingFormProps = {
  user?: VipUser;
  onSuccessClose?: () => void;
  onSubmitted?: () => void;
};

type FormState = {
  email: string;
  ibId: string;
  terms: boolean;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

function fieldClass(error?: string, options?: { withInlineAction?: boolean }) {
  const base =
    "h-12 w-full rounded-md border bg-white font-poppins text-sm text-ink outline-none placeholder:text-ink/40 transition-colors focus:border-falcon-deep";
  const spacing = options?.withInlineAction ? "py-0 pe-28 ps-3" : "mt-2 px-3";
  return `${spacing} ${base} ${error ? "border-red-500" : "border-ink/20"}`;
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

function resolveFullName(
  email: string,
  cachedIbClient: VerifiedIbClient | null,
  user?: VipUser
): string {
  if (user) {
    return `${user.firstName} ${user.lastName}`.trim();
  }

  const fromClient = cachedIbClient?.client.firstName?.trim();
  if (fromClient) return fromClient;

  const localPart = email.split("@")[0]?.trim();
  return localPart || "Guest";
}

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
  onSuccessClose,
  onSubmitted,
}: PublicVipTicketBookingFormProps) {
  const t = useTranslations("vipPage.eventRegistration");
  const locale = useLocale();
  const router = useRouter();
  const [submitSuccess, setSubmitSuccess] = useState<SubmitSuccessDetails | null>(null);
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
  const [verifiedIbClient, setVerifiedIbClient] = useState<VerifiedIbClient | null>(null);
  const [verifiedIbClientEmail, setVerifiedIbClientEmail] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({
    email: user?.email ?? "",
    ibId: user?.ibId ?? "",
    terms: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const otpRemainingMs = otpExpiresAt && otpExpiresAt > now ? otpExpiresAt - now : 0;

  const expireOtpSession = useCallback(() => {
    setShowOtp(false);
    setOtpInput("");
    setVerificationToken("");
    setOtpExpiresAt(null);
    setOtpError(t("otpExpired"));
  }, [t]);

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

    if (key === "ibId" && showOtp && !otpVerified) {
      setShowOtp(false);
      setOtpInput("");
      setVerificationToken("");
      setOtpExpiresAt(null);
      setOtpError("");
    }
  };

  const validateEmailFormat = () => {
    const trimmedEmail = form.email.trim().toLowerCase();
    if (!trimmedEmail) {
      setErrors((prev) => ({ ...prev, email: t("emailRequired") }));
      return null;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setErrors((prev) => ({ ...prev, email: t("emailInvalid") }));
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
          first_name: resolveFullName(trimmedEmail, ibClientData, user),
          ibId: ibIdForEmail,
          locale,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || data?.error || t("otpSendFailed"));
      }

      setForm((prev) => ({
        ...prev,
        email: trimmedEmail,
        ibId: prev.ibId.trim() || ibClientData?.client.memberId || prev.ibId,
      }));
      setShowOtp(true);
      setOtpInput("");
      setVerificationToken(data.verificationToken || "");
      setOtpVerified(false);
      setOtpExpiresAt(Date.now() + OTP_TTL_MS);
      setNow(Date.now());
    } catch (error) {
      setOtpError(error instanceof Error ? error.message : t("otpSendFailed"));
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
      setOtpError(t("otpRequired"));
      return false;
    }

    if (!verificationToken) {
      setOtpError(t("otpSendFailed"));
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
        setOtpError(t("otpInvalid"));
        return false;
      }

      setOtpVerified(true);
      toast.success(t("emailVerified"));
      return true;
    } catch {
      setOtpError(t("otpInvalid"));
      return false;
    } finally {
      setOtpVerifying(false);
    }
  };

  const validate = () => {
    const nextErrors: FormErrors = {};

    if (!otpVerified) {
      toast.error(t("verifyEmailFirst"));
      return false;
    }

    if (!form.ibId.trim()) {
      nextErrors.ibId = t("errors.ibIdRequired");
    }
    if (!form.terms) nextErrors.terms = t("errors.terms");

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!otpVerified) {
      toast.error(t("verifyEmailFirst"));
      return;
    }
    if (!validate()) return;

    setLoading(true);

    try {
      const registrationUserId = user?.id ?? `public_${form.email.trim().toLowerCase()}`;
      const normalizedEmail = form.email.trim().toLowerCase();
      const cachedIbClient =
        verifiedIbClientEmail === normalizedEmail ? verifiedIbClient : null;

      const fullName = resolveFullName(normalizedEmail, cachedIbClient, user);
      const memberId = cachedIbClient?.client.memberId || user?.memberId || "PUBLIC";
      const ibId =
        form.ibId.trim() || cachedIbClient?.client.memberId || user?.ibId || "";

      const payload = new FormData();
      payload.append("leadForm", "true");
      payload.append("fullName", fullName);
      payload.append("email", form.email);
      payload.append("phone", "");
      payload.append("nationality", "");
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
            fullName,
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
        first_name: fullName,
        formType: "vip_ticket_booking",
        referenceId: data.id,
        locale,
      });

      setSubmitSuccess({ email: form.email, fullName });
      onSubmitted?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("submitFailed"));
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessClose = () => {
    if (onSuccessClose) {
      onSuccessClose();
      return;
    }
    router.push("/");
  };

  if (submitSuccess) {
    return (
      <PublicRegistrationSuccess
        email={submitSuccess.email}
        fullName={submitSuccess.fullName}
        onClose={handleSuccessClose}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-xl border border-[#382910]/15 bg-white/70 p-4 md:p-5">
        <p className="font-display text-base font-medium text-ink">{t("verificationTitle")}</p>
        <p className="mt-1 TextSmall !font-poppins !text-ink/70">{t("verificationDescription")}</p>

        <div className="mt-4">
          <label className="form-field-label font-poppins text-sm text-ink/70">
            {t("fields.email")} *
          </label>
          <div className="relative mt-2">
            <input
              type="email"
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              readOnly={otpVerified}
              className={`${fieldClass(errors.email, { withInlineAction: !otpVerified })} ${otpVerified ? "bg-ink/5 pe-3" : ""}`}
              placeholder={t("emailPlaceholder")}
            />
            {!otpVerified && (
              <button
                type="button"
                onClick={handleGetOtp}
                disabled={otpLoading}
                className="absolute end-1.5 top-1/2 -translate-y-1/2 rounded-full border border-falcon-deep bg-white px-3 py-1.5 font-poppins text-[11px] uppercase tracking-[0.08em] text-falcon-deep transition-colors hover:bg-falcon-deep hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {otpLoading ? t("sendingOtp") : t("getOtp")}
              </button>
            )}
          </div>
          {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
        </div>

        <div className="mt-4 space-y-3">
            <label className="form-field-label font-poppins text-sm text-ink/70">
              {t("otpLabel")}
            </label>
            <OtpBoxes value={otpInput} onChange={setOtpInput} disabled={otpVerifying} />
            {otpRemainingMs > 0 && (
              <p className="font-poppins text-xs text-ink/55">
                {t("otpExpiresIn", { time: formatOtpCountdown(otpRemainingMs) })}
              </p>
            )}
            {otpError && <p className="text-xs text-red-600">{otpError}</p>}
            <button
              type="button"
              onClick={handleVerifyOtp}
              disabled={otpVerifying || otpInput.length !== 6}
              className="rounded-full bg-falcon-deep px-4 py-2 font-poppins text-xs uppercase tracking-[0.08em] text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {otpVerifying ? t("verifyingOtp") : t("verifyOtp")}
            </button>
          </div>

        <div className="mt-4">
          <label className="form-field-label font-poppins text-sm text-ink/70">
            {t("ibIdLabel")} *
          </label>
          <input
            type="text"
            value={form.ibId}
            onChange={(e) => updateField("ibId", e.target.value)}
            readOnly={otpVerified}
            className={`${fieldClass(errors.ibId)} ${otpVerified ? "bg-ink/5" : ""}`}
            placeholder={t("ibIdPlaceholder")}
          />
          {errors.ibId && <p className="mt-1 text-xs text-red-600">{errors.ibId}</p>}
        </div>

        
 
        {otpVerified && (
          <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 font-poppins text-sm text-emerald-800">
            {t("emailVerified")}
          </p>
        )}
      </div>

      <fieldset disabled={!otpVerified} className="space-y-4 disabled:opacity-60">
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
          {loading ? t("submitting") : t("submitLead")}
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
