"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";
import Button from "@/components/Button";
import FalconPhoneInput, { isValidPhoneNumber } from "@/components/ui/FalconPhoneInput";
import OtpBoxes from "@/components/ui/OtpBoxes";

const STAFF_EMAIL_DOMAIN = "@gtcfx.com";

function fieldClass(error?: string) {
  return `mt-2 h-12 w-full rounded-md border bg-white px-3 font-poppins text-sm text-ink outline-none placeholder:text-ink/40 transition-colors focus:border-falcon-deep ${
    error ? "border-red-500" : "border-ink/20"
  }`;
}

function isStaffEmail(email: string) {
  return email.trim().toLowerCase().endsWith(STAFF_EMAIL_DOMAIN);
}

function firstNameFromEmail(email: string) {
  const localPart = email.split("@")[0] ?? "";
  const normalized = localPart.replace(/[._-]+/g, " ").trim();
  if (!normalized) return "";
  return normalized
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

type StaffRegistrationFormProps = {
  onSuccess?: () => void;
};

export default function StaffRegistrationForm({ onSuccess }: StaffRegistrationFormProps) {
  const t = useTranslations("checkStatusPage.staffRegistration");

  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [phone, setPhone] = useState("");
  const [lineManagerName, setLineManagerName] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [otpError, setOtpError] = useState("");
  const [firstNameError, setFirstNameError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [lineManagerError, setLineManagerError] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [loading, setLoading] = useState(false);

  const resetOtpState = () => {
    setShowOtp(false);
    setOtpInput("");
    setOtpVerified(false);
    setOtpError("");
  };

  const validateStaffEmail = () => {
    setEmailError("");
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setEmailError(t("errors.emailRequired"));
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setEmailError(t("errors.emailInvalid"));
      return false;
    }

    if (!isStaffEmail(trimmedEmail)) {
      setEmailError(t("errors.emailDomain"));
      return false;
    }

    return true;
  };

  const handleGetOtp = async () => {
    if (!validateStaffEmail()) return;

    setOtpLoading(true);
    setOtpError("");
    setEmailError("");

    try {
      const trimmedEmail = email.trim().toLowerCase();

      const checkResponse = await fetch(
        `/api/staff-registration/check-email?email=${encodeURIComponent(trimmedEmail)}`
      );
      const checkData = await checkResponse.json();

      if (!checkResponse.ok || !checkData?.success) {
        throw new Error(checkData?.message || t("errors.submitFailed"));
      }

      if (checkData.exists) {
        setEmailError(t("errors.emailAlreadyExists"));
        return;
      }

      const response = await fetch("/api/otp-smtp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: trimmedEmail,
          first_name: firstNameFromEmail(trimmedEmail) || "Staff",
        }),
      });

      const data = await response.json();

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || data?.error || t("errors.otpSendFailed"));
      }

      setShowOtp(true);
      setOtpInput("");
      setOtpVerified(false);
    } catch (error) {
      setOtpError(error instanceof Error ? error.message : t("errors.otpSendFailed"));
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setOtpError("");

    if (!showOtp || otpInput.length !== 6) {
      setOtpError(t("errors.otpRequired"));
      return false;
    }

    setOtpVerifying(true);

    try {
      const response = await fetch("/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          otp: otpInput.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data?.success) {
        setOtpError(t("errors.otpInvalid"));
        return false;
      }

      setOtpVerified(true);
      if (!firstName.trim()) {
        setFirstName(firstNameFromEmail(email.trim()));
      }
      return true;
    } catch {
      setOtpError(t("errors.otpInvalid"));
      return false;
    } finally {
      setOtpVerifying(false);
    }
  };

  const validateRegistration = () => {
    let valid = true;

    if (!firstName.trim()) {
      setFirstNameError(t("errors.firstNameRequired"));
      valid = false;
    } else {
      setFirstNameError("");
    }

    if (!phone.trim()) {
      setPhoneError(t("errors.phoneRequired"));
      valid = false;
    } else if (!isValidPhoneNumber(phone)) {
      setPhoneError(t("errors.phoneInvalid"));
      valid = false;
    } else {
      setPhoneError("");
    }

    if (!lineManagerName.trim()) {
      setLineManagerError(t("errors.lineManagerRequired"));
      valid = false;
    } else {
      setLineManagerError("");
    }

    return valid;
  };

  const handleSubmit = async () => {
    if (!otpVerified) {
      await handleVerifyOtp();
      return;
    }

    if (!validateRegistration()) return;

    setLoading(true);

    try {
      const response = await fetch("/api/staff-registration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          lineManagerName: lineManagerName.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data?.success) {
        if (data?.code === "EMAIL_ALREADY_EXISTS") {
          setEmailError(t("errors.emailAlreadyExists"));
          toast.error(t("errors.emailAlreadyExists"));
          return;
        }

        throw new Error(data?.message || t("errors.submitFailed"));
      }

      setSubmitted(true);
      toast.success(t("successMessage"));
      onSuccess?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("errors.submitFailed"));
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 px-5 py-8 text-center">
        <p className="font-display text-xl font-medium text-green-800">{t("successTitle")}</p>
        <p className="mt-2 TextSmall !font-poppins !text-green-700">{t("successDescription")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <p className="TextSmall !font-poppins !text-ink/75">{t("description")}</p>

      {!otpVerified && (
        <>
          <div className="flex flex-col gap-3 md:flex-row md:items-end">
            <div className="min-w-0 flex-1">
              <label className="font-poppins text-sm text-ink/70">{t("fields.email")} *</label>
              <input
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  resetOtpState();
                  setEmailError("");
                }}
                placeholder={t("placeholders.email")}
                className={fieldClass(emailError)}
              />
            </div>
            <button
              type="button"
              onClick={handleGetOtp}
              disabled={otpLoading || !email.trim()}
              className="h-12 shrink-0 rounded-full border border-falcon-deep bg-white px-6 font-poppins text-xs uppercase tracking-[0.14em] text-falcon-deep transition-colors hover:bg-falcon-deep hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {otpLoading ? t("sendingOtp") : t("getOtp")}
            </button>
          </div>
          {emailError && <p className="text-xs text-red-600">{emailError}</p>}
          {otpError && !showOtp && <p className="text-xs text-red-600">{otpError}</p>}

          {showOtp && (
            <div className="space-y-3">
              <div>
                <label className="font-poppins text-sm text-ink/70">{t("fields.otp")} *</label>
                <div className="mt-2">
                  <OtpBoxes value={otpInput} onChange={setOtpInput} />
                </div>
                {otpError && <p className="mt-1 text-xs text-red-600">{otpError}</p>}
              </div>
            </div>
          )}
        </>
      )}

      {otpVerified && (
        <div className="space-y-4">
          <p className="text-sm font-medium text-green-700">{t("emailVerified")}</p>

          <div>
            <label className="font-poppins text-sm text-ink/70">{t("fields.firstName")} *</label>
            <input
              type="text"
              value={firstName}
              onChange={(event) => {
                setFirstName(event.target.value);
                setFirstNameError("");
              }}
              placeholder={t("placeholders.firstName")}
              className={fieldClass(firstNameError)}
            />
            {firstNameError && <p className="mt-1 text-xs text-red-600">{firstNameError}</p>}
          </div>

          <div>
            <label htmlFor="staff-phone" className="font-poppins text-sm text-ink/70">
              {t("fields.phone")} *
            </label>
            <FalconPhoneInput
              id="staff-phone"
              value={phone}
              onChange={(value) => {
                setPhone(value);
                setPhoneError("");
              }}
              error={phoneError}
            />
            {phoneError && <p className="mt-1 text-xs text-red-600">{phoneError}</p>}
          </div>

          <div>
            <label className="font-poppins text-sm text-ink/70">{t("fields.email")} *</label>
            <input
              type="email"
              value={email}
              readOnly
              className={`${fieldClass(emailError)} bg-ink/5`}
            />
            {emailError && <p className="mt-1 text-xs text-red-600">{emailError}</p>}
          </div>

          <div>
            <label htmlFor="staff-line-manager-name" className="font-poppins text-sm text-ink/70">
              {t("fields.lineManagerName")} *
            </label>
            <input
              id="staff-line-manager-name"
              type="text"
              value={lineManagerName}
              onChange={(event) => {
                setLineManagerName(event.target.value);
                setLineManagerError("");
              }}
              placeholder={t("placeholders.lineManagerName")}
              className={fieldClass(lineManagerError)}
            />
            {lineManagerError && (
              <p className="mt-1 text-xs text-red-600">{lineManagerError}</p>
            )}
          </div>
        </div>
      )}

      <Button
        type="button"
        variant="gold"
        className="w-full justify-between"
        textClassName="text-white flex-1"
        disabled={
          loading ||
          otpVerifying ||
          (otpVerified
            ? !firstName.trim() ||
              !phone.trim() ||
              !isValidPhoneNumber(phone) ||
              !lineManagerName.trim()
            : !showOtp || otpInput.length !== 6)
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
  );
}
