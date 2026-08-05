import type { ComponentProps, ReactNode } from "react";
import { Link } from "@/i18n/routing";

type Variant = "dark" | "light" | "gold";

type CommonProps = {
  children: ReactNode;
  variant?: Variant;
  className?: string;
  textClassName?: string;
};

type ButtonAsLink = CommonProps & {
  href: ComponentProps<typeof Link>["href"];
} & Omit<ComponentProps<typeof Link>, "href" | "className" | "children">;

type ButtonAsButton = CommonProps & {
  href?: undefined;
} & Omit<ComponentProps<"button">, "className" | "children">;

export type ButtonProps = ButtonAsLink | ButtonAsButton;

const variantStyles: Record<Variant, { root: string; icon: string }> = {
  dark: {
    root: "bg-ink text-white hover:bg-falcon-deep",
    icon: "bg-white text-ink"
  },
  gold: {
    root: "bg-[#382910] text-white hover:bg-[#382910]",
    icon: "bg-white text-falcon-deep"
  },
  light: {
    root: "bg-white text-ink hover:bg-parchment-light",
    icon: "bg-[#171617] text-white"
  }
};

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

export default function Button({
  children,
  variant = "dark",
  className = "",
  textClassName = "",
  ...props
}: ButtonProps) {
  const styles = variantStyles[variant];
  const classes = [
    "inline-flex items-center font-poppins gap-4 rounded-full py-1.5 ps-6 pe-3 text-xs md:text-sm uppercase tracking-[0.14em] transition-colors",
    styles.root,
    className
  ]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      <span className={textClassName}>{children}</span>
      <span
        className={`flex h-7 w-7 md:h-9 md:w-9 shrink-0 items-center justify-center rounded-full ${styles.icon}`}
      >
        <ArrowIcon />
      </span>
    </>
  );

  if ("href" in props && props.href != null) {
    const { href, ...rest } = props;
    return (
      <Link href={href} className={classes} {...rest}>
        {content}
      </Link>
    );
  }

  const buttonProps = props as Omit<ComponentProps<"button">, "className" | "children">;
  return (
    <button type="button" className={classes} {...buttonProps}>
      {content}
    </button>
  );
}
