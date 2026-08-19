import type { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  icons: {
    icon: [{ url: "/favicon.ico", sizes: "100x100", type: "image/x-icon" }],
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
