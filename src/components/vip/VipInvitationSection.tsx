import { useTranslations } from "next-intl";
import Image from "next/image";

type Benefit = {
  index: string;
  title: string;
  text: string;
};

export default function VipInvitationSection() {
  const t = useTranslations("vipPage");
  const benefits = t.raw("benefits") as Benefit[];

  return (
    <section className="relative min-h-[700px] md:min-h-[800px] flex items-center justify-center overflow-hidden py-10 md:py-16">
      <Image
        src="/images/vip-bg-dubai.webp"
        alt=""
        fill
        className="-z-20 object-cover object-top"
        sizes="100vw"
      />
      {/* <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#F6E8CC]/95 via-[#EACF9A]/80 to-[#D5A75C]/55" /> */}

      <div className="container">
        <div className="w-full">
          <h2 className="mt-3 w-full font-display HeadingH1 !font-medium !text-[#382910] md:whitespace-nowrap">
            {t("invitationHeadingPlain")}{" "}
            <span className="italic text-falcon-deep">
              {t("invitationHeadingItalic")}
            </span>
          </h2>
          <p className="mt-6 w-full Text !leading-snug !font-poppins !text-[#382910] md:whitespace-nowrap">
            {t("invitationSubtext")}
          </p>
        </div>

        <div className="mt-6 md:mt-12 grid border-s border-t sm:grid-cols-2 lg:grid-cols-4"
          style={{
            border: "1px solid rgba(56, 41, 16, 0.30)",
            background: "linear-gradient(180deg, rgb(255, 252, 247) 0%, rgb(245 233 202 / 81%) 100%)",
          }}
        >
          {benefits.map((benefit) => (
            <article
              key={benefit.index}
              className="min-h-44 border-b border-e border-[#382910]/30 px-5 py-6 md:min-h-52 md:px-7 md:py-8"
            >
              <span className="font-poppins text-[10px] tracking-[0.14em] text-[#382910]">
                {benefit.index}
              </span>
              <h3 className="mt-10 font-display HeadingH5 !font-medium !text-[#382910]">
                {benefit.title}
              </h3>
              <p className="mt-3 TextSmall !leading-relaxed !font-poppins !text-[#382910]">
                {benefit.text}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
