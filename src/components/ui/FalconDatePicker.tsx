"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { DayPicker, type Matcher } from "react-day-picker";
import { format, isValid, parse, startOfDay, startOfMonth, endOfMonth } from "date-fns";
import { ar, enUS } from "date-fns/locale";
import { useLocale } from "next-intl";
import "react-day-picker/style.css";

type FalconDatePickerProps = {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
  id?: string;
};

function parseIsoDate(value: string): Date | undefined {
  if (!value) return undefined;
  const parsed = parse(value, "yyyy-MM-dd", new Date());
  return isValid(parsed) ? startOfDay(parsed) : undefined;
}

function toIsoDate(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

function CalendarIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      aria-hidden="true"
      className="shrink-0 text-falcon-gold"
    >
      <rect x="2" y="3.5" width="14" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M2 7h14" stroke="currentColor" strokeWidth="1.2" />
      <path d="M6 2v3M12 2v3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function fieldClass(error?: string) {
  return `mt-2 h-12 w-full rounded-md border bg-white px-3 font-poppins text-sm text-ink outline-none transition-colors focus:border-falcon-deep ${
    error ? "border-red-500" : "border-ink/20"
  }`;
}

export default function FalconDatePicker({
  value,
  onChange,
  error,
  placeholder = "Select date",
  minDate,
  maxDate,
  disabled = false,
  id,
}: FalconDatePickerProps) {
  const locale = useLocale();
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const dateFnsLocale = locale === "ar" ? ar : enUS;
  const selected = parseIsoDate(value);
  const today = useMemo(() => startOfDay(new Date()), []);
  const [open, setOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState<Date>(() => selected ?? startOfDay(new Date()));
  const containerRef = useRef<HTMLDivElement>(null);

  const displayValue = selected
    ? format(selected, "dd MMM yyyy", { locale: dateFnsLocale })
    : "";

  const calendarBounds = useMemo(() => {
    const fallbackStart = startOfMonth(new Date(today.getFullYear() - 100, 0, 1));
    const fallbackEnd = endOfMonth(new Date(today.getFullYear() + 20, 11, 1));

    return {
      startMonth: minDate ? startOfMonth(minDate) : fallbackStart,
      endMonth: maxDate ? endOfMonth(maxDate) : fallbackEnd,
    };
  }, [minDate, maxDate, today]);

  const reverseYears = useMemo(() => {
    if (!maxDate) return false;
    return startOfDay(maxDate) <= today;
  }, [maxDate, today]);

  const disabledMatchers = useMemo(() => {
    const matchers: Matcher[] = [];
    if (minDate) matchers.push({ before: startOfDay(minDate) });
    if (maxDate) matchers.push({ after: startOfDay(maxDate) });
    return matchers;
  }, [minDate, maxDate]);

  useEffect(() => {
    if (!open) return;
    setVisibleMonth(selected ?? minDate ?? maxDate ?? today);
  }, [open, selected, minDate, maxDate, today]);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (containerRef.current?.contains(event.target as Node)) return;
      setOpen(false);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const handleSelect = (date: Date | undefined) => {
    if (!date) return;
    onChange(toIsoDate(date));
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        id={inputId}
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className={`${fieldClass(error)} flex items-center justify-between gap-3 text-left ${
          !displayValue ? "text-ink/40" : ""
        } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
      >
        <span className="truncate">{displayValue || placeholder}</span>
        <CalendarIcon />
      </button>

      {open && (
        <div
          role="dialog"
          aria-label={placeholder}
          className={`falcon-day-picker absolute z-50 mt-2 w-[min(100vw-2rem,340px)] rounded-xl border border-ink/10 bg-white p-4 shadow-[0_12px_32px_rgba(28,25,18,0.1)] ${
            locale === "ar" ? "right-0" : "left-0"
          }`}
        >
          <DayPicker
            mode="single"
            selected={selected}
            onSelect={handleSelect}
            locale={dateFnsLocale}
            dir={locale === "ar" ? "rtl" : "ltr"}
            captionLayout="dropdown"
            navLayout="after"
            reverseYears={reverseYears}
            startMonth={calendarBounds.startMonth}
            endMonth={calendarBounds.endMonth}
            month={visibleMonth}
            onMonthChange={setVisibleMonth}
            disabled={disabledMatchers.length ? disabledMatchers : undefined}
            showOutsideDays
            formatters={{
              formatWeekdayName: (date) =>
                format(date, "EEEEEE", { locale: dateFnsLocale }).toUpperCase(),
            }}
            classNames={{
              root: "rdp-root falcon-day-picker__root",
              months: "falcon-day-picker__months",
              month: "falcon-day-picker__month",
              month_caption: "falcon-day-picker__caption",
              dropdowns: "falcon-day-picker__dropdowns",
              dropdown_root: "falcon-day-picker__dropdown-root",
              caption_label: "falcon-day-picker__caption-label",
              nav: "falcon-day-picker__nav",
              button_previous: "falcon-day-picker__nav-btn",
              button_next: "falcon-day-picker__nav-btn",
              month_grid: "falcon-day-picker__grid",
              weekdays: "falcon-day-picker__weekdays",
              weekday: "falcon-day-picker__weekday",
              week: "falcon-day-picker__week",
              day: "falcon-day-picker__day",
              day_button: "falcon-day-picker__day-btn",
            }}
          />
        </div>
      )}
    </div>
  );
}
