"use client";

import { Link } from "@/i18n/routing";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function SiteHeader() {
  const pathname = usePathname();
  const isGallery = pathname.includes("/gallery") || pathname.includes("/guest");

  return (
    <header className="absolute inset-x-0 top-0 z-40">
      <div className="container flex items-center py-5">
        <Link href="/" className="font-display text-lg uppercase tracking-widest2">
          <Image
            src={
              isGallery
                ? "https://gtcfx-bucket.s3.ap-southeast-1.amazonaws.com/img/footer-logo.webp"
                : "https://gtcfx-bucket.s3.ap-southeast-1.amazonaws.com/img/logo-2024-new.webp"
            }
            width={150}
            height={52}
            alt="GTCFX"
            priority
            className="h-[30px] w-auto cursor-pointer object-contain transition-all duration-300 sm:h-[34px] md:h-[38px]"
          />
        </Link>
      </div>
    </header>
  );
}
