import { useTranslations } from "next-intl";

export default function PolicyHero() {
  const t = useTranslations("policyPage.hero");

  return (
    <section className="relative flex min-h-[52vh] items-center overflow-hidden py-12 md:min-h-[72vh] md:py-16"
      style={{
        background: "linear-gradient(146deg, #FEFCF6 22.19%, #FCF9F2 38.96%, #EAD9B9 63.19%, #D8BA80 86.31%)",
      }}
    >
      <div className="container relative">
        <div className="max-w-xl">
          <p className="eyebrow !capitalize text-ink">
            <span className="font-poppins">{t("eyebrow")}</span>
          </p>
          <h1 className="mt-6 font-display HeadingH1 !font-medium !text-ink">
            {t("headingPlain")}
            <br />
            <span className="italic text-falcon-deep">{t("headingItalic")}</span>
          </h1>
          <p className="mt-5 max-w-xl Text !leading-snug !font-poppins !text-ink">
            {t("subtext")}
          </p>
        </div>
      </div>
    </section>
  );
}
