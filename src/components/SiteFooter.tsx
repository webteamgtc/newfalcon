// import { useTranslations } from "next-intl";
// import { Link } from "@/i18n/routing";

// export default function SiteFooter() {
//   const t = useTranslations("footer");

//   return (
//     <footer className="border-t border-ink/10 bg-parchment-dark">
//       <div className="container flex flex-col items-center justify-between gap-4 py-8 text-xs uppercase tracking-[0.12em] text-ink/70 md:flex-row">
//         <p>{t("dateLocation")}</p>
//         <p className="text-center">{t("brand")}</p>
//         <div className="flex items-center gap-6">
//           <Link href="/policy" className="hover:text-falcon-deep">
//             {t("policy")}
//           </Link>
//           <Link href="/agenda" className="hover:text-falcon-deep">
//             {t("contact")}
//           </Link>
//         </div>
//       </div>
//     </footer>
//   );
// }


import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import Button from "@/components/Button";
import SectionBackgroundImage from "@/components/ui/SectionBackgroundImage";
import { SECTION_BG_IMAGE_POSITION } from "@/lib/sectionLayout";

export default function SiteFooter() {
  const t = useTranslations("home.footerCta");
  const t2 = useTranslations("footer");

  return (
    <section className="relative isolate overflow-hidden md:pt-24 pt-8">
      <SectionBackgroundImage src="/new/footer-img.webp" className={SECTION_BG_IMAGE_POSITION} />
      <div className="relative z-10 container text-left">
        <p className="eyebrow !capitalize">
          <span className="font-poppins text-sm md:text-xl italic">{t("eyebrow")}</span>
        </p>
        <h2 className="mt-3 max-w-lg font-display HeadingH1 !font-medium !text-ink">
          {t("headingPlain")}<span className="italic">{t("headingItalic")}</span>
        </h2>
        <p className=" mt-6 max-w-lg text-sm md:text-xl !leading-snug !font-poppins !text-ink">{t("subtext")}</p>
        <Button href="/check-status" className="mt-10">
          {t("cta")}
        </Button>
      </div>
      <footer className="relative z-10 border-t md:mt-24 mt-16 border-[#382910]/40">
      <div className="container font-poppins flex flex-col md:items-center justify-between md:gap-4 gap-2 md:py-8 py-4 text-xs font-medium uppercase tracking-[0.12em] text-[#382910] md:flex-row">
        <p className="!font-medium text-xs !text-[#382910]">{t2("dateLocation")}</p>
        <p className="md:text-center">{t2("brand")}</p>
        <div className="flex items-center gap-6">
          <Link href="/policy" className="hover:text-[#382910]">
            {t2("policy")}
          </Link>
          <Link href="/agenda" className="hover:text-[#382910]">
            {t2("contact")}
          </Link>
        </div>
      </div>
    </footer>
    </section>
  );
}
