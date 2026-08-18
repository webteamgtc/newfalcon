"use client";

import { useRef } from "react";

const OTP_LENGTH = 6;

type OtpBoxesProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

function normalizeOtp(value: string) {
  return value.replace(/\D/g, "").slice(0, OTP_LENGTH);
}

export default function OtpBoxes({ value, onChange, disabled }: OtpBoxesProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.padEnd(OTP_LENGTH, " ").split("").slice(0, OTP_LENGTH);

  const applyOtp = (next: string, focusIndex?: number) => {
    const normalized = normalizeOtp(next);
    onChange(normalized);

    const idx =
      focusIndex ?? Math.min(Math.max(normalized.length - 1, 0), OTP_LENGTH - 1);
    inputRefs.current[idx]?.focus();
  };

  return (
    <div className="flex justify-between gap-2">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(element) => {
            inputRefs.current[index] = element;
          }}
          type="tel"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          maxLength={1}
          value={digit.trim()}
          disabled={disabled}
          onChange={(event) => {
            const raw = event.target.value.replace(/\D/g, "");

            if (raw.length > 1) {
              const before = value.slice(0, index);
              applyOtp(before + raw);
              return;
            }

            const nextChar = raw.slice(-1);
            const next = value.split("");
            next[index] = nextChar;
            applyOtp(next.join(""));

            if (nextChar && inputRefs.current[index + 1]) {
              inputRefs.current[index + 1]?.focus();
            }
          }}
          onPaste={(event) => {
            event.preventDefault();
            const pasted = event.clipboardData.getData("text");
            if (!pasted) return;

            const before = value.slice(0, index);
            applyOtp(before + pasted);
          }}
          onKeyDown={(event) => {
            if (
              event.key === "Backspace" &&
              !digit.trim() &&
              inputRefs.current[index - 1]
            ) {
              inputRefs.current[index - 1]?.focus();
            }
          }}
          className="h-12 w-full min-w-[44px] rounded-md border border-ink/20 bg-white text-center font-display text-lg font-medium text-ink outline-none transition-colors focus:border-falcon-deep disabled:opacity-60"
        />
      ))}
    </div>
  );
}
