import TicketHero from "@/components/ticket/TicketHero";
import TicketAccessSection from "@/components/ticket/TicketAccessSection";
import TicketStepsSection from "@/components/ticket/TicketStepsSection";
import TicketContactSection from "@/components/ticket/TicketContactSection";

export default function TicketPage() {
  return (
    <>
      <TicketHero />
      <TicketAccessSection />
      <TicketStepsSection />
      <TicketContactSection />
    </>
  );
}
