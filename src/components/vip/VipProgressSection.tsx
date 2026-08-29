"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useVipUser } from "@/context/VipUserProvider";
import { formatActivity, formatCurrency, isVipQualified, VIP_QUALIFICATION_TARGETS } from "@/data/vipUsers";
import VipTicketBookingModal from "@/components/vip/VipTicketBookingModal";
import { hasTicketBooking } from "@/components/vip/VipTicketBookingForm";

function getProgressColors(percent: number) {
  if (percent >= 100) {
    return { bar: "#22C55E", text: "#15803D" };
  }
  if (percent >= 50) {
    return { bar: "#F97316", text: "#C2410C" };
  }
  if (percent >= 25) {
    return { bar: "#EAB308", text: "#A16207" };
  }
  return { bar: "#EF4444", text: "#B91C1C" };
}

function getMotivationalMessage(
  percent: number,
  t: ReturnType<typeof useTranslations<"vipPage">>
) {
  if (percent >= 75) return t("motivation75");
  if (percent >= 50) return t("motivation50");
  if (percent >= 25) return t("motivation25");
  if (percent > 0) return t("motivationStarted");
  return t("motivationStart");
}

function getNextMilestone(percent: number): { label: string; value: number } {
  if (percent < 25) return { label: "25%", value: 25 };
  if (percent < 50) return { label: "50%", value: 50 };
  if (percent < 75) return { label: "75%", value: 75 };
  return { label: "100%", value: 100 };
}

