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
  capital: 1_000_000,
  activity: 50_000,
} as const;

const DEFAULT_STAGES: VipStage[] = [
  { number: "01", name: "Registered", tier: "Silver Status" },
  { number: "02", name: "Active Trader", tier: "Gold Status" },
  { number: "03", name: "Qualified", tier: "Platinum Status" },
];

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
