import Hero from "@/components/home/Hero";
import HistorySection from "@/components/home/HistorySection";
import TicketCtaSection from "@/components/home/TicketCtaSection";
import MediaPartnersSection from "@/components/home/MediaPartnersSection";
import FaqSection from "@/components/home/FaqSection";

export default function HomePage() {
  return (
    <>
      <Hero />
      <HistorySection />
     
      <TicketCtaSection />
 
      <MediaPartnersSection />
      <FaqSection />
    </>
  );
}
