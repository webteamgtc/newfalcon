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

export const DEMO_OTP = "123456";

export const VIP_QUALIFICATION_TARGETS = {
  capital: 1_000_000,
  activity: 10_000,
} as const;

function getOverallProgressPercent(
  capitalCurrent: number,
  activityCurrent: number
): number {
  const capitalPercent = Math.min(
    Math.round((capitalCurrent / VIP_QUALIFICATION_TARGETS.capital) * 100),
    100
  );
  const activityPercent = Math.min(
    Math.round((activityCurrent / VIP_QUALIFICATION_TARGETS.activity) * 100),
    100
  );

  return Math.min(capitalPercent, activityPercent);
}

export const VIP_USERS: VipUser[] = [
  {
    id: "1",
    email: "mohammad.zeeshan@gtcfx.com",
    ibId: "12782512",
    firstName: "James",
    lastName: "Delaney",
    memberId: "GFN-2026-0241",
    memberTier: "Annual VIP Invitation Candidate",
    activeStageIndex: 0,
    stages: [
      { number: "01", name: "Registered", tier: "Silver Status" },
      { number: "02", name: "Active Trader", tier: "Gold Status" },
      { number: "03", name: "Qualified", tier: "Platinum Status" },
    ],
    capitalCurrent: 12500,
    capitalTarget: 1000000,
    activityCurrent: 8200,
    activityTarget: 10000,
    progressPercent: 1,
    daysRemaining: 241,
    summaryValue: "1%",
  },
  {
    id: "2",
    email: "adeel.nazeer@gtcfx.com",
    ibId: "14567890",
    firstName: "Sarah",
    lastName: "Mitchell",
    memberId: "GFN-2026-0187",
    memberTier: "Gold VIP Invitation Candidate",
    activeStageIndex: 1,
    stages: [
      { number: "01", name: "Registered", tier: "Silver Status" },
      { number: "02", name: "Active Trader", tier: "Gold Status" },
      { number: "03", name: "Qualified", tier: "Platinum Status" },
    ],
    capitalCurrent: 248000,
    capitalTarget: 1000000,
    activityCurrent: 620000,
    activityTarget: 10000,
    progressPercent: 25,
    daysRemaining: 198,
    summaryValue: "25%",
  },
  {
    id: "3",
    email: "henrye.huang@gtcfx.com",
    ibId: "16789012",
    firstName: "Omar",
    lastName: "Al-Rashid",
    memberId: "GFN-2026-0093",
    memberTier: "Platinum VIP Invitation Candidate",
    activeStageIndex: 2,
    stages: [
      { number: "01", name: "Registered", tier: "Silver Status" },
      { number: "02", name: "Active Trader", tier: "Gold Status" },
      { number: "03", name: "Qualified", tier: "Platinum Status" },
    ],
    capitalCurrent: 1000000,
    capitalTarget: 1000000,
    activityCurrent: 10000,
    activityTarget: 10000,
    progressPercent: 100,
    daysRemaining: 156,
    summaryValue: "100%",
  },
  {
    id: "4",
    email: "marketing@gtcfx.com",
    ibId: "18901234",
    firstName: "Elena",
    lastName: "Vasquez",
    memberId: "GFN-2026-0312",
    memberTier: "Annual VIP Invitation Candidate",
    activeStageIndex: 1,
    stages: [
      { number: "01", name: "Registered", tier: "Silver Status" },
      { number: "02", name: "Active Trader", tier: "Gold Status" },
      { number: "03", name: "Qualified", tier: "Platinum Status" },
    ],
    capitalCurrent: 89000,
    capitalTarget: 1000000,
    activityCurrent: 215000,
    activityTarget: 10000,
    progressPercent: 9,
    daysRemaining: 220,
    summaryValue: "9%",
  },
];

function findCatalogUser(email: string, ibId?: string): VipUser | undefined {
  const normalizedEmail = email.trim().toLowerCase();

  if (ibId) {
    const normalizedIbId = ibId.trim().toUpperCase();
    return VIP_USERS.find(
      (user) =>
        user.email.toLowerCase() === normalizedEmail &&
        user.ibId.toUpperCase() === normalizedIbId
    );
  }

  return VIP_USERS.find((user) => user.email.toLowerCase() === normalizedEmail);
}

export function normalizeVipUser(user: VipUser): VipUser {
  const catalogUser =
    findCatalogUser(user.email, user.ibId) ?? findCatalogUser(user.email);
  const base = catalogUser ?? user;
  const progressPercent = getOverallProgressPercent(
    base.capitalCurrent,
    base.activityCurrent
  );

  return {
    ...base,
    capitalTarget: VIP_QUALIFICATION_TARGETS.capital,
    activityTarget: VIP_QUALIFICATION_TARGETS.activity,
    progressPercent,
    summaryValue: `${progressPercent}%`,
  };
}

export function findVipUserByEmail(email: string): VipUser | undefined {
  const user = findCatalogUser(email);
  return user ? normalizeVipUser(user) : undefined;
}

export function findVipUserByCredentials(
  email: string,
  ibId: string
): VipUser | undefined {
  const user = findCatalogUser(email, ibId);
  return user ? normalizeVipUser(user) : undefined;
}

export function formatCurrency(value: number): string {
  return `$${value.toLocaleString("en-US")}`;
}

export function formatActivity(value: number): string {
  return value.toLocaleString("en-US");
}
