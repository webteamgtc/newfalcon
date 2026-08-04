import Hero from "@/components/home/Hero";
import HistorySection from "@/components/home/HistorySection";
import GuestsSection from "@/components/home/GuestsSection";
import TicketCtaSection from "@/components/home/TicketCtaSection";
import AwardsSection from "@/components/home/AwardsSection";
import MediaPartnersSection from "@/components/home/MediaPartnersSection";
import FaqSection from "@/components/home/FaqSection";
import FooterCtaSection from "@/components/home/FooterCtaSection";

export default function HomePage() {
  return (
    <>
      <Hero />
      <HistorySection />
      <GuestsSection />
      <TicketCtaSection />
      <AwardsSection />
      <MediaPartnersSection />
      <FaqSection />
      {/* <FooterCtaSection /> */}
    </>
  );
}
