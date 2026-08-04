import { useTranslations } from "next-intl";
import Button from "@/components/Button";
import Image from "next/image";

export default function TicketCtaSection() {
  const t = useTranslations("home.ticketCta");

  return (
    <section className="relative overflow-hidden min-h-[600px] flex items-center justify-center py-20"
    >
      <div className="pointer-events-none absolute inset-0 -z-10 h-full overflow-hidden" aria-hidden>
        <Image
          src="/images/dubai-crop.png"
          alt=""
          fill
          priority
          className="h-full w-full object-cover object-center"
          sizes="100vw"
        />
      </div>
      <span
        aria-hidden
        className="pointer-events-none absolute end-20 top-20 font-display text-3xl text-white"
      >
        {t("dateRange")}
      </span>

      <div className="relative container">
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
          <Button href="/ticket" variant="light" className="mt-9">
            VIEW ALL GUESTS
          </Button>
        </div>
      </div>
    </section>
  );
}
