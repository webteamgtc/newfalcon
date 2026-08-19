import { useTranslations } from "next-intl";
import Image from "next/image";
import Button from "@/components/Button";

export default function Hero() {
  const t = useTranslations("home.hero");

  return (
    <section className="relative overflow-hidden pb-20 pt-40 md:pb-32 md:pt-48">
      <div className="pointer-events-none absolute inset-0 -z-10 md:h-full h-full overflow-hidden" aria-hidden>
        <Image
          src="/images/home-banner.webp"
          alt=""
          fill
          priority
          className="h-full w-full object-fill object-center hidden md:block"
        />
         <Image
          src="/images/tra-mobile.webp"
          alt=""
          fill
          priority
          className="h-full w-full object-fill object-center block md:hidden"
        />
      </div>
      <div className="container grid items-center gap-12 md:grid-cols-2">
        <div>
          {/* Eyebrow */}
          <p className="font-poppins text-sm md:text-base uppercase tracking-[0.35em] text-falcon-deep font-semibold">
            {t("eyebrow")}
          </p>

          {/* Diamond divider */}
          <div className="mt-4 mb-6 flex items-center gap-3">
            <span className="block h-px w-12 bg-falcon-deep" />
            <span className="block h-3 w-3 rotate-45 border border-falcon-deep" />
            <span className="block h-px w-12 bg-falcon-deep" />
          </div>

          {/* Main heading */}
          <h1 className="font-display text-[3.2rem] uppercase leading-[1.05] md:text-[3.8rem] lg:text-[4.2rem] max-w-[650px]">
            <span className="text-falcon-deep">{t("titleLine1")}</span>{" "}
            <span className="text-ink">{t("titleLine2")}</span>{" "}
            <span className="text-ink">{t("titleLine3")}</span> <span className="text-falcon-deep text-[2.8rem]  md:text-[3.8rem] lg:text-[4.9rem]">{t("year")}</span>
          </h1>

          {/* Year */}
          <p className="mt-3 font-display text-2xl md:text-4xl tracking-[0.4em] text-falcon-deep font-bold">
            
          </p>

          {/* Subtitle */}
          <p className="mt-6 font-display text-base md:text-2xl italic text-[#382910]">
            {t("subtitle")}
          </p>

          {/* Description */}
          <p className="mt-4 max-w-md font-poppins text-sm md:text-base leading-relaxed text-[#382910]/70">
            {t("description")}
          </p>

          {/* CTA */}
          <Button href="/check-status" className="mt-10">
            {t("cta")}
          </Button>
        </div>

        <div className="relative mx-auto aspect-[3/4] hidden md:block w-full max-w-sm">
        </div>
      </div>
    </section>
  );
}

function CalendarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M3 9h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 21s7-6.1 7-11.5A7 7 0 0 0 5 9.5C5 14.9 12 21 12 21Z"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <circle cx="12" cy="9.5" r="2.3" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function TrophyIllustration() {
  return (
    <svg viewBox="0 0 300 400" className="h-full w-full" aria-label="Golden falcon trophy">
      <defs>
        <linearGradient id="falconGold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F3D89A" />
          <stop offset="45%" stopColor="#C9A24B" />
          <stop offset="100%" stopColor="#8A6A34" />
        </linearGradient>
      </defs>
      <path
        d="M150 20c22 40 70 60 78 120 6 46-30 90-78 96-48-6-84-50-78-96 8-60 56-80 78-120Z"
        fill="url(#falconGold)"
      />
      <path
        d="M150 60c10 26 34 40 38 76 3 30-18 56-38 60-20-4-41-30-38-60 4-36 28-50 38-76Z"
        fill="#F4ECDC"
        opacity="0.25"
      />
      <rect x="118" y="236" width="64" height="18" rx="3" fill="url(#falconGold)" />
      <rect x="96" y="254" width="108" height="86" rx="6" fill="#1C1912" />
    </svg>
  );
}
