import { useTranslations } from "next-intl";
import Image from "next/image";

export default function VipEligibilitySection() {
  const t = useTranslations("vipPage");

  return (
    <section className="relative overflow-hidden py-10 md:py-24">
      <Image
        src="/images/vip-status-last-bg.webp"
        alt=""
        fill
        className="-z-20 object-cover object-bottom"
        sizes="100vw"
      />

      <div className="container grid gap-12 md:grid-cols-[1fr_0.75fr] md:items-center md:gap-16">
        <div>
          <p className="eyebrow uppercase text-[#382910] !text-xs">
            <span className="font-poppins">Move closer to VIP</span>
          </p>
          <h2 className="mt-5 md:max-w-xs font-display HeadingH1 !font-medium !text-[#382910]">
            {t("eligibleHeadingPlain")}{" "}
            <span className="italic text-falcon-deep">
              {t("eligibleHeadingItalic")}
            </span>
          </h2>
          <p className="mt-5 max-w-lg Text !leading-snug !font-poppins !text-[#382910]">
            Increase eligible deposit or trading activity to move toward qualification. Final eligibility remains subject to the confirmed campaign terms.
          </p>
        </div>

        <article className=" p-6 md:p-8"
          style={{
            border: "1px solid rgba(56, 41, 16, 0.00)",
            background: "#FBF5EA",
            boxShadow: "2px 2px 10px 0 rgba(60, 37, 0, 0.35)",
          }}
        >
          <div className="flex items-start justify-between gap-6 border-b border-[#382910]/30 pb-8">
            <div>
              <p className="font-poppins text-[10px] uppercase tracking-[0.14em] text-[#382910]">
                {t("memberLabel")}
              </p>
              <h3 className="mt-8 font-display HeadingH3 !font-medium !text-[#382910]">
                {t("memberName")}
              </h3>
              <p className="mt-4 TextSmall !font-poppins !text-[#382910]">
                {t("memberTier")}
              </p>
            </div>
            {/* <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-falcon-deep/30 font-display text-lg italic text-falcon-deep">
              VIP
            </span> */}
          </div>
          <div className="flex items-center justify-between gap-5 pt-5">
            <span className="font-poppins text-[10px] uppercase tracking-[0.14em] text-[#382910]">
            CONTACT NOW
            </span>
            <span className="font-poppins text-xs font-medium tracking-[0.1em] text-[#382910]">
              {t("memberId")}
            </span>
          </div>
        </article>
      </div>
    </section>
  );
}
