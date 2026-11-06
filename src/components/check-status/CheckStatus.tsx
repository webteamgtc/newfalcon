import CheckStatusHero from "@/components/check-status/CheckStatusHero";
import CheckStatusJourneySection from "@/components/check-status/CheckStatusJourneySection";
import CheckStatusRouteMapSection from "@/components/check-status/CheckStatusRouteMapSection";
import RegistrationClosedPanel from "@/components/registration/RegistrationClosedPanel";
import FaqSection from "@/components/home/FaqSection";
import DubaiAttractionsSection from "@/components/attractions/DubaiAttractionsSection";
import MobileInvitationSection from "@/components/invitation/MobileInvitationSection";
import UberTravelSection from "@/components/travel/UberTravelSection";
import UberDownloadSection from "@/components/travel/UberDownloadSection";
import { REGISTRATION_OPEN } from "@/lib/registrationGate";

export default function CheckStatus() {
  if (!REGISTRATION_OPEN) {
    return (
      <div className="check-status-page-bg min-h-[70vh]">
        <div className="container pb-24 pt-32 md:pt-40">
          <RegistrationClosedPanel variant="page" />
        </div>
      </div>
    );
  }

  return (
    <div className="check-status-page-bg">
      <CheckStatusHero />
      <CheckStatusJourneySection />
      <CheckStatusRouteMapSection />
      <DubaiAttractionsSection />

      <MobileInvitationSection />
    
      <UberTravelSection />
      <UberDownloadSection />
      <FaqSection />
    </div>
  );
}