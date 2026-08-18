"use client";

import { useEffect } from "react";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import type { Country } from "react-phone-number-input";
import "react-phone-number-input/style.css";

export { isValidPhoneNumber };

type FalconPhoneInputProps = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  defaultCountry?: Country;
};

export default function FalconPhoneInput({
  id,
  value,
  onChange,
  onBlur,
  error,
  defaultCountry = "AE",
}: FalconPhoneInputProps) {
  useEffect(() => {
    const styleId = "falcon-phone-input-styles";
    if (document.getElementById(styleId)) return;

    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
      .falcon-phone-input .PhoneInput { display: flex; align-items: center; width: 100%; }
      .falcon-phone-input .PhoneInputInput {
        border: none; outline: none; background: transparent; font-size: 14px;
        font-family: inherit; color: inherit; width: 100%; margin-left: 8px;
      }
      .falcon-phone-input .PhoneInputCountrySelect {
        border: none; background: transparent; font-size: 14px; cursor: pointer;
      }
    `;
    document.head.appendChild(style);
  }, []);

  return (
    <div
      className={`falcon-phone-input mt-2 flex h-12 items-center rounded-md border bg-white px-3 ${
        error ? "border-red-500" : "border-ink/20 focus-within:border-falcon-deep"
      }`}
    >
      <PhoneInput
        id={id}
        international
        defaultCountry={defaultCountry}
        value={value}
        onChange={(phone) => onChange(phone || "")}
        onBlur={onBlur}
        className="w-full min-w-0 font-poppins text-sm text-ink"
      />
    </div>
  );
}
