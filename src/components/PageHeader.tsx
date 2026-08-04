import type { ReactNode } from "react";

export default function PageHeader({
  eyebrow,
  heading,
  subtext,
  children
}: {
  eyebrow: string;
  heading: string;
  subtext?: string;
  children?: ReactNode;
}) {
  return (
    <section className="bg-gold-sheen px-6 pb-16 pt-36 md:px-10 md:pt-44">
      <div className="mx-auto max-w-4xl text-center">
        <p className="eyebrow text-falcon-deep">{eyebrow}</p>
        <h1 className="mt-6 font-display text-3xl leading-snug text-ink md:text-5xl">
          {heading}
        </h1>
        {subtext && <p className="mx-auto mt-4 max-w-xl text-sm text-ink/65">{subtext}</p>}
        {children}
      </div>
    </section>
  );
}
