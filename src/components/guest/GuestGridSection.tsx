"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

type Guest = {
  name: string;
  role: string;
  bio: string;
  category: string;
};

type Filter = {
  id: string;
  label: string;
};

export default function GuestGridSection() {
  const t = useTranslations("guestPage.grid");
  const filters = t.raw("filters") as Filter[];
  const guests = t.raw("list") as Guest[];
  const [active, setActive] = useState("all");

  const visible =
    active === "all" ? guests : guests.filter((guest) => guest.category === active);

  return (
    <section className="bg-[#F7F1E7] py-8 md:py-16">
      <div className="container">
        <div className="grid gap-4 md:grid-cols-[1fr_0.7fr] md:items-end md:gap-6">
          <div>
            <p className="eyebrow !capitalize text-falcon-deep">
              <span className="font-poppins">Featured guest</span>
            </p>
            <h2 className="mt-3 md:max-w-sm font-display max-w-md HeadingH1 !font-medium !text-ink">
              {t("headingPlain")}{" "}
              <span className="italic text-falcon-deep">{t("headingItalic")}</span>
            </h2>
          </div>
          <p className="Text !leading-snug !font-poppins !text-ink md:text-end">
            A curated community of leaders and voices joining us in Dubai.
          </p>
        </div>

        <div className="mt-6  flex flex-wrap items-center gap-2 md:mt-10">
          {filters.map((filter) => {
            const isActive = active === filter.id;
            return (
              <button
                key={filter.id}
                type="button"
                onClick={() => setActive(filter.id)}
                className={`rounded-full border px-4 py-1.5 font-poppins text-xs uppercase tracking-[0.14em] transition-colors ${isActive
                    ? "border-ink bg-ink text-white"
                    : "border-ink/25 bg-transparent text-ink/70 hover:border-ink"
                  }`}
              >
                {filter.label}
              </button>
            );
          })}
        </div>

        <div className="mt-6 md:mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((guest) => (
            <article
              key={`${guest.name}-${guest.category}`}
              className="overflow-hidden bg-white p-2"

              style={{
                border: "1px solid rgba(69, 52, 35, 0.30)",
                background: "#FBF8F0",
              }}
            >
              <div className="relative aspect-[4/3] bg-gradient-to-b from-ink/60 to-ink grayscale">
                <div className="absolute inset-0 flex items-end justify-center pb-6">
                  <span className="font-display text-5xl text-white/10">
                    {guest.name.charAt(0)}
                  </span>
                </div>
              </div>
              <div className="p-4 mt-3 font-poppins">
                <h3 className="font-poppins HeadingH5 !font-medium !text-ink">
                  {guest.name}
                </h3>
                {/* <p className="mt-2 TextSmall !font-poppins !font-medium !text-ink/75">
                  {guest.role}
                </p> */}
                <p className="mt-1 line-clamp-3 TextSmall !leading-relaxed !font-poppins !text-ink">
                  {guest.bio}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
