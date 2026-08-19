import { useTranslations } from "next-intl";
import Image from "next/image";
import Button from "@/components/Button";

export default function FooterCtaSection() {
  const t = useTranslations("home.footerCta");

  return (
    <section className="relative isolate overflow-hidden py-24">
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
        <Image
          src="/images/footer-bg.webp"
          alt=""
          fill
          priority
          className="h-full w-full object-cover object-center"
          sizes="100vw"
        />
      </div>
      <span
        aria-hidden
        className="pointer-events-none absolute -end-10 top-1/2 -translate-y-1/2 font-display text-[10rem] text-ink/5 md:text-[16rem]"
      >
        GTC
      </span>
      <div className="relative z-10 container text-center">
        <p className="eyebrow text-falcon-deep">{t("eyebrow")}</p>
        <h2 className="mt-6 font-display text-3xl leading-snug text-ink md:text-5xl">
          {t("headingPlain")} <span className="italic text-falcon-deep">{t("headingItalic")}</span>
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-sm text-ink/65">{t("subtext")}</p>
        <Button href="/check-status" className="mt-8">
          {t("cta")}
        </Button>
      </div>
    </section>
  );
}