export default function VipProgressSection() {
  const t = useTranslations("vipPage");
  const locale = useLocale();
  const useUppercaseLabels = locale === "en";
  const { user } = useVipUser();
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [hasRegistered, setHasRegistered] = useState(false);

  useEffect(() => {
    if (user) {
      setHasRegistered(hasTicketBooking(user.id));
    }
  }, [user, bookingModalOpen]);

  if (!user) return null;

  const capitalTarget = VIP_QUALIFICATION_TARGETS.capital;
  const activityTarget = VIP_QUALIFICATION_TARGETS.activity;
  const capitalRemaining = Math.max(capitalTarget - user.capitalCurrent, 0);
  const activityRemaining = Math.max(activityTarget - user.activityCurrent, 0);
  const capitalPercent = Math.min(
    Math.round((user.capitalCurrent / capitalTarget) * 100),
    100
  );
  const activityPercent = Math.min(
    Math.round((user.activityCurrent / activityTarget) * 100),
    100
  );
  const summaryPercent = user.progressPercent;
  const summaryColors = getProgressColors(summaryPercent);
  const isFullyQualified = isVipQualified(user.capitalCurrent, user.activityCurrent);
  const stageLabels = t.raw("stages") as {
    number: string;
    name: string;
    description?: string;
  }[];

  return (
    <section
      id="progress"
      className="relative isolate scroll-mt-4 overflow-hidden bg-[#FFFDF8] bg-[url('/result-banner.jpeg')] bg-contain bg-right-top bg-no-repeat py-12 md:py-16"
    >
      <div className="container relative z-10">
        <div className="grid gap-6 md:grid-cols-12 md:items-center md:gap-14">
          <div className="col-span-12 flex items-center md:col-span-5">
            <h2 className="font-display HeadingH2 !font-medium !text-ink">
              {t("journeyHeadingPlain")}
              {t("journeyHeadingItalic") ? (
                <>
                  {" "}
                  <span className="italic text-falcon-deep">
                    {t("journeyHeadingItalic")}
                  </span>
                </>
              ) : null}
            </h2>
          </div>
          <p className="col-span-12 flex items-center TextSmall !leading-snug !font-poppins !text-[#382910] md:col-span-7">
            {t("journeySubtext")}
          </p>
        </div>

        <div className="mt-8 grid border-s border-t border-ink/20 md:mt-14 md:grid-cols-3">
          {user.stages.map((stage, index) => {
            const isQualifiedStage = isFullyQualified && index === user.activeStageIndex;
            const stageLabel = stageLabels[index] ?? stage;
            return (
              <article
                key={stage.number}
                className="border-b border-e border-[#3829104D] px-5 py-5 md:px-7"
                style={
                  isQualifiedStage
                    ? {
                        background:
                          "linear-gradient(117deg, #DCFCE7 0.63%, #F0FDF4 100%)",
                        borderColor: "#22C55E",
                      }
                    : index === user.activeStageIndex
                      ? {
                          background:
                            "linear-gradient(117deg, #E8CB8F 0.63%, #FEF3DA 100%)",
                        }
                      : {
                          background: "#F8F0E4",
                        }
                }
              >
                <div className="flex items-start gap-4">
                  <span
                    className={`font-poppins flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs tracking-[0.14em] ${isQualifiedStage ? "border-green-500 text-green-700 bg-green-50" : "border-[#382910] text-ink"}`}
                  >
                    {isQualifiedStage ? "✓" : stageLabel.number}
                  </span>

                  <div>
                    <h3
                      className={`font-display HeadingH5 !font-medium ${isQualifiedStage ? "!text-green-700" : "!text-ink"}`}
                    >
                      {stageLabel.name}
                    </h3>
                    {"description" in stageLabel && stageLabel.description ? (
                      <p
                        className={`mt-1 font-poppins text-xs leading-snug ${isQualifiedStage ? "text-green-700/80" : "text-[#382910]/70"}`}
                      >
                        {stageLabel.description}
                      </p>
                    ) : null}
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-6 flex flex-col md:grid md:grid-cols-[1fr_auto_1fr] md:items-stretch">
          <ProgressCard
            label={t("capitalLabel")}
            title={t("capitalTitle")}
            current={formatCurrency(user.capitalCurrent)}
            target={formatCurrency(capitalTarget)}
            targetLabel={t("targetLabel")}
            remaining={t("capitalRemaining", {
              amount: formatCurrency(capitalRemaining),
            })}
            targetText={t("targetValue", {
              amount: formatCurrency(capitalTarget),
            })}
            percentText={`${capitalPercent}%`}
            percent={capitalPercent}
            t={t}
            useUppercaseLabels={useUppercaseLabels}
          />
          <QualificationOrDivider
            label={t("qualificationOr")}
            hint={t("qualificationOrHint")}
            useUppercaseLabels={useUppercaseLabels}
          />
          <ProgressCard
            label={t("activityLabel")}
            title={t("activityTitle")}
            current={formatActivity(user.activityCurrent)}
            target={formatActivity(activityTarget)}
            targetLabel={t("targetLabel")}
            remaining={t("activityRemaining", {
              amount: formatActivity(activityRemaining),
            })}
            targetText={t("targetValue", {
              amount: formatActivity(activityTarget),
            })}
            percentText={`${activityPercent}%`}
            percent={activityPercent}
            t={t}
            useUppercaseLabels={useUppercaseLabels}
          />
        </div>
        {!isFullyQualified && (
          <div
            className={`mx-auto mt-6 flex max-w-3xl flex-col gap-6 px-7 py-5 md:mt-12 ${isFullyQualified ? "" : "md:flex-row md:items-center md:justify-between"}`}
            style={{
              borderRadius: "64px",
              border: isFullyQualified
                ? "2px solid #22C55E"
                : "1px solid rgba(56, 41, 16, 0.30)",
              background: isFullyQualified ? "#F0FDF4" : "#FBF6ED",
            }}
          >
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between md:gap-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p
                    className={`font-poppins text-xs ${useUppercaseLabels ? "uppercase tracking-[0.13em]" : "tracking-wide"} ${isFullyQualified ? "text-green-700" : "text-[#382910]"}`}
                  >
                    {isFullyQualified ? t("fullyQualifiedLabel") : t("summaryLabel")}
                  </p>
                  <p
                    className={`mt-1 font-poppins text-xs ${useUppercaseLabels ? "uppercase tracking-[0.13em]" : "tracking-wide"} ${isFullyQualified ? "text-green-600" : "text-[#382910]"}`}
                  >
                    {isFullyQualified ? t("fullyQualifiedSubtext") : t("progressSubtext")}
                  </p>
                </div>
                <p
                  className="font-display HeadingH3 !font-medium"
                  style={{ color: isFullyQualified ? "#15803D" : summaryColors.text }}
                >
                  {user.summaryValue}
                </p>
              </div>
              <span className="hidden h-8 w-px bg-ink/15 md:block" />
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p
                    className={`font-poppins text-xs ${useUppercaseLabels ? "uppercase tracking-[0.13em]" : "tracking-wide"} ${isFullyQualified ? "text-green-700" : "text-[#382910]"}`}
                  >
                    {t("daysLabel")}
                  </p>
                  <p
                    className={`mt-1 font-poppins text-xs ${useUppercaseLabels ? "uppercase tracking-[0.13em]" : "tracking-wide"} ${isFullyQualified ? "text-green-600" : "text-[#382910]"}`}
                  >
                    {isFullyQualified ? t("fullyQualifiedSubtext") : t("progressSubtext")}
                  </p>
                </div>
                <p
                  className={`font-display HeadingH3 !font-medium ${isFullyQualified ? "!text-green-700" : "!text-falcon-deep"}`}
                >
                  {user.daysRemaining}
                </p>
              </div>
            </div>
          </div>
        )}
        {isFullyQualified && (
          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={() => setBookingModalOpen(true)}
              disabled={hasRegistered}
              className={`inline-flex h-12 min-w-[180px] max-w-md items-center justify-center rounded-full bg-green-700 px-8 font-poppins text-xs text-white transition-colors hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60 ${useUppercaseLabels ? "uppercase tracking-[0.14em]" : "tracking-wide"}`}
            >
              {hasRegistered ? t("registeredCta") : t("registerCta")}
            </button>
          </div>
        )}

        <VipTicketBookingModal
          open={bookingModalOpen}
          onClose={() => setBookingModalOpen(false)}
          user={user}
        />
      </div>
    </section>
  );
}

function QualificationOrDivider({
  label,
  hint,
  useUppercaseLabels,
}: {
  label: string;
  hint: string;
  useUppercaseLabels: boolean;
}) {
  return (
    <div
      className="flex flex-col items-center justify-center px-2 py-4 md:px-4 md:py-0"
      role="separator"
      aria-label={hint}
    >
      <div className="flex w-full items-center gap-3 md:h-full md:w-auto md:flex-col md:justify-center md:gap-3">
        <span
          className="h-px flex-1 bg-[#382910]/20 md:h-auto md:min-h-[3rem] md:w-px md:flex-none"
          aria-hidden
        />
        <div className="flex shrink-0 flex-col items-center gap-1.5">
          <span
            className={`flex h-12 w-12 items-center justify-center rounded-full border-2 border-falcon-deep/35 bg-gradient-to-br from-[#FEF3DA] to-[#FBF6ED] font-display text-base font-semibold text-falcon-deep shadow-[0_4px_16px_-4px_rgba(56,41,16,0.18)] ${useUppercaseLabels ? "uppercase tracking-[0.12em]" : "tracking-wide"}`}
          >
            {label}
          </span>
          <p className="max-w-[140px] text-center font-poppins text-[10px] leading-snug text-[#382910]/65 md:max-w-[88px]">
            {hint}
          </p>
        </div>
        <span
          className="h-px flex-1 bg-[#382910]/20 md:h-auto md:min-h-[3rem] md:w-px md:flex-none"
          aria-hidden
        />
      </div>
    </div>
  );
}

function ProgressCard({
  label,
  title,
  current,
  target,
  remaining,
  targetText,
  percentText,
  percent,
  t,
  useUppercaseLabels,
}: {
  label: string;
  title: string;
  current: string;
  target: string;
  targetLabel: string;
  remaining: string;
  targetText: string;
  percentText: string;
  percent: number;
  t: ReturnType<typeof useTranslations<"vipPage">>;
  useUppercaseLabels: boolean;
}) {
  const colors = getProgressColors(percent);
  const isComplete = percent >= 100;
  const motivation = getMotivationalMessage(percent, t);
  const nextMilestone = getNextMilestone(percent);

  return (
    <article
      className="p-4 md:p-6"
      style={{
        border: isComplete ? "2px solid #22C55E" : "1px solid rgba(56, 41, 16, 0.30)",
        background: isComplete
          ? "linear-gradient(117deg, #F0FDF4 0.63%, #DCFCE7 100%)"
          : "linear-gradient(117deg, #FDFCFA 0.63%, #F3E5CB 100%)",
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <p
          className={`font-poppins text-xs text-[#382910] ${useUppercaseLabels ? "uppercase tracking-[0.14em]" : "tracking-wide"}`}
        >
          {label}
        </p>
        {isComplete ? (
          <div className="flex items-center gap-1.5 rounded-full bg-green-500 px-3 py-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M20 6L9 17l-5-5"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span
              className={`font-poppins text-[10px] font-bold text-white ${useUppercaseLabels ? "uppercase tracking-wider" : "tracking-wide"}`}
            >
              {t("progressEligible")}
            </span>
          </div>
        ) : (
          <p
            className={`font-poppins text-xs text-[#382910] ${useUppercaseLabels ? "uppercase tracking-[0.14em]" : "tracking-wide"}`}
          >
            {targetText}
          </p>
        )}
      </div>
      <div className="mt-8 flex items-end justify-between gap-5">
        <div>
          <h3 className="font-display HeadingH4 !font-medium !text-ink">{title}</h3>
          <p className={`mt-4 font-display text-2xl ${isComplete ? "text-green-700" : "text-ink"}`}>
            {current}
          </p>
        </div>
        <div className="text-end">
          <p className="mt-1 font-poppins text-sm font-medium text-ink">{target}</p>
        </div>
      </div>
      <div className="relative mt-6 h-2.5 overflow-hidden rounded-full bg-[#D8C8AE]">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${percent}%`, backgroundColor: colors.bar }}
        />
        {!isComplete && (
          <div
            className="absolute top-0 h-full w-px bg-[#382910]/30"
            style={{ left: `${nextMilestone.value}%` }}
          />
        )}
      </div>
      {!isComplete && (
        <div className="mt-2 flex justify-between">
          <span className="font-poppins text-[10px] text-[#382910]/50">0%</span>
          <span className="font-poppins text-[10px] font-medium" style={{ color: colors.text }}>
            {t("progressNext", { milestone: nextMilestone.label })}
          </span>
          <span className="font-poppins text-[10px] text-[#382910]/50">100%</span>
        </div>
      )}
      <p
        className={`mt-3 HeadingH4 border-b pb-2 ${isComplete ? "border-green-300" : "border-[#D8C8AE]"}`}
        style={{ color: colors.text }}
      >
        {percentText}
        {isComplete && " ✓"}
      </p>
      <p className="mt-3 TextSmall !font-poppins !text-[#382910]">
        {isComplete ? t("progressTargetAchieved") : remaining}
      </p>
      {!isComplete && (
        <p className="mt-2 font-poppins text-xs leading-snug" style={{ color: colors.text }}>
          {motivation}
        </p>
      )}
    </article>
  );
}
