"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import Button from "@/components/Button";
import { useVipUser } from "@/context/VipUserProvider";
import { findVipUserByCredentials, findVipUserByEmail } from "@/data/vipUsers";
import TicketNewClientForm from "@/components/ticket/TicketNewClientForm";
import OtpBoxes from "@/components/ui/OtpBoxes";
import { OTP_TTL_MS } from "@/lib/otpConstants";

function formatOtpCountdown(remainingMs: number) {
  const totalSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

type TicketAccessFormProps = {
  compact?: boolean;
  pageLayout?: boolean;
  embedded?: boolean;
  onSuccess?: () => void;
};

export default function TicketAccessForm({
  compact = false,
  pageLayout = false,
  embedded = false,
  onSuccess,
}: TicketAccessFormProps) {
  const t = useTranslations("ticketPage.accessForm");
  const router = useRouter();
  const { login } = useVipUser();

  const [existingClient, setExistingClient] = useState<"" | "yes" | "no">("");
  const [email, setEmail] = useState("");
  const [ibId, setIbId] = useState("");
  const [terms, setTerms] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  const [verificationToken, setVerificationToken] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [ibIdError, setIbIdError] = useState("");
  const [otpError, setOtpError] = useState("");
  const [termsError, setTermsError] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpExpiresAt, setOtpExpiresAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());

  const otpRemainingMs =
    otpExpiresAt && otpExpiresAt > now ? otpExpiresAt - now : 0;
  const otpSessionActive = showOtp && !otpVerified && otpRemainingMs > 0;

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

  const inputClass =
    "mt-2 h-12 w-full rounded-lg border border-[#382910]/15 bg-white/95 px-4 font-poppins text-sm text-ink shadow-sm outline-none transition-all placeholder:text-ink/35 focus:border-falcon-deep focus:ring-2 focus:ring-falcon-deep/10 disabled:opacity-70";
  const selectClass =
    "mt-2 h-12 w-full rounded-lg border border-[#382910]/15 bg-white/95 px-4 font-poppins text-sm text-ink shadow-sm outline-none transition-all focus:border-falcon-deep focus:ring-2 focus:ring-falcon-deep/10";
  const legacyInputClass =
    "mt-2 h-12 w-full rounded-md border border-ink/20 bg-white px-3 font-poppins text-sm text-ink outline-none placeholder:text-ink/40 focus:border-falcon-deep disabled:opacity-70";
  const legacySelectClass =
    "mt-2 h-12 w-full rounded-md border border-ink/20 bg-white px-3 font-poppins text-sm text-ink outline-none transition-colors focus:border-falcon-deep";
  const fieldInputClass = embedded ? inputClass : legacyInputClass;
  const fieldSelectClass = embedded ? selectClass : legacySelectClass;

  const resetOtpState = () => {
    setShowOtp(false);
    setOtpInput("");
    setVerificationToken("");
    setOtpVerified(false);
    setOtpError("");
    setEmailError("");
    setIbId("");
    setIbIdError("");
    setOtpExpiresAt(null);
  };

  const validateEmail = () => {
    setEmailError("");
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setEmailError(t("emailRequired"));
      return null;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setEmailError(t("emailInvalid"));
      return null;
    }

    const matchedUser = findVipUserByEmail(trimmedEmail);
    if (!matchedUser) {
      setEmailError(t("emailNotFound"));
      return null;
    }

    return matchedUser;
  };

  const handleGetOtp = async () => {
    const matchedUser = validateEmail();
    if (!matchedUser) return;

    setOtpLoading(true);
    setOtpError("");

    try {
      const response = await fetch("/api/otp-smtp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: matchedUser.email,
          first_name: matchedUser.firstName,
          ibId: matchedUser.ibId,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || data?.error || t("otpSendFailed"));
      }

      setShowOtp(true);
      setOtpInput("");
      setVerificationToken(data.verificationToken || "");
      setOtpVerified(false);
      setOtpExpiresAt(Date.now() + OTP_TTL_MS);
      setNow(Date.now());
    } catch (error) {
      setOtpError(
        error instanceof Error ? error.message : t("otpSendFailed")
      );
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
          email: email.trim(),
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
      return true;
    } catch {
      setOtpError(t("otpInvalid"));
      return false;
    } finally {
      setOtpVerifying(false);
    }
  };

  const validateIbCredentials = () => {
    setIbIdError("");
    setEmailError("");

    const trimmedEmail = email.trim();
    const trimmedIbId = ibId.trim();

    if (!trimmedIbId) {
      setIbIdError(t("ibIdRequired"));
      return null;
    }

    const matchedUser = findVipUserByCredentials(trimmedEmail, trimmedIbId);
    if (!matchedUser) {
      setIbIdError(t("credentialsNotFound"));
      return null;
    }

    return matchedUser;
  };

  const handleSubmit = async () => {
    setTermsError("");

    if (!otpVerified) {
      await handleVerifyOtp();
      return;
    }

    if (!terms) {
      setTermsError(t("termsRequired"));
      return;
    }

    const matchedUser = validateIbCredentials();
    if (!matchedUser) return;

    setLoading(true);
    login(matchedUser);
    onSuccess?.();
    router.push("/result");
  };

  const formContent = (
    <>
      {!compact && !pageLayout && !embedded && (
        <div className="mb-6 md:mb-8">
          <p className="eyebrow !capitalize text-[#382910]">
            <span className="font-poppins">{t("eyebrow")}</span>
          </p>
          <h2 className="mt-3 max-w-xl font-display HeadingH2 !font-medium !text-ink">
            {t("headingPlain")}{" "}
            <span className="italic text-falcon-deep">{t("headingItalic")}</span>
          </h2>
          <p className="mt-3 max-w-2xl TextSmall !font-poppins !text-ink/80">
            {t("description")}
          </p>
        </div>
      )}

      {compact && !pageLayout && (
        <p className="mb-5 TextSmall !font-poppins !text-ink/80">{t("description")}</p>
      )}

      <div
        className={
          embedded
            ? ""
            : compact && !pageLayout
              ? ""
              : "mx-auto max-w-2xl p-4 md:p-8"
        }
        style={
          embedded || (compact && !pageLayout)
            ? undefined
            : {
                border: "1px solid rgba(56, 41, 16, 0.30)",
                background: "linear-gradient(117deg, #FDFCFA 0.63%, #F3E5CB 100%)",
              }
        }
      >
        <div>
          <label className="font-poppins text-sm font-medium text-ink/75">{t("existingClientLabel")}</label>
          <select
            value={existingClient}
            onChange={(event) => {
              setExistingClient(event.target.value as "" | "yes" | "no");
              setEmail("");
              resetOtpState();
              setTerms(false);
              setTermsError("");
            }}
            className={fieldSelectClass}
          >
            <option value="">{t("selectPlaceholder")}</option>
            <option value="yes">{t("existingYes")}</option>
            <option value="no">{t("existingNo")}</option>
          </select>
        </div>

        {existingClient === "yes" && (
          <div className="mt-6 space-y-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-end">
              <div className="min-w-0 flex-1">
                <label className="font-poppins text-sm text-ink/70">{t("emailLabel")}</label>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    resetOtpState();
                  }}
                  placeholder={t("emailPlaceholder")}
                  disabled={otpVerified}
                  className={fieldInputClass}
                />
              </div>
              <button
                type="button"
                onClick={handleGetOtp}
                disabled={otpLoading || otpVerified || !email.trim() || otpSessionActive}
                className={`h-12 min-w-[8.5rem] shrink-0 rounded-full border border-falcon-deep bg-white px-6 font-poppins text-xs uppercase tracking-[0.14em] text-falcon-deep shadow-sm transition-colors hover:bg-falcon-deep hover:text-white disabled:cursor-not-allowed disabled:opacity-50${otpSessionActive ? " font-mono tabular-nums tracking-normal" : ""}`}
              >
                {otpLoading
                  ? t("sendingOtp")
                  : otpSessionActive
                    ? formatOtpCountdown(otpRemainingMs)
                    : t("getOtp")}
              </button>
            </div>
            {emailError && <p className="mt-0.5 text-xs text-red-600">{emailError}</p>}
            {otpError && !otpSessionActive && !otpVerified && (
              <p className="text-xs text-red-600">{otpError}</p>
            )}

            {otpSessionActive && (
              <div className="space-y-3">
                <div>
                  <label className="font-poppins text-sm text-ink/70">{t("otpLabel")}</label>
                  <div className="mt-2">
                    <OtpBoxes value={otpInput} onChange={setOtpInput} />
                  </div>
                  {otpError && <p className="mt-1 text-xs text-red-600">{otpError}</p>}
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={otpInput.length !== 6 || otpVerifying}
                    className="h-12 shrink-0 rounded-full border border-falcon-deep bg-white px-6 font-poppins text-xs uppercase tracking-[0.14em] text-falcon-deep transition-colors hover:bg-falcon-deep hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {otpVerifying ? t("verifyingOtp") : t("verifyOtp")}
                  </button>
                </div>
              </div>
            )}

            {otpVerified && (
              <>
                <p className="text-sm font-medium text-green-700">{t("emailVerified")}</p>

                <div className="min-w-0">
                  <label className="font-poppins text-sm text-ink/70">{t("ibIdLabel")}</label>
                  <input
                    type="text"
                    value={ibId}
                    onChange={(event) => {
                      setIbId(event.target.value);
                      setIbIdError("");
                    }}
                    placeholder={t("ibIdPlaceholder")}
                    className={fieldInputClass}
                  />
                  {ibIdError && <p className="mt-1 text-xs text-red-600">{ibIdError}</p>}
                </div>
              </>
            )}

            {otpVerified && (
              <>
                <p className="text-sm leading-relaxed text-ink/70">{t("disclaimer")}</p>

                <label className="flex items-start gap-3 text-sm text-ink/80">
                  <input
                    type="checkbox"
                    checked={terms}
                    onChange={(event) => {
                      setTerms(event.target.checked);
                      setTermsError("");
                    }}
                    className="mt-0.5 h-5 w-5 rounded border-ink/25"
                  />
                  <span>{t("termsLabel")}</span>
                </label>
                {termsError && <p className="text-xs text-red-600">{termsError}</p>}
              </>
            )}

            <Button
              type="button"
              variant="gold"
              className="mt-2 w-full justify-between"
              textClassName="text-white flex-1"
              disabled={
                loading ||
                otpVerifying ||
                (otpVerified
                  ? !terms || !ibId.trim()
                  : !otpSessionActive || otpInput.length !== 6)
              }
              onClick={handleSubmit}
            >
              {loading
                ? t("submitting")
                : otpVerifying
                  ? t("verifyingOtp")
                  : otpVerified
                    ? t("submit")
                    : t("verifyOtp")}
            </Button>
          </div>
        )}

        {existingClient === "no" && (
          <Suspense
            fallback={
              <p className="mt-6 TextSmall !font-poppins !text-ink/60">{t("loadingForm")}</p>
            }
          >
            <TicketNewClientForm />
          </Suspense>
        )}
      </div>
    </>
  );

  if (embedded) {
    return formContent;
  }

  if (compact) {
    return formContent;
  }

  if (pageLayout) {
    return (
      <section id="access-form" className="scroll-mt-28 bg-[#FFFDF8] py-12 md:py-16">
        <div className="container">{formContent}</div>
      </section>
    );
  }

  return (
    <section id="access-form" className="scroll-mt-28 bg-[#F4ECDF] py-8 md:py-12">
      <div className="container">{formContent}</div>
    </section>
  );
}
