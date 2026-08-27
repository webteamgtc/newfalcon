import { useTranslations } from "next-intl";
import Button from "@/components/Button";

export default function TicketCtaSection() {
  const t = useTranslations("home.ticketCta");

  return (
    <section className="relative isolate flex min-h-[500px] items-center overflow-hidden bg-[url('/banner-17.webp')] bg-cover bg-center py-8 md:min-h-[650px] md:py-20">
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/65 via-black/45 to-black/25"
        aria-hidden
      />

      <div className="relative z-10 container">
        <div className="max-w-xl">
          <p className="eyebrow text-falcon-light !capitalize">
            <span className="font-poppins">{t("eyebrow")}</span>
          </p>
          <h2 className="mt-6 font-display max-w-sm HeadingH2 !font-medium !text-white">
            {t("headingPlain")}
            {t("headingItalic") ? (
              <>
                {" "}
                <span className="italic text-falcon-light">{t("headingItalic")}</span>
              </>
            ) : null}
          </h2>
          <p className="mx-auto mt-5 max-w-2xl whitespace-pre-line Text !leading-snug !font-poppins !text-white">
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
