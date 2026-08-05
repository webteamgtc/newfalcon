import { getTranslations } from "next-intl/server";
import VipHero from "@/components/vip/VipHero";


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
    <>
      <VipHero />
   
    </>
  );
}
