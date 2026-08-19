import { useTranslations } from "next-intl";
import PageHero from "@/components/PageHero";

export default function TicketHero() {
  const t = useTranslations("ticketPage.hero");

  return (
    <PageHero
      imageSrc="/images/Ticket/banner.webp"
      headingPlain={t("headingPlain")}
      headingItalic={t("headingItalic")}
      subtext={t("subtext")}
      primaryCta={{ label: t("primaryCta"), href: "#access" }}
      secondaryCta={{ label: t("secondaryCta"), href: "/check-status" }}
    />
  );
}
