import Image from "next/image";
import { Link } from "@/i18n/routing";
import Button from "@/components/Button";
import type { ComponentProps, ReactNode } from "react";

type AppHref = ComponentProps<typeof Link>["href"];

type Cta = {
  label: string;
  href: AppHref | `#${string}`;
};

type PageHeroProps = {
  imageSrc: string;
  eyebrow?: string;
  headingPlain: string;
  headingItalic: string;
  subtext: string;
  primaryCta: Cta;
  secondaryCta?: Cta;
  children?: ReactNode;
};

function isHashHref(href: Cta["href"]): href is `#${string}` {
  return typeof href === "string" && href.startsWith("#");
}

function ArrowIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
      className="rtl:-scale-x-100"
    >
      <path
        d="M3.5 10.5 10.5 3.5M10.5 3.5H5.25M10.5 3.5V8.75"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function PageHero({
  imageSrc,
  eyebrow,
  headingPlain,
  headingItalic,
  subtext,
  primaryCta,
  secondaryCta
}: PageHeroProps) {
  return (
    <section className="relative flex min-h-[100vh] items-center overflow-hidden pb-16 pt-40 md:min-h-[95vh] md:pb-24 md:pt-48">
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <Image
          src={imageSrc}
          alt=""
          fill
          priority
          className="object-cover object-top"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/80 via-ink/50 to-ink/25" />
      </div>

      <div className="container">
        <div className="max-w-2xl">
          {eyebrow ? (
            <p className="eyebrow !capitalize text-falcon-light">
              <span className="font-poppins">{eyebrow}</span>
            </p>
          ) : null}
          <h1 className="mt-4 font-display HeadingH1 !font-medium !text-white">
            {headingPlain}{" "}
            <span className="italic text-falcon-light">{headingItalic}</span>
          </h1>
          <p className="mt-5 max-w-md Text !leading-snug !font-poppins !text-white/85">
            {subtext}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            {isHashHref(primaryCta.href) ? (
              <a
                href={primaryCta.href}
                className="inline-flex items-center gap-4 rounded-full bg-white py-1.5 ps-6 pe-3 font-poppins text-xs md:text-sm uppercase tracking-[0.14em] text-ink transition-colors hover:bg-parchment-light"
              >
                <span>{primaryCta.label}</span>
                <span className="flex h-7 w-7 md:h-9 md:w-9 shrink-0 items-center justify-center rounded-full bg-[#171617] text-white">
                  <ArrowIcon />
                </span>
              </a>
            ) : (
              <Button href={primaryCta.href} variant="light">
                {primaryCta.label}
              </Button>
            )}
            {secondaryCta ? (
              isHashHref(secondaryCta.href) ? (
                <a
                  href={secondaryCta.href}
                  className="inline-flex items-center rounded-full border border-white/70 px-6 py-3 font-poppins text-xs md:text-sm uppercase tracking-[0.14em] text-white transition-colors hover:bg-white/10"
                >
                  {secondaryCta.label}
                </a>
              ) : (
                <Link
                  href={secondaryCta.href}
                  className="inline-flex items-center rounded-full border border-white/70 px-6 py-3 font-poppins text-xs md:text-sm uppercase tracking-[0.14em] text-white transition-colors hover:bg-white/10"
                >
                  {secondaryCta.label}
                </Link>
              )
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
