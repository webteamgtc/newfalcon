import { getTranslations } from "next-intl/server";
import ThankYouPage from "@/components/thank-you/ThankYouPage";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const t = await getTranslations({ locale, namespace: "thankYouPage" });
  return {
    title: t("metaTitle"),
  };
}

export default function ThankYouRoutePage() {
  return <ThankYouPage />;
}
