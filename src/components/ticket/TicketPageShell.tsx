"use client";

import { useEffect, useState } from "react";
import { useVipUser } from "@/context/VipUserProvider";
import TicketHero from "@/components/ticket/TicketHero";
import TicketAccessSection from "@/components/ticket/TicketAccessSection";
import TicketStepsSection from "@/components/ticket/TicketStepsSection";
import TicketContactSection from "@/components/ticket/TicketContactSection";
import TicketAccessModal from "@/components/ticket/TicketAccessModal";

export default function TicketPageShell() {
  const { user, isReady } = useVipUser();
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (isReady && !user) {
      setShowForm(true);
    }
  }, [isReady, user]);

  return (
    <>
      <TicketHero />
      <TicketAccessSection onOpenForm={() => setShowForm(true)} />
      <TicketStepsSection />
      <TicketContactSection />

      {isReady && !user && (
        <TicketAccessModal
          open={showForm}
          onClose={() => setShowForm(false)}
        />
      )}
    </>
  );
}
