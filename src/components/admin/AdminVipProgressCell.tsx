"use client";

import {
  formatActivity,
  formatCurrency,
  getProgressColors,
  type VipProgressSnapshot,
} from "@/data/vipUsers";

const LEGEND_ITEMS = [
  { label: "0%", description: "Not started", color: "#94A3B8", min: 0, max: 0 },
  { label: "1–24%", description: "Getting started", color: "#EF4444", min: 1, max: 24 },
  { label: "25–49%", description: "Building momentum", color: "#EAB308", min: 25, max: 49 },
  { label: "50–99%", description: "Strong progress", color: "#F97316", min: 50, max: 99 },
  { label: "100%", description: "Target reached", color: "#22C55E", min: 100, max: 100 },
] as const;

export function AdminVipProgressLegend() {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl border border-[#382910]/10 bg-[#FFFDF8] px-4 py-3">
      <span className="font-poppins text-[10px] uppercase tracking-[0.1em] text-ink/45">
        Progress key
      </span>
      {LEGEND_ITEMS.map((item) => (
        <span key={item.label} className="inline-flex items-center gap-2 font-poppins text-xs text-ink/70">
          <span
            className="h-2.5 w-2.5 shrink-0 rounded-full ring-2 ring-white"
            style={{ backgroundColor: item.color }}
            aria-hidden
          />
          <span className="font-medium text-ink">{item.label}</span>
          <span className="text-ink/45">{item.description}</span>
        </span>
      ))}
    </div>
  );
}

export function AdminVipNetDepositBar({
  percent,
  amount,
  hasData = true,
}: {
  percent: number;
  amount: number;
  hasData?: boolean;
}) {
  if (!hasData) {
    return <span className="font-poppins text-sm text-ink/35">—</span>;
  }

  const colors =
    percent === 0 ? { bar: "#94A3B8", text: "#64748B" } : getProgressColors(percent);
  const width = Math.min(100, Math.max(0, percent));

  return (
    <div className="min-w-[148px]">
      <div className="flex items-center justify-between gap-2">
        <span className="font-poppins text-xs font-semibold tabular-nums" style={{ color: colors.text }}>
          {percent}%
        </span>
        <span className="font-poppins text-[10px] tabular-nums text-ink/45">
          {formatCurrency(amount)}
        </span>
      </div>
      <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-ink/8">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${width}%`, backgroundColor: colors.bar }}
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Net deposit ${percent}%`}
        />
      </div>
    </div>
  );
}

export function AdminVipPercentBadge({
  percent,
  hasData = true,
}: {
  percent: number;
  hasData?: boolean;
}) {
  if (!hasData) {
    return <span className="font-poppins text-sm text-ink/35">—</span>;
  }

  const colors =
    percent === 0
      ? { bar: "#94A3B8", text: "#64748B" }
      : getProgressColors(percent);

  return (
    <span className="inline-flex items-center gap-2 font-poppins text-sm font-medium" style={{ color: colors.text }}>
      <span
        className="h-2.5 w-2.5 shrink-0 rounded-full"
        style={{ backgroundColor: colors.bar }}
        aria-hidden
      />
      {percent}%
    </span>
  );
}

export function AdminVipStageBadge({ progress }: { progress: VipProgressSnapshot }) {
  if (!progress.hasPerformanceData) {
    return <span className="font-poppins text-sm text-ink/35">—</span>;
  }

  if (progress.isFullyQualified) {
    return (
      <span className="inline-flex items-center gap-1.5 font-poppins text-sm font-medium text-emerald-700">
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" aria-hidden />
        Qualified
      </span>
    );
  }

  const colors =
    progress.progressPercent === 0
      ? { bar: "#94A3B8", text: "#64748B" }
      : getProgressColors(progress.progressPercent);

  return (
    <span className="inline-flex items-center gap-1.5 font-poppins text-sm" style={{ color: colors.text }}>
      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: colors.bar }} aria-hidden />
      {progress.stageName}
    </span>
  );
}

export default function AdminVipProgressDetail({
  progress,
}: {
  progress: VipProgressSnapshot;
}) {
  if (!progress.hasPerformanceData) {
    return (
      <p className="font-poppins text-sm text-ink/45">
        IB client not verified at registration — no performance data available.
      </p>
    );
  }

  const capitalColors = getProgressColors(progress.capitalPercent);
  const activityColors = getProgressColors(progress.activityPercent);

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <div className="rounded-lg border border-ink/10 bg-[#FFFDF8] p-4">
        <p className="font-poppins text-[10px] uppercase tracking-[0.08em] text-ink/45">Capital</p>
        <p className="mt-2 font-display text-2xl font-medium" style={{ color: capitalColors.text }}>
          {progress.capitalPercent}%
        </p>
        <p className="mt-1 font-poppins text-xs text-ink/60">
          {formatCurrency(progress.capitalCurrent)} / {formatCurrency(progress.capitalTarget)}
        </p>
      </div>
      <div className="rounded-lg border border-ink/10 bg-[#FFFDF8] p-4">
        <p className="font-poppins text-[10px] uppercase tracking-[0.08em] text-ink/45">Activity</p>
        <p className="mt-2 font-display text-2xl font-medium" style={{ color: activityColors.text }}>
          {progress.activityPercent}%
        </p>
        <p className="mt-1 font-poppins text-xs text-ink/60">
          {formatActivity(progress.activityCurrent)} / {formatActivity(progress.activityTarget)} lots
        </p>
      </div>
      <div className="rounded-lg border border-ink/10 bg-[#FFFDF8] p-4">
        <p className="font-poppins text-[10px] uppercase tracking-[0.08em] text-ink/45">Overall</p>
        <p className="mt-2 font-display text-2xl font-medium" style={{ color: getProgressColors(progress.progressPercent).text }}>
          {progress.progressPercent}%
        </p>
        <p className="mt-1 font-poppins text-xs text-ink/60">
          {progress.isFullyQualified ? "VIP qualified" : `${progress.daysRemaining} days left`}
        </p>
      </div>
    </div>
  );
}
