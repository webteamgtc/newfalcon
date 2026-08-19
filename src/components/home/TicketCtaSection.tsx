import { useTranslations } from "next-intl";
import Button from "@/components/Button";
import Image from "next/image";

export default function TicketCtaSection() {
  const t = useTranslations("home.ticketCta");

  return (
    <section className="relative isolate flex min-h-[500px] items-center overflow-hidden py-8 md:min-h-[650px] md:py-20">
      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
        <Image
          src="/images/dubai-crop.png"
          alt=""
          fill
          className="object-cover object-right-top"
          sizes="100vw"
        />
      </div>

      <span
        aria-hidden
        className="pointer-events-none absolute md:end-20 end-10 md:top-20 top-10 font-display text-3xl text-white"
      >
        {t("dateRange")}
      </span>

      <div className="relative z-10 container">
        <div className="max-w-xl">
          <p className="eyebrow text-falcon-light !capitalize">
            <span className="font-poppins">{t("eyebrow")}</span>
          </p>
          <h2 className="mt-6 font-display max-w-sm HeadingH1 !font-medium !text-white">
            {t("headingPlain")} <span className="italic text-falcon-light">{t("headingItalic")}</span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl Text !leading-snug !font-poppins !text-white">
            {t("description")}
          </p>
          <Button href="/check-status" variant="light" className="mt-9">
            {t("cta")}
          </Button>
        </div>
      </div>
    </section>
  );
}
