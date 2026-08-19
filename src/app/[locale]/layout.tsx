import type { ReactNode } from "react";
import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";
import { getMessages, getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import AppProviders from "@/components/providers/AppProviders";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    title: `${t("siteName")} \u2014 ${t("tagline")}`,
    description: t("tagline"),
    icons: {
      icon: [{ url: "/favicon.ico", sizes: "100x100", type: "image/x-icon" }],
      shortcut: "/favicon.ico",
      apple: "/favicon.ico",
    },
  };
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  const messages = await getMessages();
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <div dir={dir} lang={locale} className="min-h-screen bg-parchment text-ink antialiased">
      <NextIntlClientProvider messages={messages}>
        <AppProviders>
          <SiteHeader />
          <main>{children}</main>
          <SiteFooter />
        </AppProviders>
      </NextIntlClientProvider>
    </div>
  );
}
