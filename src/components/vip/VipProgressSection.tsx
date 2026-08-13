import { useTranslations } from "next-intl";

type Stage = {
  number: string;
  name: string;
  tier: string;
};

export default function VipProgressSection() {
  const t = useTranslations("vipPage");
  const stages = t.raw("stages") as Stage[];

  return (
    <section id="progress" className="scroll-mt-4 bg-[#FFFDF8] py-12 md:py-16">
      <div className="container">
        <div className="grid gap-6 md:grid-cols-[1fr_0.8fr] md:items-end md:gap-14">
          <div>
            <p className="eyebrow !capitalize text-[#382910]">
              <span className="font-poppins">{t("journeyEyebrow")}</span>
            </p>
            <h2 className="mt-4 font-display HeadingH1 !font-medium !text-ink">
              {t("journeyHeadingPlain")}
              <br />
              <span className="italic text-falcon-deep">
                {t("journeyHeadingItalic")}
              </span>
            </h2>
          </div>
          <p className="TextSmall !leading-snug !font-poppins !text-[#382910]">
            {t("journeySubtext")}
          </p>
        </div>

        <div className="mt-8 grid border-s border-t border-ink/20 md:mt-14 md:grid-cols-3">
          {stages.map((stage, index) => (
            <article
              key={stage.number}
              className={`border-b border-e border-[#3829104D] px-5 py-5 md:px-7`}

              style={index === 0 ? {
                background: "linear-gradient(117deg, #E8CB8F 0.63%, #FEF3DA 100%)",
              } : {
                background: "#F8F0E4",
              }
              }>
              <div className="flex items-center  gap-4">
                <span className="font-poppins w-8 h-8 flex items-center justify-center rounded-full border border-[#382910] text-xs tracking-[0.14em] text-ink">
                  {stage.number}
                </span>

                <div>
                  <p className="text-xs mb-1 !font-poppins !text-ink">{stage.tier}</p>
                  <h3 className="font-display HeadingH5 !font-medium !text-ink">
                    {stage.name}
                  </h3>
                </div>
              </div>

            </article>
          ))}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <ProgressCard
            label={t("capitalLabel")}
            title={t("capitalTitle")}
            current={t("currently")}
            target={t("capitalTarget")}
            targetLabel={t("targetLabel")}
            remaining={t("capitalRemaining")}
            targetText={t("targetValue")}
            percentText={t("progressPercent")}
          />
          <ProgressCard
            label={t("activityLabel")}
            title={t("activityTitle")}
            current={t("currently")}
            target={t("activityTarget")}
            targetLabel={t("targetLabel")}
            remaining={t("activityRemaining")}
            targetText={t("targetValue")}
            percentText={t("progressPercent")}
          />
        </div>

        <div className="mx-auto mt-6 md:mt-12 flex md:flex-row flex-col max-w-xl items-center justify-between gap-6 px-7 py-5"
          style={{
            borderRadius: "64px",
            border: "1px solid rgba(56, 41, 16, 0.30)",
            background: "#FBF6ED",
          }}
        >
          <div className=" flex justify-between items-center gap-4">
            <div>
              <p className="font-poppins text-xs uppercase tracking-[0.13em] text-[#382910]">
                {t("summaryLabel")}
              </p>
              <p className="font-poppins mt-1 text-xs uppercase tracking-[0.13em] text-[#382910]">
                {t("progressSubtext")}
              </p>
            </div>
            <p className="font-display HeadingH3 !font-medium !text-falcon-deep">{t("summaryValue")}</p>
          </div>
          <span className="md:h-8 h-px w-px hidden md:block bg-ink/15" />
          <div className=" flex justify-between items-center gap-4">
            <div>
              <p className="font-poppins text-xs uppercase tracking-[0.13em] text-[#382910]">
                {t("daysLabel")}
              </p>
              <p className="font-poppins mt-1 text-xs uppercase tracking-[0.13em] text-[#382910]">
                {t("progressSubtext")}
              </p>
            </div>
            <p className="font-display HeadingH3 !font-medium !text-falcon-deep">{t("daysValue")}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProgressCard({
  label,
  title,
  current,
  target,
  targetLabel,
  remaining,
  targetText,
  percentText
}: {
  label: string;
  title: string;
  current: string;
  target: string;
  targetLabel: string;
  remaining: string;
  targetText: string;
  percentText: string;
}) {
  return (
    <article className=" p-4 md:p-6"
      style={{
        border: "1px solid rgba(56, 41, 16, 0.30)",
        background: "linear-gradient(117deg, #FDFCFA 0.63%, #F3E5CB 100%)",
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="font-poppins text-xs uppercase tracking-[0.14em] text-[#382910]">
          {label}
        </p>
        <p className="font-poppins text-xs uppercase tracking-[0.14em] text-[#382910]">
          {targetText}
        </p>
      </div>
      <div className="mt-8 flex items-end justify-between gap-5">
        <div>
          <h3 className="font-display HeadingH4 !font-medium !text-ink">{title}</h3>
          <p className="mt-4 font-display text-2xl text-ink">{current}</p>
        </div>
        <div className="text-end">

          <p className="mt-1 font-poppins text-sm font-medium text-ink">{target}</p>
        </div>
      </div>
      <div className="mt-6 h-2.5 overflow-hidden rounded-full bg-[#D8C8AE]">
        <div className="h-full w-[2%] rounded-full bg-falcon-gold" />
      </div>
      <p className="mt-3 HeadingH4 border-b border-[#D8C8AE] pb-2 !text-[#AD7833]">{percentText}</p>
      <p className="mt-3 TextSmall !font-poppins !text-[#382910]">{remaining}</p>
    </article>
  );
}
