import { getTranslations } from "next-intl/server";
import UserStatusDashboard from "@/components/user-status/UserStatusDashboard";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const t = await getTranslations({ locale, namespace: "userStatusPage" });
  return {
    title: t("metaTitle"),
  };
}

export default function UserStatusPage() {
  return <UserStatusDashboard />;
}
