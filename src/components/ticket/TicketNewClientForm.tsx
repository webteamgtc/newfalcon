"use client";

import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import "react-phone-number-input/style.css";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";
import Button from "@/components/Button";

type GtcCountry = {
  name: string;
  code: string;
  phone_code?: string;
};

function getPartnerCodeFromParams(searchParams: ReturnType<typeof useSearchParams>) {
  if (!searchParams) return "";
  return (
    searchParams.get("code") ||
    searchParams.get("ref") ||
    searchParams.get("partner_id") ||
    searchParams.get("partner_code") ||
    searchParams.get("ib") ||
    ""
  );
}

function hasCodeOrRefParam(searchParams: ReturnType<typeof useSearchParams>) {
  if (!searchParams) return false;
  return !!(searchParams.get("code") || searchParams.get("ref"));
}

function fieldClass(touched?: boolean, error?: string) {
  return `mt-2 h-12 w-full rounded-md border bg-white px-3 font-poppins text-sm text-ink outline-none placeholder:text-ink/40 transition-colors focus:border-falcon-deep ${
    touched && error ? "border-red-500" : "border-ink/20"
  }`;
}

export default function TicketNewClientForm() {
  const t = useTranslations("ticketPage.newClientForm");
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [partnerCodeOpen, setPartnerCodeOpen] = useState(false);
  const [gtcCountries, setGtcCountries] = useState<GtcCountry[]>([]);
  const gtcCountriesRef = useRef<GtcCountry[]>([]);
  const urlPartnerCode = getPartnerCodeFromParams(searchParams);
  const deepLinkValue = searchParams.get("deep_link_value") || "";
  const partnerCodeReadOnly = hasCodeOrRefParam(searchParams);

  useEffect(() => {
    gtcCountriesRef.current = gtcCountries;
  }, [gtcCountries]);

  const validationSchema = useMemo(
    () =>
      Yup.object({
        nickname: Yup.string()
          .matches(/^[A-Za-z\s]+$/, t("errors.firstNameLetters"))
          .required(t("errors.firstName")),
        lastname: Yup.string()
          .matches(/^[A-Za-z\s]+$/, t("errors.lastNameLetters"))
          .required(t("errors.lastName")),
        email: Yup.string().email(t("errors.emailInvalid")).required(t("errors.email")),
        country: Yup.string().required(t("errors.country")),
        phone: Yup.string()
          .required(t("errors.phone"))
          .test("is-valid-e164", t("errors.phoneInvalid"), (value) =>
            Boolean(value) && isValidPhoneNumber(value)
          ),
        password: Yup.string()
          .min(8, t("errors.passwordMin"))
          .matches(/^(?=.*[A-Za-z])(?=.*\d)/, t("errors.passwordPattern"))
          .required(t("errors.passwordRequired")),
        otp: Yup.string().length(6, t("errors.otpLength")).required(t("errors.otpRequired")),
        partnerCode: Yup.string(),
        deep_link_value: Yup.string().nullable(),
        terms: Yup.bool().oneOf([true], t("errors.terms")),
      }),
    [t]
  );

  const formik = useFormik({
    initialValues: {
      nickname: "",
      lastname: "",
      email: "",
      phone: "",
      password: "",
      country: "",
      area: "",
      otp: "",
      partnerCode: urlPartnerCode,
      deep_link_value: deepLinkValue,
      terms: false,
    },
    enableReinitialize: true,
    validationSchema,
    onSubmit: async (values) => {
      const selectedCountry = gtcCountriesRef.current.find((c) => c.name === values.country);
      if (!selectedCountry) {
        toast.error(t("errors.validCountry"));
        return;
      }

      const firstname = values.nickname.trim();
      const lastname = values.lastname.trim();
      const parsedPhone = values.phone ? parsePhoneNumberFromString(values.phone) : null;
      const regPayload = {
        code: values.otp,
        is_company: 0,
        area: parsedPhone?.countryCallingCode || selectedCountry.phone_code || values.area,
        country: selectedCountry.name,
        email: values.email,
        phone: values.phone || "",
        password: values.password,
        lastname,
        firstname,
        ...(values.partnerCode?.trim()
          ? { ref: values.partnerCode.trim(), invite_code: values.partnerCode.trim() }
          : {}),
        ...(values?.deep_link_value?.trim()
          ? { deep_link_value: values.deep_link_value.trim() }
          : {}),
      };

      setLoading(true);
      try {
        const res = await axios.post("/api/gtc/reg", regPayload);
        if (res?.data?.code === 200) {
          toast.success(res?.data?.message || t("toast.registrationSuccess"));
          formik.resetForm();
          setCodeSent(false);
        } else {
          toast.error(res?.data?.message || t("toast.registrationFailed"));
        }
      } catch (err) {
        const error = err as { response?: { data?: { message?: string } } };
        toast.error(error?.response?.data?.message || t("toast.registrationFailed"));
      } finally {
        setLoading(false);
      }
    },
  });

  useEffect(() => {
    if (urlPartnerCode) {
      setPartnerCodeOpen(true);
    }
  }, [urlPartnerCode]);

  useEffect(() => {
    axios
      .post("/api/gtc/get-country")
      .then((res) => {
        if (res?.data?.code === 200 && Array.isArray(res.data.data)) {
          setGtcCountries(res.data.data);
        }
      })
      .catch(() => {});
  }, []);

  const handleCountryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const countryName = event.target.value;
    formik.setFieldValue("country", countryName);
    const match = gtcCountries.find((c) => c.name === countryName);
    formik.setFieldValue("area", match?.phone_code || "");
  };

  const sortedCountries = [...gtcCountries].sort((a, b) => a.name.localeCompare(b.name));

  const isEmailAvailable = (data: { code?: number; message?: string }) =>
    data?.code === 200 && /available/i.test(data?.message || "");

  const sendVerificationCode = async () => {
    await formik.setFieldTouched("email", true);
    const emailError = await formik.validateField("email");
    if (emailError || !formik.values.email) {
      toast.error(String(emailError || t("errors.email")));
      return;
    }

    setOtpLoading(true);
    try {
      const checkRes = await axios.post("/api/gtc/check-email", {
        email: formik.values.email,
      });

      if (!isEmailAvailable(checkRes?.data)) {
        toast.error(checkRes?.data?.message || t("errors.emailRegistered"));
        return;
      }

      const codeRes = await axios.post("/api/gtc/get-code", {
        email: formik.values.email,
        type: "0",
      });

      if (codeRes?.data?.code === 200) {
        setCodeSent(true);
        toast.success(codeRes?.data?.message || t("toast.otpSent"));
      } else {
        toast.error(codeRes?.data?.message || t("toast.codeError"));
      }
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error?.response?.data?.message || t("toast.codeError"));
    } finally {
      setOtpLoading(false);
    }
  };

  useEffect(() => {
    const styleId = "ticket-phone-input-styles";
    if (document.getElementById(styleId)) return;

    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
      .ticket-phone-input .PhoneInput { display: flex; align-items: center; width: 100%; }
      .ticket-phone-input .PhoneInputInput {
        border: none; outline: none; background: transparent; font-size: 14px;
        font-family: inherit; color: inherit; width: 100%; margin-left: 8px;
      }
      .ticket-phone-input .PhoneInputCountrySelect {
        border: none; background: transparent; font-size: 14px; cursor: pointer;
      }
    `;
    document.head.appendChild(style);
  }, []);

  return (
    <div className="mt-6 space-y-4">
      <p className="TextSmall !font-poppins !text-ink/80">{t("intro")}</p>

      <form onSubmit={formik.handleSubmit} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="nickname" className="form-field-label font-poppins text-sm text-ink/70">
              {t("fields.firstName")} *
            </label>
            <input
              id="nickname"
              type="text"
              placeholder={t("fields.firstName")}
              className={fieldClass(formik.touched.nickname, formik.errors.nickname)}
              {...formik.getFieldProps("nickname")}
            />
            {formik.touched.nickname && formik.errors.nickname && (
              <p className="mt-1 text-xs text-red-600">{formik.errors.nickname}</p>
            )}
          </div>
          <div>
            <label htmlFor="lastname" className="form-field-label font-poppins text-sm text-ink/70">
              {t("fields.lastName")} *
            </label>
            <input
              id="lastname"
              type="text"
              placeholder={t("fields.lastName")}
              className={fieldClass(formik.touched.lastname, formik.errors.lastname)}
              {...formik.getFieldProps("lastname")}
            />
            {formik.touched.lastname && formik.errors.lastname && (
              <p className="mt-1 text-xs text-red-600">{formik.errors.lastname}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="email" className="form-field-label font-poppins text-sm text-ink/70">
            {t("fields.email")} *
          </label>
          <input
            id="email"
            type="email"
            placeholder={t("placeholders.email")}
            className={fieldClass(formik.touched.email, formik.errors.email)}
            {...formik.getFieldProps("email")}
          />
          {formik.touched.email && formik.errors.email && (
            <p className="mt-1 text-xs text-red-600">{formik.errors.email}</p>
          )}
        </div>

        <div>
          <label htmlFor="otp" className="form-field-label font-poppins text-sm text-ink/70">
            {t("fields.emailCode")} *
          </label>
          <div className="relative mt-2">
            <input
              id="otp"
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder={t("placeholders.emailCode")}
              className={`${fieldClass(formik.touched.otp, formik.errors.otp)} !mt-0 pr-28`}
              {...formik.getFieldProps("otp")}
            />
            <button
              type="button"
              onClick={sendVerificationCode}
              disabled={otpLoading}
              className="absolute right-3 top-1/2 -translate-y-1/2 font-poppins text-xs font-medium uppercase tracking-[0.12em] text-falcon-deep hover:underline disabled:opacity-60"
            >
              {otpLoading ? t("actions.sendingCode") : t("actions.getCode")}
            </button>
          </div>
          {formik.touched.otp && formik.errors.otp && (
            <p className="mt-1 text-xs text-red-600">{formik.errors.otp}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="form-field-label font-poppins text-sm text-ink/70">
            {t("fields.password")} *
          </label>
          <div className="relative mt-2">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder={t("fields.password")}
              className={`${fieldClass(formik.touched.password, formik.errors.password)} !mt-0 pr-12`}
              {...formik.getFieldProps("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 font-poppins text-xs text-ink/50 hover:text-ink"
            >
              {showPassword ? t("a11y.hidePassword") : t("a11y.showPassword")}
            </button>
          </div>
          {formik.touched.password && formik.errors.password && (
            <p className="mt-1 text-xs text-red-600">{formik.errors.password}</p>
          )}
          <p className="mt-1.5 text-xs text-ink/55">{t("placeholders.passwordHint")}</p>
        </div>

        <div>
          <label htmlFor="country" className="form-field-label font-poppins text-sm text-ink/70">
            {t("fields.country")} *
          </label>
          <select
            id="country"
            name="country"
            value={formik.values.country}
            onChange={handleCountryChange}
            onBlur={formik.handleBlur}
            disabled={sortedCountries.length === 0}
            className={`${fieldClass(formik.touched.country, formik.errors.country)} appearance-none`}
          >
            <option value="" disabled>
              {sortedCountries.length === 0 ? t("countryLoading") : t("countrySelect")}
            </option>
            {sortedCountries.map((item) => (
              <option key={item.code} value={item.name}>
                {item.name}
              </option>
            ))}
          </select>
          {formik.touched.country && formik.errors.country && (
            <p className="mt-1 text-xs text-red-600">{formik.errors.country}</p>
          )}
        </div>

        <div>
          <label htmlFor="phone" className="form-field-label font-poppins text-sm text-ink/70">
            {t("fields.phone")} *
          </label>
          <div
            className={`ticket-phone-input mt-2 flex h-12 items-center rounded-md border bg-white px-3 ${
              formik.touched.phone && formik.errors.phone
                ? "border-red-500"
                : "border-ink/20 focus-within:border-falcon-deep"
            }`}
          >
            <PhoneInput
              id="phone"
              international
              defaultCountry="AE"
              value={formik.values.phone}
              onChange={(phone) => formik.setFieldValue("phone", phone || "")}
              onBlur={() => formik.setFieldTouched("phone", true)}
              className="w-full min-w-0"
            />
          </div>
          {formik.touched.phone && formik.errors.phone && (
            <p className="mt-1 text-xs text-red-600">{formik.errors.phone}</p>
          )}
        </div>

        <div>
          <button
            type="button"
            onClick={() => setPartnerCodeOpen((open) => !open)}
            className="flex w-full items-center justify-between text-left"
            aria-expanded={partnerCodeOpen}
          >
            <span className="form-field-label font-poppins text-sm text-ink/70">
              {t("fields.partnerCode")}{" "}
              <span className="text-ink/45">({t("fields.optional")})</span>
            </span>
            <svg
              className={`h-4 w-4 text-ink/50 transition-transform ${partnerCodeOpen ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
            </svg>
          </button>
          {partnerCodeOpen && (
            <input
              type="text"
              name="partnerCode"
              value={formik.values.partnerCode}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              readOnly={partnerCodeReadOnly}
              className={`${fieldClass(formik.touched.partnerCode, formik.errors.partnerCode)} ${
                partnerCodeReadOnly ? "cursor-not-allowed bg-ink/5" : ""
              }`}
            />
          )}
        </div>

        <label className="flex items-start gap-3 text-sm text-ink/80">
          <input
            type="checkbox"
            name="terms"
            id="terms"
            checked={formik.values.terms}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className="mt-0.5 h-5 w-5 rounded border-ink/25"
          />
          <span>
            {t("legal.agreePrefix")}{" "}
            <a
              href="https://www.gtcfx.com/terms"
              className="text-falcon-deep underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t("legal.termsOfService")}
            </a>{" "}
            {t("legal.agreeAnd")}{" "}
            <a
              href="https://www.gtcfx.com/privacy"
              className="text-falcon-deep underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t("legal.privacyPolicy")}
            </a>
          </span>
        </label>
        {formik.touched.terms && formik.errors.terms && (
          <p className="text-xs text-red-600">{formik.errors.terms}</p>
        )}

        <Button
          type="submit"
          variant="gold"
          className="w-full justify-between"
          textClassName="text-white flex-1"
          disabled={loading || !codeSent || formik.values.otp.length !== 6 || !formik.values.terms}
        >
          {loading ? t("actions.registering") : t("actions.register")}
        </Button>
      </form>

      <p className="TextSmall text-center !font-poppins !text-ink/70">
        {t("login.prefix")}{" "}
        <a
          href="https://web.mygtc.app/user?redirect=%252Fdashboard"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-falcon-deep underline"
        >
          {t("login.link")}
        </a>
      </p>
    </div>
  );
}
