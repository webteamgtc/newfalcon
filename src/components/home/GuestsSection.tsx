import { useTranslations } from "next-intl";
import Button from "@/components/Button";

export default function GuestsSection() {
  const t = useTranslations("home.guests");
  const guests = t.raw("list") as { name: string; role: string; country: string }[];

  return (
    <section className="bg-[#F7F0E3]-light md:py-16 py-8">
      <div className="container grid gap-6 md:grid-cols-[1fr_1.4fr] md:items-start">
        <div>
          <p className="eyebrow !capitalize text-falcon-deep">
            <span className="font-poppins">{t("eyebrow")}</span>
          </p>
          <h2 className="mt-2 font-display !font-medium HeadingH1 text-ink">
            <span className="">{t("headingPlain")}</span> {" "}
            <span className="italic text-falcon-deep"> {t("headingItalic")}</span>
          </h2>
          <p className="mt-4 TextSmall leading-snug !text-[#C79E5E] font-poppins">{t("subtext")}</p>
          <Button href="/guest" className="mt-10">
            {t("cta")}
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {guests.map((guest, i) => (
            <div key={i} className="overflow-hidden border border-[#B5ADA4] bg-[#F8F3EB]">
              <div className="aspect-[3/4] bg-gradient-to-b from-ink/70 to-ink flex items-end justify-center">
                {/* <span className="mb-3 text-[10px] uppercase tracking-widest text-parchment/70">
                  {guest.country}
                </span> */}
              </div>
              <div className="px-3 py-1 font-poppins flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-widest text-ink">
                  {guest.country}
                </span>
                <span className="text-xs font-medium uppercase tracking-widest text-ink">
                  {i+1}
                </span>
              </div>
              <div className="p-3 text-[#2C1F16] font-poppins">
                <p className="font-display TextSmall !font-medium !font-poppins text-ink">{guest.name}</p>
                <p className="mt-1 line-clamp-3 text-xs leading-snug font-poppins">
                  {guest.role}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
