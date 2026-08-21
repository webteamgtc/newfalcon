import { useTranslations } from "next-intl";

export default function PolicyHero() {
  const t = useTranslations("policyPage.hero");

  return (
    <section className="relative flex min-h-[50vh] items-end overflow-hidden bg-[url('/33.webp')] bg-cover bg-center pb-16 pt-16 md:min-h-[80vh] md:bg-[url('/44.webp')] md:bg-cover md:bg-center md:pb-36 md:pt-24">
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/40 to-black/10"
        aria-hidden
      />
      <div className="container relative z-[1]">
        <div className="max-w-2xl">
          <p className="eyebrow !capitalize text-white/80">
            <span className="font-poppins">{t("eyebrow")}</span>
          </p>
          <h1 className="mt-6 max-w-sm font-display text-[3.2rem] uppercase leading-[1.05] text-white md:text-[3rem]">
            {t("headingPlain")}
            <br />
            <span className="italic text-falcon-light">{t("headingItalic")}</span>
          </h1>
          <p className="mt-5 max-w-lg Text !font-poppins !leading-snug !text-white">
            {t("subtext")}
          </p>
        </div>
      </div>
    </section>
  );
}
