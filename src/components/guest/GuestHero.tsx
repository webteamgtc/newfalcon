import { useTranslations } from "next-intl";
import PageHero from "@/components/PageHero";

export default function GuestHero() {
  const t = useTranslations("guestPage.hero");

  return (
    <PageHero
      imageSrc="/images/guest-banner.webp"
      eyebrow={t("eyebrow")}
      headingPlain={t("headingPlain")}
      headingItalic={t("headingItalic")}
      subtext={t("subtext")}
      primaryCta={{ label: t("cta"), href: "/check-status" }}
    />
  );
}
