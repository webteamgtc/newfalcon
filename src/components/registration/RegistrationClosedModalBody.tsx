"use client";

import { useTranslations } from "next-intl";
import Button from "@/components/Button";

type Props = {
  onClose?: () => void;
};

function ClosedIcon() {
  return (
    <svg
      className="h-8 w-8"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
      />
    </svg>
  );
}

export default function RegistrationClosedModalBody({ onClose }: Props) {
  const t = useTranslations("registrationClosed");

  return (
    <div className="px-1 pb-2 pt-0 text-center md:px-4 md:pb-4">
      <div className="mx-auto flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full border border-[#382910]/15 bg-white/80 text-falcon-deep shadow-sm">
        <ClosedIcon />
      </div>

      <div className="mx-auto mt-6 flex max-w-xs items-center justify-center gap-2" aria-hidden>
        <span className="block h-px w-12 bg-falcon-deep/35" />
        <span className="block h-2.5 w-2.5 rotate-45 border border-falcon-deep/35" />
        <span className="block h-px w-12 bg-falcon-deep/35" />
      </div>

      <h2
        id="public-vip-booking-title"
        className="mt-5 font-display text-[1.65rem] font-medium leading-snug text-ink md:text-[2rem]"
      >
        {t("title")}
      </h2>

      <p className="mx-auto mt-4 max-w-md font-poppins text-sm leading-relaxed text-[#382910]/80 md:text-base">
        {t("body")}
      </p>

      <p className="mx-auto mt-4 max-w-md rounded-xl border border-[#382910]/12 bg-white/60 px-4 py-3 font-display text-lg italic leading-snug text-falcon-deep md:text-xl">
        {t("lineManager")}
      </p>

      <div className="mt-8 flex justify-center">
        {onClose ? (
          <Button type="button" variant="gold" className="w-full sm:w-auto sm:min-w-[200px]" onClick={onClose}>
            {t("closeModal")}
          </Button>
        ) : (
          <Button href="/" variant="gold" className="w-full sm:w-auto sm:min-w-[200px]">
            {t("ctaHome")}
          </Button>
        )}
      </div>
    </div>
  );
}
