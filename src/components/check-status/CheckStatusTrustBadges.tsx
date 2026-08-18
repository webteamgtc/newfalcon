import { useTranslations } from "next-intl";

const badges = [
  {
    key: "trustSecure" as const,
    icon: (
      <path
        d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    key: "trustInstant" as const,
    icon: (
      <>
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
        <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </>
    ),
  },
  {
    key: "trustVerified" as const,
    icon: (
      <>
        <path
          d="M22 11.08V12a10 10 0 1 1-5.93-9.14"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M22 4 12 14.01l-3-3"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </>
    ),
  },
];

export default function CheckStatusTrustBadges() {
  const t = useTranslations("checkStatusPage");

  return (
    <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-4 md:gap-8">
      {badges.map(({ key, icon }) => (
        <div
          key={key}
          className="flex items-center gap-2.5 rounded-full border border-white/50 bg-white/35 px-4 py-2 backdrop-blur-sm"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#382910]/8 text-[#8A6A34]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              {icon}
            </svg>
          </span>
          <span className="font-poppins text-xs font-medium text-ink/75">{t(key)}</span>
        </div>
      ))}
    </div>
  );
}
