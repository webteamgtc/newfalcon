type SectionBackgroundImageProps = {
  src: string;
  alt?: string;
  className?: string;
  priority?: boolean;
};

export default function SectionBackgroundImage({
  src,
  alt = "",
  className = "object-cover object-center",
  priority = false,
}: SectionBackgroundImageProps) {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
      {/* Serve directly from /public — avoids flaky /_next/image optimization on EC2 */}
      <img
        src={src}
        alt={alt}
        className={`h-full w-full ${className}`}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
      />
    </div>
  );
}
