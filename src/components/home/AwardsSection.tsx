import { useTranslations } from "next-intl";
import Image from "next/image";
import Button from "@/components/Button";

export default function AwardsSection() {
  const t = useTranslations("home.awards");
  const awards = t.raw("list") as { index: string; title: string; country: string }[];

  return (
    <section className="bg-parchment-dark py-24">
      <div className="container grid gap-12 md:grid-cols-[0.9fr_1fr] md:items-start">
        <div className="relative mx-auto aspect-square w-full max-w-sm overflow-hidden rounded-2xl">
        <Image
          src="/images/traphy-short.webp"
          alt=""
          fill
          priority
          className="h-full w-full object-cover object-center"
          sizes="100vw"
        />
        </div>

        <div>
          <p className="eyebrow text-falcon-deep">{t("eyebrow")}</p>
          <h2 className="mt-6 font-display text-3xl leading-snug text-ink md:text-4xl">
            {t("headingPlain")} <span className="italic text-falcon-deep">{t("headingItalic")}</span>
          </h2>
          <p className="mt-4 text-sm text-ink/65">{t("subtext")}</p>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {awards.map((award) => (
              <div
                key={award.index}
                className="rounded-lg border border-ink/10 bg-parchment-light p-4 text-center"
              >
                <p className="text-[10px] text-ink/40">{award.index}</p>
                <LaurelIcon />
                <p className="mt-2 text-xs font-medium leading-snug text-ink">{award.title}</p>
                <p className="mt-1 text-[11px] text-ink/50">{award.country}</p>
              </div>
            ))}
          </div>

          <Button href="/awards" className="mt-8">
            {t("cta")}
          </Button>
        </div>
      </div>
    </section>
  );
}

function LaurelIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      className="mx-auto mt-2 text-falcon-deep"
      aria-hidden="true"
    >
      <path
        d="M12 3c1 4 1 14 0 18M6 6c2 2 3 4 3 8M18 6c-2 2-3 4-3 8M4 10c2 1 3 3 4 6M20 10c-2 1-3 3-4 6"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}
