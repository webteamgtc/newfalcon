import { useTranslations } from "next-intl";
import Image from "next/image";

type PolicySection = {
  title: string;
  body: string;
};

export default function PolicyDocumentSection() {
  const t = useTranslations("policyPage");
  const sections = t.raw("sections") as PolicySection[];
  const labels = t.raw("document.labels") as string[];
  const clauses = t.raw("document.clauses") as string[];

  return (
    <section className="relative overflow-hidden py-12 md:py-16">
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <Image
          src="/images/bg-policy.webp"
          alt=""
          fill
          priority
          className="object-cover object-top"
          sizes="100vw"
        />
      </div>

      <div className="container relative">
        <article className="mx-auto max-w-6xl px-6 py-6 sm:px-6 md:px-8 md:py-8"
          style={{
            border: "1px solid rgba(56, 41, 16, 0.30)",
            background: "rgba(255, 253, 248, 0.85)",
            boxShadow: "-1px 3px 19.3px 5px rgba(56, 41, 16, 0.16)",
          }}
        >
          <div className="grid gap-6 border-b border-[#C79E5E4D] pb-6 md:grid-cols-[0.5fr_1fr] md:gap-6">
            <div>
              <p className="eyebrow !capitalize !TextSmall !font-medium text-[#382910]">
                <span className="font-poppins">{t("document.eyebrow")}</span>
              </p>
              {/* <p className="mt-3 !TextSmall !font-medium text-[#382910]">
                {t("document.updated")}
              </p> */}
            </div>
            <h2 className="max-w-lg font-display HeadingH1 !font-medium !text-ink">
              {t("document.headingPlain")}{" "}
              <span className="italic text-falcon-deep">
                {t("document.headingItalic")}
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-[0.5fr_1fr] md:gap-6">
            <nav className="hidden border-e border-[#C79E5E4D] py-6 md:py-8 pe-7 md:block">
              <ol className="sticky top-8 space-y-4">
                {sections.map((section, index) => (
                  <li key={section.title}>
                    <a
                      href={`#policy-${index + 1}`}
                      className="grid grid-cols-[1.5rem_1fr] border-b border-[#C79E5E4D] pb-4 gap-2 font-poppins text-xs uppercase tracking-[0.1em] text-[#382910] transition-colors hover:text-falcon-deep"
                    >
                      <span>{String(index + 1).padStart(2, "0")}</span>
                      <span>{section.title}</span>
                    </a>
                  </li>
                ))}
              </ol>
            </nav>

            <div>
              {sections.map((section, sectionIndex) => (
                <section
                  key={section.title}
                  id={`policy-${sectionIndex + 1}`}
                  className="scroll-mt-8 border-b border-[#3829104D] py-6 last:border-b-0 md:py-8"
                >
                  <div className="flex items-start gap-5">
                    <span className="mt-3 shrink-0 font-poppins text-[10px] tracking-[0.15em] text-falcon-deep">
                      {String(sectionIndex + 1).padStart(2, "0")}
                    </span>
                    <div className="min-w-0">
                      <h3 className="font-display HeadingH3 !font-medium !text-ink">
                        {section.title}
                      </h3>
                      <p className="mt-4 TextSmall !leading-relaxed !font-poppins !text-ink">
                        {section.body}
                      </p>

                      <dl className="mt-7 space-y-3">
                        {labels.map((label, labelIndex) => (
                          <div
                            key={label}
                            className="grid gap-1 border-t border-[#3829104D] pt-3 sm:grid-cols-[12rem_1fr] sm:gap-5"
                          >
                            <dt className=" text-xs uppercase font-medium tracking-[0.13em] text-[#17130F]">
                              {label}
                            </dt>
                            <dd className="text-xs !font-poppins !text-[#17130F]">
                              {clauses[(sectionIndex + labelIndex) % clauses.length]}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  </div>
                </section>
              ))}
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
