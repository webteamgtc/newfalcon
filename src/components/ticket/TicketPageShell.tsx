"use client";

import { useEffect } from "react";
import { useVipUser } from "@/context/VipUserProvider";
import { useRouter } from "@/i18n/routing";
import TicketHero from "@/components/ticket/TicketHero";
import TicketAccessSection from "@/components/ticket/TicketAccessSection";
import TicketStepsSection from "@/components/ticket/TicketStepsSection";
import TicketContactSection from "@/components/ticket/TicketContactSection";

export default function TicketPageShell() {
  const { user, isReady } = useVipUser();
  const router = useRouter();
  useEffect(() => {
    if (isReady && user) {
      router.replace("/result");
    }
  }, [isReady, user, router]);

  useEffect(() => {
    if (isReady && !user) {
      router.push("/");
    }
  }, [isReady, user]);

  if (isReady && user) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-[#FFFDF8]">
        <p className="font-poppins text-sm uppercase tracking-[0.14em] text-ink/60">
          Redirecting...
        </p>
      </div>
    );
  }

  return (
    <>
      <TicketHero />
      <TicketAccessSection />
      <TicketStepsSection />
      <TicketContactSection />
    </>
  );
}
