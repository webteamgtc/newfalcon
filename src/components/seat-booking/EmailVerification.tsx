"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import OtpBoxes from "@/components/ui/OtpBoxes";
import { OTP_TTL_MS } from "@/lib/otpConstants";
import { EMAIL_PATTERN, type SeatCategorySlug } from "@/lib/seatBooking/categories";
import { Field, inputClass } from "./fields";

const RESEND_COOLDOWN_MS = 45_000;

function mmss(ms: number) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

type Props = {
  email: string;
  onEmailChange: (email: string) => void;
  name: string;
  category: SeatCategorySlug;
  locale: string;
  proofToken: string;
  onVerified: (proofToken: string) => void;
  onReset: () => void;
  error?: string;
};

export default function EmailVerification({
  email,
  onEmailChange,
  name,
  category,
  locale,
  proofToken,
  onVerified,
  onReset,
  error,
}: Props) {
  const t = useTranslations("seatBooking");
  const [verificationToken, setVerificationToken] = useState("");
  const [otp, setOtp] = useState("");
  const [sentAt, setSentAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [localError, setLocalError] = useState("");

  const verified = !!proofToken;
  const expiresIn = sentAt ? sentAt + OTP_TTL_MS - now : 0;
  const resendIn = sentAt ? sentAt + RESEND_COOLDOWN_MS - now : 0;
  const codeActive = !!sentAt && !verified;

  useEffect(() => {
    if (!sentAt || verified) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [sentAt, verified]);

  useEffect(() => {
    if (codeActive && expiresIn <= 0) {
      setVerificationToken("");
      setOtp("");
      setLocalError(t("errors.otpExpired"));
    }
  }, [codeActive, expiresIn, t]);

  const codeFor = (code: string | undefined, status: number) => {
    if (status === 429 || code === "RATE_LIMITED") return t("errors.rateLimited");
    if (code === "ALREADY_REGISTERED") return t("errors.alreadyRegistered");
    if (code === "OTP_INVALID") return t("errors.otpInvalid");
    if (code === "EMAIL_INVALID") return t("errors.email");
    return t("errors.generic");
  };

  const sendCode = async () => {
    const value = email.trim().toLowerCase();
    if (!EMAIL_PATTERN.test(value)) {
      setLocalError(t("errors.email"));
      return;
    }
    setSending(true);
    setLocalError("");
    try {
      const res = await fetch("/api/seat-booking/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: value, name, locale }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        setLocalError(codeFor(data.code, res.status));
        return;
      }
      setVerificationToken(data.verificationToken);
      setOtp("");
      const ts = Date.now();
      setSentAt(ts);
      setNow(ts);
    } catch {
      setLocalError(t("errors.generic"));
    } finally {
      setSending(false);
    }
  };

  const verifyCode = async () => {
    if (otp.length !== 6 || !verificationToken) return;
    setVerifying(true);
    setLocalError("");
    try {
      const res = await fetch("/api/seat-booking/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          otp,
          verificationToken,
          category,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        setLocalError(codeFor(data.code, res.status));
        if (data.code === "OTP_INVALID") setOtp("");
        return;
      }
      setSentAt(null);
      setVerificationToken("");
      onVerified(data.proofToken);
    } catch {
      setLocalError(t("errors.generic"));
    } finally {
      setVerifying(false);
    }
  };

  useEffect(() => {
    if (otp.length === 6 && !verifying && verificationToken) void verifyCode();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp]);

  const changeEmail = () => {
    setSentAt(null);
    setVerificationToken("");
    setOtp("");
    setLocalError("");
    onReset();
  };

  const shownError = localError || error;

  return (
    <Field label={t("form.email")} htmlFor="seat-email" error={codeActive ? undefined : shownError}>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            id="seat-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            value={email}
            disabled={verified || codeActive}
            onChange={(e) => {
              onEmailChange(e.target.value);
              setLocalError("");
            }}
            placeholder="name@example.com"
            className={`${inputClass(codeActive ? undefined : shownError)} ${verified ? "pe-10" : ""}`}
          />
          {verified && (
            <span className="absolute end-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-emerald-600 text-white">
              <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden>
                <path d="m5 10.5 3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          )}
        </div>
        {verified || codeActive ? (
          <button
            type="button"
            onClick={changeEmail}
            className="h-12 shrink-0 rounded-xl border border-ink/15 bg-white px-4 font-poppins text-sm font-medium text-ink/70 transition hover:border-ink/40"
          >
            {t("otp.change")}
          </button>
        ) : (
          <button
            type="button"
            onClick={sendCode}
            disabled={sending}
            className="h-12 shrink-0 rounded-xl bg-ink px-5 font-poppins text-sm font-medium text-falcon-light transition hover:bg-ink-soft disabled:opacity-60"
          >
            {sending ? t("otp.sending") : t("otp.send")}
          </button>
        )}
      </div>

      {verified && (
        <p className="mt-1.5 font-poppins text-xs font-medium text-emerald-700">{t("otp.verified")}</p>
      )}

      {codeActive && (
        <div className="mt-4 rounded-2xl border border-falcon-gold/30 bg-parchment-light p-4 sm:p-5">
          <p className="mb-4 font-poppins text-[13px] leading-relaxed text-ink/70">
            {t("otp.sentTo", { email: email.trim(), time: mmss(expiresIn) })}
          </p>
          <div className="max-w-sm">
            <OtpBoxes value={otp} onChange={setOtp} disabled={verifying || !verificationToken} />
          </div>
          {localError && (
            <p role="alert" className="mt-3 font-poppins text-xs text-red-600">
              {localError}
            </p>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={verifyCode}
              disabled={otp.length !== 6 || verifying || !verificationToken}
              className="h-10 rounded-lg bg-ink px-5 font-poppins text-sm font-medium text-falcon-light transition hover:bg-ink-soft disabled:opacity-50"
            >
              {verifying ? t("otp.verifying") : t("otp.verify")}
            </button>
            <button
              type="button"
              onClick={sendCode}
              disabled={resendIn > 0 || sending}
              className="font-poppins text-sm text-falcon-bronze underline-offset-4 hover:underline disabled:text-ink/40 disabled:no-underline"
            >
              {resendIn > 0 ? t("otp.resendIn", { time: mmss(resendIn) }) : t("otp.resend")}
            </button>
          </div>
        </div>
      )}
    </Field>
  );
}
