import CheckStatusBeyondInvitationSection from "@/components/check-status/CheckStatusBeyondInvitationSection";
import CheckStatusHero from "@/components/check-status/CheckStatusHero";
import CheckStatusJourneySection from "@/components/check-status/CheckStatusJourneySection";
import CheckStatusQualificationSection from "@/components/check-status/CheckStatusQualificationSection";
import CheckStatusRouteMapSection from "@/components/check-status/CheckStatusRouteMapSection";

import FaqSection from "@/components/home/FaqSection";
import DubaiAttractionsSection from "@/components/attractions/DubaiAttractionsSection";
import MobileInvitationSection from "@/components/invitation/MobileInvitationSection";
import UberTravelSection from "@/components/travel/UberTravelSection";
import UberDownloadSection from "@/components/travel/UberDownloadSection";
export default function CheckStatus() {
  return (
    <div className="check-status-page-bg">
      <CheckStatusHero />
      <CheckStatusJourneySection />
      <CheckStatusQualificationSection />
      <CheckStatusBeyondInvitationSection />
      <CheckStatusRouteMapSection />
      <DubaiAttractionsSection />

      <MobileInvitationSection />
    
      <UberTravelSection />
      <UberDownloadSection />
      <FaqSection />
    </div>
  );
}