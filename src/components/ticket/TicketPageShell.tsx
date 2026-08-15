"use client";

import { useEffect } from "react";
import { useVipUser } from "@/context/VipUserProvider";
import TicketHero from "@/components/ticket/TicketHero";
import TicketAccessSection from "@/components/ticket/TicketAccessSection";
import TicketStepsSection from "@/components/ticket/TicketStepsSection";
import TicketContactSection from "@/components/ticket/TicketContactSection";
import { useRouter } from "next/navigation";

export default function TicketPageShell() {
  const { user, isReady } = useVipUser();
  const router = useRouter();
  useEffect(() => {
    if (isReady && !user) {
      router.push("/");
    }
  }, [isReady, user]);

  return (
    <>
      <TicketHero />
      <TicketAccessSection />
      <TicketStepsSection />
      <TicketContactSection />
    </>
  );
}
