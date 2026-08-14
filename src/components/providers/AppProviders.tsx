"use client";

import type { ReactNode } from "react";
import { VipUserProvider } from "@/context/VipUserProvider";

export default function AppProviders({ children }: { children: ReactNode }) {
  return <VipUserProvider>{children}</VipUserProvider>;
}
