import { useTranslations } from "next-intl";
import Image from "next/image";
import Button from "@/components/Button";

export default function HistorySection() {
  const t = useTranslations("home.history");
  const timeline = t.raw("timeline") as {
    year: string;
    title: string;
    description: string;
  }[];

  return (
    <section className="relative py-8 md:py-14">
      <div className="pointer-events-none absolute inset-0 -z-10 h-full overflow-hidden" aria-hidden>
        <Image
          src="/images/home-section2-bg.webp"
          alt=""
          fill
          priority
          className="h-full w-full object-cover object-center"
          sizes="100vw"
        />
      </div>
      <div className="container min-w-0 max-w-full text-center">
        <div className="max-w-xl mx-auto">
          <p className="eyebrow text-[#382910] !capitalize">{t("eyebrow")}</p>
          <h2 className="mt-3 font-display leading-snug text-ink HeadingH1">
            {t("headingPlain")}
            <br />
            <span className="italic text-falcon-deep">{t("headingItalic")}</span>
          </h2>
        </div>
      </div>

      <div className="container mt-14 grid gap-10 md:grid-cols-[1.4fr_1fr] md:items-center">
        <div className="relative overflow-hidden aspect-[16/9]">
          <div className="absolute inset-0 flex items-center justify-center">
            <Image
              src="/images/img-section2.webp"
              alt=""
              fill
              priority
              className="h-full w-full object-cover object-center"
              sizes="100vw"
            />
          </div>
        </div>

        <div>
          <ol className="">
            {timeline.map((item) => (
              <li key={item.year} className="border-t flex gap-4 items-center border-[#382910] py-4">
                <p className="font-display HeadingH2 text-falcon-deep">{item.year}</p>
                <div>
                  <p className=" font-display HeadingH5 !leading-snug !font-medium !text-[#07111F]">{item.title}</p>
                  <p className="mt-1 text-xs !text-[#07111F] font-poppins">{item.description}</p>
                </div>
              </li>
            ))}
          </ol>

          <Button href="/gallery" className="mt-8">
            {t("cta")}
          </Button>
        </div>
      </div>
    </section>
  );
}
