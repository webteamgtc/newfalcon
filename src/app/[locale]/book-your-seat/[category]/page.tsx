import { redirect } from "next/navigation";
import { getTranslations, unstable_setRequestLocale } from "next-intl/server";
import RegistrationClosedPanel from "@/components/registration/RegistrationClosedPanel";
import SeatBookingShell from "@/components/seat-booking/SeatBookingShell";
import { getSeatCategory } from "@/lib/seatBooking/categories";
import { REGISTRATION_OPEN } from "@/lib/registrationGate";

export const dynamic = "force-dynamic";

type Params = { params: { locale: string; category: string } };

export async function generateMetadata({ params }: Params) {
  const category = getSeatCategory(params.category);
  const t = await getTranslations({ locale: params.locale, namespace: "seatBooking" });
  if (!category) return { title: t("meta.title") };
  return {
    title: `${t(`categories.${category.i18nKey}.label`)} · ${t("meta.title")}`,
    description: t(`categories.${category.i18nKey}.intro`),
  };
}

export default function SeatCategoryPage({ params }: Params) {
  if (params.category === "partner-ib") redirect("/book-your-seat/partner");
  const category = getSeatCategory(params.category);
  // Unknown category: send people to the category picker.
  if (!category) redirect("/book-your-seat");
  unstable_setRequestLocale(params.locale);

  if (!REGISTRATION_OPEN) {
    return (
      <section className="min-h-[70vh] bg-parchment">
        <div className="container pb-24 pt-32 md:pt-40">
          <RegistrationClosedPanel variant="page" />
        </div>
      </section>
    );
  }

  return <SeatBookingShell category={category} locale={params.locale} />;
}
