import { useTranslations } from "next-intl";
import Image from "next/image";
import Button from "@/components/Button";

export default function GuestFeaturedSection() {
  const t = useTranslations("guestPage.featured");

  return (
    <section className="bg-white py-8 md:py-16">
      <div className="container">
        <p className="eyebrow md:mb-3 mb-2 text-[#141414] !capitalize">
          <span className=" font-poppins ">{t("sectionLabel")}</span>
        </p>
      </div>
      <div className="container">
        <div className="grid gap-4 md:grid-cols-2 md:items-end md:gap-16">
          <div>

            <h2 className="mt-3 font-display HeadingH1 !font-medium !text-ink">
              {t("headingPlain")}
              <br />
              <span className="italic text-falcon-deep">{t("headingItalic")}</span>
            </h2>
          </div>
          <p className="Text !leading-snug !font-poppins !text-falcon-deep md:pt-8">
            {t("subtext")}
          </p>
        </div>

        <div className="mt-6 grid overflow-hidden md:mt-14 md:grid-cols-2">
          <div className="relative aspect-[16/11] md:aspect-auto md:min-h-[360px]">
            <Image
              src="/images/img-section2.webp"
              alt=""
              fill
              className="object-cover object-center"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>

          <div className="flex flex-col justify-center px-6 py-8 md:px-10 md:py-10"
            style={{
              background: "linear-gradient(111deg, #FEFCF6 -8.89%, #FCF9F2 17.82%, #EAD9B9 56.4%, #D8BA80 93.23%)",
            }}
          >
            <p className="eyebrow TextSmall !capitalize text-ink">
              <span className="font-poppins">{t("tag")}</span>
            </p>
            <h3 className="mt-4 font-display HeadingH1 max-w-xs !font-medium !text-ink">
              {t("name")}
            </h3>
              <p className="mt-2 TextSmall !font-poppins !font-medium !text-ink">
              {t("role")}
            </p>
            <p className="mt-5 max-w-md border-t border-[#3829104D] pt-5 Text !leading-snug !font-poppins !text-ink">
            {t("quote")}
            </p>
            <Button href="/guest" className="mt-8 self-start">
              {t("cta")}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
