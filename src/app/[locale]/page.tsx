import Hero from "@/components/home/Hero";
import HistorySection from "@/components/home/HistorySection";
import TicketCtaSection from "@/components/home/TicketCtaSection";
import MediaPartnersSection from "@/components/home/MediaPartnersSection";
import FaqSection from "@/components/home/FaqSection";
import DubaiTravelHeroSection from "@/components/travel/DubaiTravelHeroSection";
import DubaiRouteMapSection from "@/components/travel/DubaiRouteMapSection";
import DubaiAttractionsSection from "@/components/attractions/DubaiAttractionsSection";
import MobileInvitationSection from "@/components/invitation/MobileInvitationSection";
import UberTravelSection from "@/components/travel/UberTravelSection";
import UberDownloadSection from "@/components/travel/UberDownloadSection";

export default function HomePage() {
  return (
    <>
      <Hero />
      <HistorySection />
      <DubaiTravelHeroSection />
      <DubaiRouteMapSection />
      <DubaiAttractionsSection />

      <MobileInvitationSection />
    
      <UberTravelSection />
      <UberDownloadSection />
      <FaqSection />
      <TicketCtaSection />
      <MediaPartnersSection />
      
    </>
  );
}
