"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, type AppLocale } from "@/i18n/routing";

const FAQ_CHECK_STATUS_LINK_PHRASES: Record<AppLocale, string> = {
  en: "our Tickets page",
  zh: "在线注册",
  ar: "صفحة التذاكر",
};

const linkClassName =
  "font-medium text-falcon-deep underline decoration-falcon-deep/40 underline-offset-2 transition-colors hover:text-falcon-deep/80";

function renderFaqAnswer(answer: string, locale: AppLocale) {
  const linkPhrase = FAQ_CHECK_STATUS_LINK_PHRASES[locale];
  if (!answer.includes(linkPhrase)) {
    return answer;
  }

  const [before, after] = answer.split(linkPhrase);

  return (
    <>
      {before}
      <Link href="/check-status" className={linkClassName}>
        {linkPhrase}
      </Link>
      {after}
    </>
  );
}

export default function FaqSection() {
  const locale = useLocale() as AppLocale;
  const t = useTranslations("home.faq");
  const faqs = t.raw("list") as { question: string; answer: string }[];
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="bg-white md:py-16 py-8">
      <div className="container grid md:gap-12 gap-4 items-center md:grid-cols-[0.8fr_1.2fr]">
        <div className="max-w-md md:max-w-sm">
          <h2 className="font-display HeadingH1 !font-medium !text-ink">{t("heading")}</h2>
          <p className="mt-3 Text !leading-snug !font-poppins !text-ink">{t("subtext")}</p>
          {/* <Button className="mt-6 md:mt-8" href="/faq">{t("cta")}</Button> */}
        </div>

        <div className="divide-y divide-[#434343]/30">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div key={faq.question}>
                <button
                  className="flex w-full font-poppins items-center justify-between gap-4 pt-5 pb-2 text-start"
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  aria-expanded={isOpen}
                >
                  <span className=" text-base text-ink Text !leading-snug !font-medium">
                    {faq.question}
                  </span>
                  <span
                    className={`shrink-0 text-falcon-deep transition-transform ${
                      isOpen ? "rotate-45" : ""
                    }`}
                  >
                    +
                  </span>
                </button>
                {isOpen && (
                  <p className="pb-5 TextSmall !leading-snug !font-poppins !text-ink">
                    {renderFaqAnswer(faq.answer, locale)}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
