"use client";

import { Suspense, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import Button from "@/components/Button";
import { useVipUser } from "@/context/VipUserProvider";
import { findVipUserByCredentials, findVipUserByEmail } from "@/data/vipUsers";
import TicketNewClientForm from "@/components/ticket/TicketNewClientForm";

function OtpBoxes({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  const digits = value.padEnd(6, " ").split("").slice(0, 6);

  return (
    <div className="flex justify-between gap-2">
      {digits.map((digit, index) => (
        <input
          key={index}
          type="tel"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={digit.trim()}
          disabled={disabled}
          onChange={(event) => {
            const nextChar = event.target.value.replace(/\D/g, "").slice(-1);
            const next = value.split("");
            next[index] = nextChar;
            const joined = next.join("").replace(/\s/g, "").slice(0, 6);
            onChange(joined);

            if (nextChar && event.target.nextElementSibling instanceof HTMLInputElement) {
              event.target.nextElementSibling.focus();
            }
          }}
          onKeyDown={(event) => {
            if (
              event.key === "Backspace" &&
              !digit.trim() &&
              event.currentTarget.previousElementSibling instanceof HTMLInputElement
            ) {
              event.currentTarget.previousElementSibling.focus();
            }
          }}
          className="h-12 w-full min-w-[44px] rounded-md border border-ink/20 bg-white text-center font-display text-lg font-medium text-ink outline-none transition-colors focus:border-falcon-deep disabled:opacity-60"
        />
      ))}
    </div>
  );
}

type TicketAccessFormProps = {
  compact?: boolean;
  pageLayout?: boolean;
  onSuccess?: () => void;
};

export default function TicketAccessForm({
  compact = false,
  pageLayout = false,
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
  const [emailOtpFromApi, setEmailOtpFromApi] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [ibIdError, setIbIdError] = useState("");
  const [otpError, setOtpError] = useState("");
  const [termsError, setTermsError] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  const resetOtpState = () => {
    setShowOtp(false);
    setOtpInput("");
    setEmailOtpFromApi("");
    setOtpVerified(false);
    setOtpError("");
    setEmailError("");
    setIbId("");
    setIbIdError("");
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

      if (!response.ok || !data?.message) {
        throw new Error(data?.message || data?.error || t("otpSendFailed"));
      }

      setEmailOtpFromApi(String(data.message).trim());
      setShowOtp(true);
      setOtpInput("");
      setOtpVerified(false);
    } catch (error) {
      setOtpError(
        error instanceof Error ? error.message : t("otpSendFailed")
      );
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = () => {
    setOtpError("");

    if (!showOtp || otpInput.length !== 6) {
      setOtpError(t("otpRequired"));
      return;
    }

    if (otpInput.trim() !== emailOtpFromApi) {
      setOtpError(t("otpInvalid"));
      return;
    }

    setOtpVerified(true);
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

  const handleSubmit = () => {
    setTermsError("");

    if (!otpVerified) {
      handleVerifyOtp();
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
      {!compact && !pageLayout && (
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
        className={compact && !pageLayout ? "" : "mx-auto max-w-2xl p-4 md:p-8"}
        style={
          compact && !pageLayout
            ? undefined
            : {
                border: "1px solid rgba(56, 41, 16, 0.30)",
                background: "linear-gradient(117deg, #FDFCFA 0.63%, #F3E5CB 100%)",
              }
        }
      >
        <div>
          <label className="font-poppins text-sm text-ink/70">{t("existingClientLabel")}</label>
          <select
            value={existingClient}
            onChange={(event) => {
              setExistingClient(event.target.value as "" | "yes" | "no");
              setEmail("");
              resetOtpState();
              setTerms(false);
              setTermsError("");
            }}
            className="mt-2 h-12 w-full rounded-md border border-ink/20 bg-white px-3 font-poppins text-sm text-ink outline-none transition-colors focus:border-falcon-deep"
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
                  className="mt-2 h-12 w-full rounded-md border border-ink/20 bg-white px-3 font-poppins text-sm text-ink outline-none placeholder:text-ink/40 focus:border-falcon-deep disabled:opacity-70"
                />
              </div>
              <button
                type="button"
                onClick={handleGetOtp}
                disabled={otpLoading || otpVerified || !email.trim()}
                className="h-12 shrink-0 rounded-full border border-falcon-deep bg-white px-6 font-poppins text-xs uppercase tracking-[0.14em] text-falcon-deep transition-colors hover:bg-falcon-deep hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {otpLoading ? t("sendingOtp") : t("getOtp")}
              </button>
            </div>
            {emailError && <p className="mt-0.5 text-xs text-red-600">{emailError}</p>}


            {showOtp && !otpVerified && (
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
                    disabled={otpInput.length !== 6}
                    className="h-12 shrink-0 rounded-full border border-falcon-deep bg-white px-6 font-poppins text-xs uppercase tracking-[0.14em] text-falcon-deep transition-colors hover:bg-falcon-deep hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {t("verifyOtp")}
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
                    className="mt-2 h-12 w-full rounded-md border border-ink/20 bg-white px-3 font-poppins text-sm text-ink outline-none placeholder:text-ink/40 focus:border-falcon-deep"
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
                (otpVerified
                  ? !terms || !ibId.trim()
                  : !showOtp || otpInput.length !== 6)
              }
              onClick={handleSubmit}
            >
              {loading
                ? t("submitting")
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
