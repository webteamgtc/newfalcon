import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

export default function TicketStepsSection() {
  const t = useTranslations("ticketPage.steps");
  const steps = t.raw("list") as { title: string; description: string }[];

  return (
    <section id="steps" className="bg-white py-10 md:py-12">
      <div className="container">
        <h2 className="max-w-lg font-display HeadingH1 !font-medium !text-ink md:ms-auto ">
          {t("headingPlain")}{" "}
          <span className="italic text-falcon-deep">{t("headingItalic")}</span>
        </h2>

        <div className="mt-10 grid grid-cols-1 border-s border-t border-[#434343]/25 md:mt-14 md:grid-cols-3">
          {steps.map((step, i) => (
            <article
              key={step.title}
              className="border-b border-e border-[#434343]/25 bg-[#F5F0E6] px-5 py-8 md:px-7 md:py-10"
            >
              <p className="font-poppins text-[11px] uppercase tracking-[0.16em] text-ink/45">
                {String(i + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-4 font-display HeadingH4 !font-medium !text-ink">
                {step.title}
              </h3>
              <p className="mt-3 TextSmall !leading-relaxed !font-poppins !text-ink/65">
                {step.description}
              </p>
            </article>
          ))}
        </div>

        <Link
          href="/agenda"
          className="mt-8 inline-flex font-poppins text-xs uppercase tracking-[0.16em] text-falcon-deep transition-colors hover:text-ink"
        >
          {t("contactCta")} →
        </Link>
      </div>
    </section>
  );
}
