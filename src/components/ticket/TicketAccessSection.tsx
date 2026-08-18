"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import Button from "@/components/Button";
import { useVipUser } from "@/context/VipUserProvider";

type Field = {
  label: string;
  placeholder: string;
};

function AccessCard({
  title,
  fields,
  cta,
  top1,
  top2,
  value,
  desc
}: {
  title: string;
  fields: Field[];
  cta: string;
  top1: string;
  top2: string;
  value: string;
  desc: string;
}) {
  return (
    <form
      className="flex h-full flex-col p-4 md:p-6"
      style={{
        border: "1px solid rgba(56, 41, 16, 0.30)",
        background: "linear-gradient(117deg, #FDFCFA 0.63%, #F3E5CB 100%)",
      }}
      onSubmit={(e) => e.preventDefault()}
    >
      <div className="flex justify-between items-start mb-4 text-falcon-deep">
        <div>
          <p className="font-poppins text-xs">{value}</p>

          <p className="font-poppins text-xs">{top1}</p>
        </div>
        <div>
          <p className="font-poppins text-xs">{top2}</p>
        </div>
      </div>
      <h3 className="font-display HeadingH2 md:max-w-[290px] !font-medium !text-ink">{title}</h3>
      <p className="text-sm mt-3 !leading-snug !font-poppins !text-ink">{desc}</p>
      <div className="mt-6 md:mt-8 flex flex-1 flex-col">
        {fields.map((field) => (
          <label key={field.label} className="block">
            <select
              defaultValue=""
              className="mt-4 w-full appearance-none border-0 border-b border-ink/25 bg-transparent pb-4 font-poppins text-sm text-ink outline-none transition-colors focus:border-falcon-deep"
            >
              <option value="" disabled>
                {field.placeholder}
              </option>
              <option value="option-1">{field.placeholder}</option>
              <option value="option-2">Option 2</option>
              <option value="option-3">Option 3</option>
            </select>
          </label>
        ))}
      </div>
      <Button type="submit" className="mt-6 md:mt-10 w-full justify-between" variant="gold" textClassName="text-white flex-1">
        {cta}
      </Button>
    </form>
  );
}

export default function TicketAccessSection() {
  const t = useTranslations("ticketPage.access");
  const { user } = useVipUser();
  const qualifyFields = t.raw("qualify.fields") as Field[];
  const purchaseFields = t.raw("purchase.fields") as Field[];

  return (
    <>
      <section id="access" className="bg-[#fff] py-8 md:py-12">
        <div className="container">
          <p className="eyebrow !capitalize text-[#382910] md:mb-3 mb-2">
            <span className="font-poppins">{t("eyebrow")}</span>
          </p>
        </div>
        <div className="container">
          <div className="grid gap-6 md:grid-cols-[1.1fr_0.9fr] md:items-start md:gap-12">
            <h2 className="max-w-md font-display HeadingH1 !font-medium !text-ink">
              {t("headingPlain")}{" "}
              <span className="italic text-falcon-deep">{t("headingItalic")}</span>
            </h2>
            <div>
              <p className="Text !leading-snug  !text-ink ">
                {t("descriptionText")}
              </p>
              <p className="text-sm mt-3 !leading-snug !font-poppins !text-ink">
                {t("subtext")}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="bg-[#F4ECDF] md:py-12 py-8 container">
        <div className="flex justify-between items-center mb-5 border-b border-[#3829104D] pb-3">
          <p className="font-poppins md:text-sm text-xs">{t("twoAccessLabel")}</p>
          <p className="font-poppins md:text-sm text-xs">{t("twoAccessHint")}</p>
        </div>
        <div className="grid gap-5 md:grid-cols-2  ">
          <AccessCard
            title={t("qualify.title")}
            fields={qualifyFields}
            cta={t("qualify.cta")}
            top1={t("complimentaryAccess")}
            top2={t("forEligibleClients")}
            value={"01"}
            desc={t("qualifyDesc")}
          />
          <AccessCard
            title={t("purchase.title")}
            fields={purchaseFields}
            cta={t("purchase.cta")}
            top1={t("falconTicket")}
            top2={t("subjectToAvailability")}
            value={"02"}
            desc={t("purchaseDesc")}
          />
        </div>

        <div className="mt-6 md:mt-8 flex flex-col items-start justify-between gap-4 bg-[#FFFAF0] px-5 py-4 sm:flex-row sm:items-center sm:px-7">
          <div className="flex flex-wrap items-center gap-3 sm:gap-5">
            <span className="font-display text-2xl font-medium text-ink md:text-3xl">
              {t("vip.label")}
            </span>
            <div>
              <p className="Text !leading-snug !font-medium  !text-[#17130F]">{t("vip.text")}</p>
              <p className="text-xs mt-1 !font-poppins !text-[#000000]">{t("vipAssistText")}</p>
            </div>
          </div>
          {user ? (
            <Link
              href="/result"
              className="shrink-0 font-poppins text-xs uppercase tracking-[0.16em] text-ink transition-colors hover:text-falcon-deep"
            >
              {t("vip.viewStatus")} →
            </Link>
          ) : (
            <Link
              href="/check-status"
              className="shrink-0 font-poppins text-xs uppercase tracking-[0.16em] text-ink transition-colors hover:text-falcon-deep"
            >
              {t("vip.cta")} →
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
