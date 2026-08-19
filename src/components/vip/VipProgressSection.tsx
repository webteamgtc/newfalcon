"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useVipUser } from "@/context/VipUserProvider";
import { formatActivity, formatCurrency, VIP_QUALIFICATION_TARGETS } from "@/data/vipUsers";
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

export default function VipProgressSection() {
  const t = useTranslations("vipPage");
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
  const isFullyQualified = capitalPercent >= 100 && activityPercent >= 100;

  return (
    <section id="progress" className="scroll-mt-4 bg-[#FFFDF8] py-12 md:py-16">
      <div className="container">
        <div className="grid gap-6 md:grid-cols-[1fr_0.8fr] md:items-end md:gap-14">
          <div>
            <p className="eyebrow !capitalize text-[#382910]">
              <span className="font-poppins">{t("journeyEyebrow")}</span>
            </p>
            <h2 className="mt-4 font-display HeadingH1 !font-medium !text-ink">
              {t("journeyHeadingPlain")}
              <br />
              <span className="italic text-falcon-deep">
                {t("journeyHeadingItalic")}
              </span>
            </h2>
          </div>
          <p className="TextSmall !leading-snug !font-poppins !text-[#382910]">
            {t("journeySubtext")}
          </p>
        </div>

        <div className="mt-8 grid border-s border-t border-ink/20 md:mt-14 md:grid-cols-3">
          {user.stages.map((stage, index) => {
            const isQualifiedStage = isFullyQualified && index === user.activeStageIndex;
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
                <div className="flex items-center gap-4">
                  <span className={`font-poppins flex h-8 w-8 items-center justify-center rounded-full border text-xs tracking-[0.14em] ${isQualifiedStage ? "border-green-500 text-green-700 bg-green-50" : "border-[#382910] text-ink"}`}>
                    {isQualifiedStage ? "✓" : stage.number}
                  </span>

                  <div>
                    <p className={`mb-1 text-xs !font-poppins ${isQualifiedStage ? "!text-green-700" : "!text-ink"}`}>{stage.tier}</p>
                    <h3 className={`font-display HeadingH5 !font-medium ${isQualifiedStage ? "!text-green-700" : "!text-ink"}`}>
                      {stage.name}
                    </h3>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
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
          />
        </div>
        {!isFullyQualified &&

          <div
            className={`mx-auto mt-6 flex max-w-3xl flex-col gap-6 px-7 py-5 md:mt-12 ${isFullyQualified ? "" : "md:flex-row md:items-center md:justify-between"}`}
            style={{
              borderRadius: "64px",
              border: isFullyQualified ? "2px solid #22C55E" : "1px solid rgba(56, 41, 16, 0.30)",
              background: isFullyQualified ? "#F0FDF4" : "#FBF6ED",
            }}
          >
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between md:gap-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className={`font-poppins text-xs uppercase tracking-[0.13em] ${isFullyQualified ? "text-green-700" : "text-[#382910]"}`}>
                    {isFullyQualified ? t("fullyQualifiedLabel") : t("summaryLabel")}
                  </p>
                  <p className={`mt-1 font-poppins text-xs uppercase tracking-[0.13em] ${isFullyQualified ? "text-green-600" : "text-[#382910]"}`}>
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
                  <p className={`font-poppins text-xs uppercase tracking-[0.13em] ${isFullyQualified ? "text-green-700" : "text-[#382910]"}`}>
                    {t("daysLabel")}
                  </p>
                  <p className={`mt-1 font-poppins text-xs uppercase tracking-[0.13em] ${isFullyQualified ? "text-green-600" : "text-[#382910]"}`}>
                    {isFullyQualified ? t("fullyQualifiedSubtext") : t("progressSubtext")}
                  </p>
                </div>
                <p className={`font-display HeadingH3 !font-medium ${isFullyQualified ? "!text-green-700" : "!text-falcon-deep"}`}>
                  {user.daysRemaining}
                </p>
              </div>
            </div>
          </div>
        }
        {isFullyQualified && (
          <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={() => setBookingModalOpen(true)}
            disabled={hasRegistered}
            className="inline-flex h-12 min-w-[180px] max-w-md items-center justify-center rounded-full bg-green-700 px-8 font-poppins text-xs uppercase tracking-[0.14em] text-white transition-colors hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
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

function getMotivationalMessage(percent: number): string {
  if (percent >= 75) return "🔥 Almost there! Final push to qualify.";
  if (percent >= 50) return "🚀 Halfway there! Keep the momentum going.";
  if (percent >= 25) return "💪 Great start! You're building strong.";
  if (percent > 0) return "✨ Journey started! Every step counts.";
  return "🎯 Start now to qualify for VIP status.";
}

function getNextMilestone(percent: number): { label: string; value: number } {
  if (percent < 25) return { label: "25%", value: 25 };
  if (percent < 50) return { label: "50%", value: 50 };
  if (percent < 75) return { label: "75%", value: 75 };
  return { label: "100%", value: 100 };
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
}: {
  label: string;
  title: string;
  current: any;
  target: any;
  targetLabel: string;
  remaining: string;
  targetText: string;
  percentText: string;
  percent: number;
}) {
  const colors = getProgressColors(percent);
  const isComplete = percent >= 100;
  const motivation = getMotivationalMessage(percent);
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
        <p className="font-poppins text-xs uppercase tracking-[0.14em] text-[#382910]">
          {label}
        </p>
        {isComplete ? (
          <div className="flex items-center gap-1.5 rounded-full bg-green-500 px-3 py-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M20 6L9 17l-5-5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="font-poppins text-[10px] font-bold uppercase tracking-wider text-white">Eligible</span>
          </div>
        ) : (
          <p className="font-poppins text-xs uppercase tracking-[0.14em] text-[#382910]">
            {targetText}
          </p>
        )}
      </div>
      <div className="mt-8 flex items-end justify-between gap-5">
        <div>
          <h3 className="font-display HeadingH4 !font-medium !text-ink">{title}</h3>
          <p className={`mt-4 font-display text-2xl ${isComplete ? "text-green-700" : "text-ink"}`}>{current}</p>
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
            Next: {nextMilestone.label}
          </span>
          <span className="font-poppins text-[10px] text-[#382910]/50">100%</span>
        </div>
      )}
      <p
        className={`mt-3 HeadingH4 border-b pb-2 ${isComplete ? "border-green-300" : "border-[#D8C8AE]"}`}
        style={{ color: colors.text }}
      >
        {percentText}{isComplete && " ✓"}
      </p>
      <p className="mt-3 TextSmall !font-poppins !text-[#382910]">
        {isComplete ? "Qualification target achieved!" : remaining}
      </p>
      {!isComplete && (
        <p className="mt-2 font-poppins text-xs leading-snug" style={{ color: colors.text }}>
          {motivation}
        </p>
      )}
    </article>
  );
}
