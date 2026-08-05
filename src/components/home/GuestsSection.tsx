import { useTranslations } from "next-intl";
import Image from "next/image";
import Button from "@/components/Button";

export default function GuestsSection() {
  const t = useTranslations("home.guests");
  const guests = t.raw("list") as { name: string; role: string; country: string }[];

  return (
    <section className="bg-[#F7F0E3] py-10 md:py-16">
      <div className="container grid gap-8 md:grid-cols-[1fr_1.65fr] md:items-start md:gap-10">
        <div className="max-w-md">
          <p className="eyebrow !capitalize text-falcon-deep">
            <span className="font-poppins">{t("eyebrow")}</span>
          </p>
          <h2 className="mt-3 font-display !font-medium HeadingH1 text-ink">
            {t("headingPlain")}{" "}
            <span className="italic text-falcon-deep">{t("headingItalic")}</span>
          </h2>
          <p className="mt-4 font-poppins TextSmall leading-snug !text-[#C79E5E]">
            {t("subtext")}
          </p>
          <Button href="/guest" className="mt-8 md:mt-10">
            {t("cta")}
          </Button>
        </div>

        <div className="-mx-[15px] flex gap-2 overflow-x-auto px-[15px] pb-1 md:mx-0 md:grid md:grid-cols-3 md:gap-2 md:overflow-visible md:px-0">
          {guests.map((guest, i) => (
            <article
              key={i}
              className="flex min-w-[58%] shrink-0 flex-col border border-[#B5ADA4] bg-[#F8F3EB] sm:min-w-[42%] md:min-w-0"
            >
              <div className="flex items-center justify-between px-3 pt-2.5 font-poppins">
                <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-ink">
                  {guest.country}
                </span>
                <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-ink">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>

              <div className="relative mx-3 mt-2 aspect-square overflow-hidden border border-[#B5ADA4]">
                <Image
                  src="/home/guest.jpg"
                  alt={guest.name}
                  fill
                  className="object-cover object-top grayscale"
                  sizes="(max-width: 768px) 45vw, 20vw"
                />
              </div>

              <div className="flex flex-1 flex-col px-3 pb-4 pt-3 font-poppins">
                <p className="text-sm font-medium text-ink">{guest.name}</p>
                <p className="mt-2 text-[11px] leading-snug text-ink/80">{guest.role}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
