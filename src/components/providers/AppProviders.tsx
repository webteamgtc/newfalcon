"use client";

import type { ReactNode } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { VipUserProvider } from "@/context/VipUserProvider";

export default function AppProviders({ children }: { children: ReactNode }) {
  return (
    <VipUserProvider>
      {children}
      <ToastContainer position="top-right" autoClose={4000} />
    </VipUserProvider>
  );
}
