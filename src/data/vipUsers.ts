export type VipStage = {
  number: string;
  name: string;
  tier: string;
};

export type VipUser = {
  id: string;
  email: string;
  ibId: string;
  firstName: string;
  lastName: string;
  memberId: string;
  memberTier: string;
  activeStageIndex: number;
  stages: VipStage[];
  capitalCurrent: number;
  capitalTarget: number;
  activityCurrent: number;
  activityTarget: number;
  progressPercent: number;
  daysRemaining: number;
  summaryValue: string;
};


export const VIP_QUALIFICATION_TARGETS = {
  capital: 2_000_000,
  activity: 500_000,
} as const;

const DEFAULT_STAGES: VipStage[] = [
  { number: "01", name: "Registered", tier: "Silver Status" },
  { number: "02", name: "Active Trader", tier: "Gold Status" },
  { number: "03", name: "Qualified", tier: "Platinum Status" },
];

export const VIP_STAGES = DEFAULT_STAGES;

function getCapitalProgressPercent(capitalCurrent: number): number {
  return Math.min(
    Math.round((capitalCurrent / VIP_QUALIFICATION_TARGETS.capital) * 100),
    100
  );
}

function getActivityProgressPercent(activityCurrent: number): number {
  return Math.min(
    Math.round((activityCurrent / VIP_QUALIFICATION_TARGETS.activity) * 100),
    100
  );
}

export function isVipQualified(
  capitalCurrent: number,
  activityCurrent: number
): boolean {
  return (
    getCapitalProgressPercent(capitalCurrent) >= 100 ||
    getActivityProgressPercent(activityCurrent) >= 100
  );
}

function getOverallProgressPercent(
  capitalCurrent: number,
  activityCurrent: number
): number {
  return Math.max(
    getCapitalProgressPercent(capitalCurrent),
    getActivityProgressPercent(activityCurrent)
  );
}

function getActiveStageIndex(capital: number, activity: number): number {
  if (isVipQualified(capital, activity)) return 2;
  if (capital > 0 || activity > 0) return 1;
  return 0;
}

function getQualificationDaysRemaining() {
  const end = new Date("2026-11-30T23:59:59");
  return Math.max(
    0,
    Math.ceil((end.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  );
}

export type IbClientData = {
  email: string;
  memberId: string;
  firstName: string;
  clientStatus?: string;
  kycStatus?: string;
  userType?: string;
};

export type IbPerformanceData = {
  netDepositUsd: number;
  tradeLots: number;
  depositUsd?: number;
  withdrawalUsd?: number;
};

export function buildVipUser(
  client: IbClientData,
  performance: IbPerformanceData,
  ibId: string
): VipUser {
  const capitalCurrent = Math.max(0, performance.netDepositUsd);
  const activityCurrent = Math.max(0, performance.tradeLots);
  const progressPercent = getOverallProgressPercent(capitalCurrent, activityCurrent);

  return {
    id: client.memberId || ibId.trim(),
    email: client.email.toLowerCase(),
    ibId: ibId.trim(),
    firstName: client.firstName,
    lastName: "",
    memberId: client.memberId,
    memberTier: "GTCFX Partner",
    activeStageIndex: getActiveStageIndex(capitalCurrent, activityCurrent),
    stages: DEFAULT_STAGES,
    capitalCurrent,
    capitalTarget: VIP_QUALIFICATION_TARGETS.capital,
    activityCurrent,
    activityTarget: VIP_QUALIFICATION_TARGETS.activity,
    progressPercent,
    daysRemaining: getQualificationDaysRemaining(),
    summaryValue: `${progressPercent}%`,
  };
}

export function normalizeVipUser(user: VipUser): VipUser {
  const progressPercent = getOverallProgressPercent(
    user.capitalCurrent,
    user.activityCurrent
  );

  return {
    ...user,
    capitalTarget: VIP_QUALIFICATION_TARGETS.capital,
    activityTarget: VIP_QUALIFICATION_TARGETS.activity,
    progressPercent,
    summaryValue: `${progressPercent}%`,
    activeStageIndex: getActiveStageIndex(
      user.capitalCurrent,
      user.activityCurrent
    ),
  };
}

export function formatCurrency(value: number): string {
  return `$${value.toLocaleString("en-US", {
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatActivity(value: number): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
}

export type VipProgressSnapshot = {
  hasPerformanceData: boolean;
  capitalCurrent: number;
  capitalTarget: number;
  capitalPercent: number;
  activityCurrent: number;
  activityTarget: number;
  activityPercent: number;
  progressPercent: number;
  isFullyQualified: boolean;
  activeStageIndex: number;
  stageNumber: string;
  stageName: string;
  stageTier: string;
  daysRemaining: number;
};

export function getProgressColors(percent: number) {
  if (percent >= 100) {
    return { bar: "#22C55E", text: "#15803D", badge: "bg-emerald-100 text-emerald-800" };
  }
  if (percent >= 50) {
    return { bar: "#F97316", text: "#C2410C", badge: "bg-orange-100 text-orange-800" };
  }
  if (percent >= 25) {
    return { bar: "#EAB308", text: "#A16207", badge: "bg-yellow-100 text-yellow-800" };
  }
  return { bar: "#EF4444", text: "#B91C1C", badge: "bg-red-100 text-red-800" };
}

export function computeVipProgressSnapshot(
  performance?: Pick<IbPerformanceData, "netDepositUsd" | "tradeLots"> | null
): VipProgressSnapshot {
  const hasPerformanceData = performance != null;
  const capitalCurrent = Math.max(0, performance?.netDepositUsd ?? 0);
  const activityCurrent = Math.max(0, performance?.tradeLots ?? 0);
  const capitalPercent = getCapitalProgressPercent(capitalCurrent);
  const activityPercent = getActivityProgressPercent(activityCurrent);
  const progressPercent = getOverallProgressPercent(capitalCurrent, activityCurrent);
  const activeStageIndex = getActiveStageIndex(capitalCurrent, activityCurrent);
  const stage = DEFAULT_STAGES[activeStageIndex] ?? DEFAULT_STAGES[0];

  return {
    hasPerformanceData,
    capitalCurrent,
    capitalTarget: VIP_QUALIFICATION_TARGETS.capital,
    capitalPercent,
    activityCurrent,
    activityTarget: VIP_QUALIFICATION_TARGETS.activity,
    activityPercent,
    progressPercent,
    isFullyQualified: isVipQualified(capitalCurrent, activityCurrent),
    activeStageIndex,
    stageNumber: stage.number,
    stageName: stage.name,
    stageTier: stage.tier,
    daysRemaining: getQualificationDaysRemaining(),
  };
}
