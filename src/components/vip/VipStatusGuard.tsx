"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "@/i18n/routing";
import { useVipUser } from "@/context/VipUserProvider";

export default function VipStatusGuard({ children }: { children: ReactNode }) {
  const { user, isReady } = useVipUser();
  const router = useRouter();

  useEffect(() => {
    if (isReady && !user) {
      router.replace("/check-status");
    }
  }, [isReady, user, router]);

  if (!isReady || !user) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-[#FFFDF8]">
        <p className="font-poppins text-sm uppercase tracking-[0.14em] text-ink/60">
          Loading...
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
