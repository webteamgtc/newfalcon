import Image from "next/image";

type SectionBackgroundImageProps = {
  src: string;
  alt?: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
};

export default function SectionBackgroundImage({
  src,
  alt = "",
  className = "object-cover object-center",
  priority = false,
  sizes = "100vw",
}: SectionBackgroundImageProps) {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
      <Image src={src} alt={alt} fill priority={priority} className={className} sizes={sizes} />
    </div>
  );
}
