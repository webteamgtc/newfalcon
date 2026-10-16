"use client";

import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { getCountries } from "libphonenumber-js";
import { PASSPORT_ALLOWED_TYPES, PASSPORT_MAX_BYTES } from "@/lib/seatBooking/categories";

export function inputClass(error?: string) {
  return `h-12 w-full rounded-xl border bg-white px-4 font-poppins text-sm text-ink outline-none transition placeholder:text-ink/35 focus:border-falcon-gold focus:ring-4 focus:ring-falcon-gold/15 disabled:cursor-not-allowed disabled:bg-parchment-light disabled:text-ink/60 ${
    error ? "border-red-500/80" : "border-ink/15 hover:border-ink/30"
  }`;
}

export function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
  className = "",
}: {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label
        htmlFor={htmlFor}
        className="mb-2 block font-poppins text-[13px] font-medium text-ink/80"
      >
        {label}
      </label>
      {children}
      {error ? (
        <p role="alert" className="mt-1.5 font-poppins text-xs text-red-600">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 font-poppins text-xs leading-relaxed text-ink/50">{hint}</p>
      ) : null}
    </div>
  );
}

export function SectionTitle({ index, children }: { index: string; children: ReactNode }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink font-poppins text-xs font-semibold text-falcon-light">
        {index}
      </span>
      <h3 className="font-display text-xl text-ink md:text-2xl">{children}</h3>
      <span className="h-px flex-1 bg-gradient-to-r from-falcon-gold/50 to-transparent rtl:bg-gradient-to-l" />
    </div>
  );
}

/* --------------------------- Country select --------------------------- */

/**
 * Country names come from the browser's Intl data. They're built after mount because
 * Node and browsers ship different ICU data, which would cause a hydration mismatch.
 */
export function useCountryOptions(locale: string) {
  const [options, setOptions] = useState<{ code: string; name: string }[]>([]);
  useEffect(() => {
    let names: Intl.DisplayNames | null = null;
    try {
      names = new Intl.DisplayNames([locale === "zh" ? "zh-CN" : locale], { type: "region" });
    } catch {
      names = null;
    }
    setOptions(
      getCountries()
        .map((code) => ({ code, name: names?.of(code) ?? code }))
        .sort((a, b) => a.name.localeCompare(b.name, locale))
    );
  }, [locale]);
  return options;
}

export function CountrySelect({
  id,
  value,
  onChange,
  locale,
  placeholder,
  error,
}: {
  id: string;
  value: string;
  onChange: (code: string) => void;
  locale: string;
  placeholder: string;
  error?: string;
}) {
  const options = useCountryOptions(locale);
  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputClass(error)} appearance-none pe-10`}
        aria-invalid={!!error}
      >
        <option value="">{placeholder}</option>
        {options.map((c) => (
          <option key={c.code} value={c.code}>
            {c.name}
          </option>
        ))}
      </select>
      <Chevron />
    </div>
  );
}

export function SelectInput({
  id,
  value,
  onChange,
  placeholder,
  options,
  error,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  options: { value: string; label: string }[];
  error?: string;
}) {
  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputClass(error)} appearance-none pe-10`}
        aria-invalid={!!error}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <Chevron />
    </div>
  );
}

function Chevron() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 20 20"
      className="pointer-events-none absolute end-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/50"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="m5 7.5 5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* --------------------------- Segmented Yes/No --------------------------- */

export function YesNo({
  name,
  value,
  onChange,
  yes,
  no,
  error,
}: {
  name: string;
  value: "" | "yes" | "no";
  onChange: (v: "yes" | "no") => void;
  yes: string;
  no: string;
  error?: string;
}) {
  return (
    <div
      role="radiogroup"
      className={`grid grid-cols-2 gap-3 ${error ? "rounded-xl ring-1 ring-red-500/70" : ""}`}
    >
      {(["yes", "no"] as const).map((option) => {
        const active = value === option;
        return (
          <label
            key={option}
            className={`flex h-12 cursor-pointer items-center justify-center gap-2 rounded-xl border font-poppins text-sm font-medium transition ${
              active
                ? "border-ink bg-ink text-falcon-light shadow-md"
                : "border-ink/15 bg-white text-ink/70 hover:border-falcon-gold"
            }`}
          >
            <input
              type="radio"
              name={name}
              value={option}
              checked={active}
              onChange={() => onChange(option)}
              className="sr-only"
            />
            <span
              className={`h-3.5 w-3.5 rounded-full border-2 ${
                active ? "border-falcon-light bg-falcon-gold" : "border-ink/30"
              }`}
            />
            {option === "yes" ? yes : no}
          </label>
        );
      })}
    </div>
  );
}

/* --------------------------- Passport upload --------------------------- */

export type FileErrorKind = "type" | "size";

export function validatePassportFileClient(file: File): FileErrorKind | null {
  if (!(PASSPORT_ALLOWED_TYPES as readonly string[]).includes(file.type)) return "type";
  if (file.size > PASSPORT_MAX_BYTES) return "size";
  return null;
}

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function PassportUpload({
  file,
  onChange,
  onInvalid,
  cta,
  replaceLabel,
  removeLabel,
  error,
  id,
}: {
  file: File | null;
  onChange: (file: File | null) => void;
  onInvalid: (kind: FileErrorKind) => void;
  cta: string;
  replaceLabel: string;
  removeLabel: string;
  error?: string;
  id?: string;
}) {
  const generated = useId();
  const inputId = id ?? generated;
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const preview = useMemo(
    () => (file && file.type.startsWith("image/") ? URL.createObjectURL(file) : null),
    [file]
  );

  const accept = (incoming: File | undefined | null) => {
    if (!incoming) return;
    const problem = validatePassportFileClient(incoming);
    if (problem) {
      onInvalid(problem);
      return;
    }
    onChange(incoming);
  };

  return (
    <div>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={PASSPORT_ALLOWED_TYPES.join(",")}
        className="sr-only"
        onChange={(e) => {
          accept(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      {file ? (
        <div className="flex items-center gap-4 rounded-xl border border-falcon-gold/40 bg-white p-3">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-parchment">
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="font-poppins text-[11px] font-semibold text-falcon-bronze">PDF</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-poppins text-sm font-medium text-ink">{file.name}</p>
            <p className="font-poppins text-xs text-ink/50">{formatBytes(file.size)}</p>
          </div>
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="rounded-lg px-3 py-1.5 font-poppins text-xs font-medium text-ink/70 hover:bg-parchment"
            >
              {replaceLabel}
            </button>
            <button
              type="button"
              onClick={() => onChange(null)}
              className="rounded-lg px-3 py-1.5 font-poppins text-xs font-medium text-red-600 hover:bg-red-50"
            >
              {removeLabel}
            </button>
          </div>
        </div>
      ) : (
        <label
          htmlFor={inputId}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            accept(e.dataTransfer.files?.[0]);
          }}
          className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-7 text-center transition ${
            dragging
              ? "border-falcon-gold bg-falcon-gold/10"
              : error
                ? "border-red-400 bg-red-50/40"
                : "border-ink/15 bg-white hover:border-falcon-gold hover:bg-parchment-light"
          }`}
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-parchment text-falcon-bronze">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
              <path d="M12 16V4m0 0-4.5 4.5M12 4l4.5 4.5M4 16.5V19a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span className="font-poppins text-sm text-ink/70">{cta}</span>
        </label>
      )}
    </div>
  );
}
