import { getTranslations } from "next-intl/server";
import CheckStatus from "@/components/check-status/CheckStatus";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const t = await getTranslations({ locale, namespace: "checkStatusPage" });
  return {
    title: t("heroEyebrow"),
  };
}

export default function CheckStatusPage() {
  return <CheckStatus />;
}
