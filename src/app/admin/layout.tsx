import type { ReactNode } from "react";

export const metadata = {
  title: "Admin Portal — 金鹰节",
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-parchment text-ink antialiased">{children}</div>;
}
