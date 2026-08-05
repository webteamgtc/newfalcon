import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

export default function TicketStepsSection() {
  const t = useTranslations("ticketPage.steps");
  const steps = t.raw("list") as { title: string; description: string }[];

  return (
    <section id="steps" className="bg-white py-8 md:py-12">
      <div className="container">
        <div className="grid grid-cols-2 justify-between items-end">
          <p className="eyebrow !capitalize text-[#382910] ">
            <span className="font-poppins">Registration</span>
          </p>
          <h2 className="max-w-lg font-display HeadingH1 !font-medium !text-ink">
            {t("headingPlain")}{" "}
            <span className="italic text-falcon-deep">{t("headingItalic")}</span>
          </h2>
        </div>

        <div className="mt-6 grid grid-cols-1 border-s border-t border-[#382910]/30 md:mt-14 md:grid-cols-3">
          {steps.map((step, i) => (
            <article
              key={step.title}
              className="border-b border-e border-[#382910]/30 px-4 py-4 md:px-6 md:py-6"

              style={{
                background: "linear-gradient(180deg, #FFFCF7 0%, #F5E9D6 100%)",
              }}
            >
              <p className="font-poppins text-[11px] uppercase tracking-[0.16em] text-falcon-deep">
                {String(i + 1).padStart(2, "0")}
              </p>
              <h3 className=" md:mt-16 mt-10 font-display HeadingH4 !font-medium !text-ink">
                {step.title}
              </h3>
              <p className="mt-2 TextSmall !leading-relaxed !font-poppins !text-[#382910]">
                {step.description}
              </p>
            </article>
          ))}
        </div>

        {/* <Link
          href="/agenda"
          className="mt-8 inline-flex font-poppins text-xs uppercase tracking-[0.16em] text-falcon-deep transition-colors hover:text-ink"
        >
          {t("contactCta")} →
        </Link> */}
      </div>
    </section>
  );
}
