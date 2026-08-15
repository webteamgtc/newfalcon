import { useTranslations } from "next-intl";

export default function CheckStatusHero() {
  const t = useTranslations("checkStatusPage");

  return (
    <section className="relative flex min-h-[68vh] items-center overflow-hidden bg-gradient-to-br from-[#FEFCF6] via-[#EAD9B9] to-[#D8BA80] pb-16 pt-36 md:min-h-[78vh] md:pb-24 md:pt-44">
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        aria-hidden
        style={{
          background:
            "radial-gradient(circle at 82% 14%, rgba(255,255,255,.66), transparent 30%), radial-gradient(circle at 75% 100%, rgba(181,137,69,.32), transparent 42%)",
        }}
      />
      <div className="container relative">
        <div className="max-w-2xl">
          <p className="eyebrow !capitalize text-ink/65">
            <span className="font-poppins">
              {t("heroEyebrow")}
              <span className="mx-2">·</span>
              {t("heroYear")}
            </span>
          </p>
          <h1 className="mt-5 font-display HeadingH1 !font-medium !text-ink">
            {t("heroHeadingPlain")}
            <br />
            <span className="italic text-falcon-deep">{t("heroHeadingItalic")}</span>
          </h1>
          <p className="mt-5 max-w-md Text !leading-snug !font-poppins !text-ink/70">
            {t("heroSubtext")}
          </p>
          <a
            href="#access-form"
            className="mt-8 inline-flex items-center gap-4 rounded-full bg-ink py-1.5 ps-6 pe-3 font-poppins text-sm uppercase tracking-[0.14em] text-white transition-colors hover:bg-falcon-deep"
          >
            <span>{t("heroCta")}</span>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-ink">
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M7 2v10M7 12l-3.5-3.5M7 12l3.5-3.5"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
