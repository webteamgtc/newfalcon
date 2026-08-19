import { useTranslations } from "next-intl";
import Image from "next/image";
import Button from "@/components/Button";

export default function GuestJoinSection() {
  const t = useTranslations("guestPage.join");

  return (
    <section className="bg-white py-8 md:py-16">
      <div className="container grid gap-4 md:grid-cols-2 md:items-center md:gap-8">
        <div className="order-2 md:order-1 relative aspect-[16/10] overflow-hidden">
          <Image
            src="/images/dubai-crop.png"
            alt=""
            fill
            className="object-cover object-center"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>

        <div className="order-1 md:order-2">
          <p className="eyebrow !capitalize text-[#382910]">
            <span className="font-poppins">{t("eyebrow")}</span>
          </p>
          <h2 className="mt-3 max-w-xs font-display HeadingH1 !font-medium !text-ink">
            {t("headingPlain")}{" "}
            <span className="italic text-falcon-deep">{t("headingItalic")}</span>
          </h2>
          <div className="hidden md:block">
            <Button href="/check-status" className="mt-8">
              {t("cta")}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
