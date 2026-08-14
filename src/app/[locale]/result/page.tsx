import { getTranslations } from "next-intl/server";
import VipHero from "@/components/vip/VipHero";
import VipProgressSection from "@/components/vip/VipProgressSection";
import VipInvitationSection from "@/components/vip/VipInvitationSection";
import VipEligibilitySection from "@/components/vip/VipEligibilitySection";
import VipStatusGuard from "@/components/vip/VipStatusGuard";

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
      <VipInvitationSection />
      <VipEligibilitySection />
    </VipStatusGuard>
  );
}
