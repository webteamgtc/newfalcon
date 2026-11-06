import { useTranslations } from "next-intl";
import PageHero from "@/components/PageHero";
import { REGISTRATION_OPEN } from "@/lib/registrationGate";

export default function GuestHero() {
  const t = useTranslations("guestPage.hero");
  const tClosed = useTranslations("registrationClosed");

  return (
    <PageHero
      imageSrc="/images/guest-banner.webp"
      eyebrow={t("eyebrow")}
      headingPlain={t("headingPlain")}
      headingItalic={t("headingItalic")}
      subtext={t("subtext")}
      primaryCta={{
        label: REGISTRATION_OPEN ? t("cta") : tClosed("ctaHome"),
        href: REGISTRATION_OPEN ? "/check-status" : "/",
      }}
    />
  );
}
