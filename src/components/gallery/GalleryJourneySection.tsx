import { useTranslations } from "next-intl";
import Image from "next/image";

export default function GalleryJourneySection() {
  const t = useTranslations("gallery.journey");
  const timeline = t.raw("timeline") as {
    year: string;
    title: string;
    description: string;
  }[];

  return (
    <section className="bg-[#F8F2E6] pt-8 pb-10 md:py-16">
      <div className="container">
        <p className="eyebrow mb-3 text-[#382910] !capitalize">
          <span className=" font-poppins ">Timeline</span>
        </p>
      </div>
      <div className="container grid gap-6 md:grid-cols-2 md:items-start md:gap-16">
        <div>
          <h2 className="max-w-sm font-display HeadingH1 !font-medium !text-ink">
            {t("headingPlain")}{" "}
            <span className="italic text-falcon-deep">{t("headingItalic")}</span>
          </h2>
          <p className="mt-4 max-w-md Text !leading-snug !font-poppins !text-ink">
            {t("subtext")}
          </p>

          <div className="relative mt-4 md:mt-8 aspect-[16/10] overflow-hidden">
            <Image
              src="/images/award-25.svg"
              alt=""
              fill
              className="object-cover object-center"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </div>

        <ol className="space-y-6 md:space-y-14 md:pt-2">
          {timeline.map((item) => (
            <li key={item.year} className="grid grid-cols-[auto_1fr] gap-5 md:gap-8">
              <p className="font-display text-3xl leading-none text-ink md:text-4xl xl:text-5xl">
                {item.year}
              </p>
              <div className="pt-1">
                <p className="font-display HeadingH4 !font-medium !text-ink">
                  {item.title}
                </p>
                <p className="mt-3 TextSmall !leading-[1.5] !font-poppins !text-[#141414]">
                  {item.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
