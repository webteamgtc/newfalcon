"use client";



import { useState } from "react";

import { useTranslations } from "next-intl";

import { Link } from "@/i18n/routing";

import Image from "next/image";

import { usePathname } from "next/navigation";

import { useVipUser } from "@/context/VipUserProvider";



export default function SiteHeader() {

  const t = useTranslations("nav");

  const [open, setOpen] = useState(false);

  const pathname = usePathname();

  const { user } = useVipUser();

  const isGallery = pathname.includes('/gallery') || pathname.includes('/guest') || pathname.includes('/check-status');



  const links = [

    { href: "/", label: t("welcome") },

    { href: "/gallery", label: t("gallery") },

    { href: "/awards", label: t("awards") },

    { href: "/guest", label: t("guest") },

    // { href: "/ticket", label: t("ticket") },

    { href: "/policy", label: t("policy") },

    // ...(user ? [{ href: "/vip-status", label: t("vipStatus") }] : []),

  ];



  return (

    <header className="absolute inset-x-0 top-0 z-40">

      <div className="container flex items-center justify-between py-5">

        <Link href="/" className="font-display text-lg tracking-widest2 uppercase">

          <Image

            src={isGallery ? "https://gtcfx-bucket.s3.ap-southeast-1.amazonaws.com/img/footer-logo.webp" : "https://gtcfx-bucket.s3.ap-southeast-1.amazonaws.com/img/logo-2024-new.webp"}

            width={150}

            height={52}

            alt="GTCFX"

            priority

            className="h-[30px] w-auto cursor-pointer object-contain transition-all duration-300 sm:h-[34px] md:h-[38px]"

          />

        </Link>



        <nav className="hidden font-poppins rounded-full py-2.5 px-4 items-center gap-8 lg:flex"

          style={{

            border: "0.55px solid #FFFFFF40",

            backdropFilter: "blur(36.599998474121094px)"



          }}

        >

          {links.map((link) => (

            <Link

              key={link.href}

              href={link.href}

              className={`text-xs font-medium tracking-[0.12em] transition-colors hover:text-falcon-deep ${isGallery ? "!text-[#fff]" : "!text-[#07111F]"}`}

            >

              {link.label}

            </Link>

          ))}

        </nav>



        <button

          className="lg:hidden"

          aria-label="Toggle menu"

          aria-expanded={open}

          onClick={() => setOpen((v) => !v)}

        >

          <span className="block h-px w-6 bg-[#07111F]" />

          <span className="mt-1.5 block h-px w-6 bg-[#07111F]" />

          <span className="mt-1.5 block h-px w-4 bg-[#07111F]" />

        </button>

      </div>



      {open && (

        <div className="mx-6 rounded-2xl border border-ink/10 bg-parchment-light/95 p-6 shadow-lg backdrop-blur lg:hidden">

          <nav className="flex flex-col gap-4">

            {links.map((link) => (

              <Link

                key={link.href}

                href={link.href}

                onClick={() => setOpen(false)}

                className="TextSmall font-medium tracking-[0.12em] !text-[#07111F]"

              >

                {link.label}

              </Link>

            ))}

          </nav>

        </div>

      )}

    </header>

  );

}


