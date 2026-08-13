import { useTranslations } from "next-intl";

type RiskCard = {
  index: string;
  title: string;
  text: string;
};

export default function PolicyOverviewSection() {
  const t = useTranslations("policyPage");
  const cards = t.raw("riskCards") as RiskCard[];

  return (
    <section className="bg-[#FCF7EE] py-12 md:py-16">
      <div className="container">
        <div className="grid gap-6 md:grid-cols-[0.65fr_1fr] md:items-start md:gap-16">
          <p className="eyebrow !capitalize !TextSmall !font-medium text-[#382910]">
            <span className="font-poppins">{t("intro.eyebrow")}</span>
          </p>
          <p className="TextSmall !leading-snug !font-poppins !text-[#382910]">
            {t("intro.text")}
          </p>
        </div>

        <div className="mt-10 grid border-s border-t border-ink/20 md:mt-14 md:grid-cols-3">
          {cards.map((card) => (
            <article
              key={card.index}
              className="relative min-h-48 border-b border-e border-[#3829104D] p-4 md:min-h-56  md:p-6"
              style={{
                border: "1px solid rgba(56, 41, 16, 0.30)",
                background: "linear-gradient(117deg, #FDFCFA 0.63%, #F3E5CB 100%)",
              }}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-poppins border shrink-0 border-[#382910] rounded-full px-2 w-8 h-8 flex items-center justify-center text-xs tracking-[0.16em] text-[#382910]">
                  {card.index}
                </span>
                <p className="text-xs !leading-relaxed !font-poppins !text-[#382910]">
                  {t("intro.riskLabel")}
                </p>
              </div>
              <h2 className="max-w-[12rem] mt-10 font-display HeadingH3 !font-medium !text-ink">
                {card.title}
              </h2>
              <p className="mt-3 max-w-xs text-xs !leading-relaxed !font-poppins !text-[#382910]">
                {card.text}
              </p>
              <p className="TextSmall border-t border-[#3829104D] pt-4 mt-4 !leading-relaxed !font-poppins !text-[#382910]">
                <span className="font-poppins">{t("intro.reviewSection")}</span>
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
