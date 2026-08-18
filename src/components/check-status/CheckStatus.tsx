import CheckStatusHero from "@/components/check-status/CheckStatusHero";
import { useTranslations } from "next-intl";

export default function CheckStatus() {
  const t = useTranslations("checkStatusPage");

  return (
    <div className="check-status-page-bg">
      <CheckStatusHero />


    </div>
  );
}
