"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import type { VipUser } from "@/data/vipUsers";
import VipTicketBookingForm from "@/components/vip/VipTicketBookingForm";

type VipTicketBookingModalProps = {
  open: boolean;
  onClose: () => void;
  user: VipUser;
};

export default function VipTicketBookingModal({
  open,
  onClose,
  user,
}: VipTicketBookingModalProps) {
  const t = useTranslations("vipPage.ticketBooking");

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[1000] flex items-start justify-center overflow-y-auto px-4 py-8 md:items-center md:py-12">
      <button
        type="button"
        aria-label={t("closeModal")}
        className="fixed inset-0 bg-[#17130F]/70 backdrop-blur-[2px]"
        onClick={onClose}
      />

      <div className="relative z-[1001] w-full max-w-3xl">
        <div
          className="max-h-[calc(100vh-4rem)] overflow-y-auto rounded-2xl p-4 shadow-2xl md:p-8"
          style={{
            border: "1px solid rgba(56, 41, 16, 0.30)",
            background: "linear-gradient(117deg, #FDFCFA 0.63%, #F3E5CB 100%)",
          }}
        >
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <p className="eyebrow !capitalize text-[#382910]">
                <span className="font-poppins">{t("eyebrow")}</span>
              </p>
              <h2 className="mt-2 font-display HeadingH4 !font-medium !text-ink md:HeadingH3">
                {t("headingPlain")}{" "}
                <span className="italic text-falcon-deep">{t("headingItalic")}</span>
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label={t("closeModal")}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-ink/20 bg-white font-poppins text-lg text-ink transition-colors hover:border-falcon-deep hover:text-falcon-deep"
            >
              ×
            </button>
          </div>

          <VipTicketBookingForm user={user} onSuccess={onClose} />
        </div>
      </div>
    </div>,
    document.body
  );
}
