import { getTranslations } from "next-intl/server";
import VipHero from "@/components/vip/VipHero";
import VipProgressSection from "@/components/vip/VipProgressSection";
import VipInvitationSection from "@/components/vip/VipInvitationSection";
import VipStatusGuard from "@/components/vip/VipStatusGuard";
import DubaiTravelHeroSection from "@/components/travel/DubaiTravelHeroSection";
import DubaiRouteMapSection from "@/components/travel/DubaiRouteMapSection";
import DubaiAttractionsSection from "@/components/attractions/DubaiAttractionsSection";
import MobileInvitationSection from "@/components/invitation/MobileInvitationSection";
import UberTravelSection from "@/components/travel/UberTravelSection";
import UberDownloadSection from "@/components/travel/UberDownloadSection";

export async function generateMetadata({
  params: { locale }
}: {
  params: { locale: string };
}) {
  const t = await getTranslations({ locale, namespace: "vipPage" });
  return {
    title: t("heroEyebrow")
  };
}

export default function VipStatusPage() {
  return (
    <VipStatusGuard>
      <VipHero />
      <VipProgressSection />
      <DubaiTravelHeroSection />
      <DubaiRouteMapSection />
      <DubaiAttractionsSection />
      <MobileInvitationSection />
      <UberTravelSection />
      <UberDownloadSection />
      <VipInvitationSection />
    </VipStatusGuard>
  );
}
