import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import BookingSuccessPage from "@/components/booking/BookingSuccessPage";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const t = await getTranslations({ locale, namespace: "bookingSuccessPage" });
  return {
    title: t("metaTitle"),
  };
}

export default function SuccessPage() {
  return (
    <Suspense fallback={null}>
      <BookingSuccessPage />
    </Suspense>
  );
}
