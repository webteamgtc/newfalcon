import CheckStatusHero from "@/components/check-status/CheckStatusHero";
import CheckStatusJourneySection from "@/components/check-status/CheckStatusJourneySection";
import CheckStatusQualificationSection from "@/components/check-status/CheckStatusQualificationSection";

export default function CheckStatus() {
  return (
    <div className="check-status-page-bg">
      <CheckStatusHero />
      <CheckStatusJourneySection />
      <CheckStatusQualificationSection />
    </div>
  );
}
