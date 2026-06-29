type Props = {
  src: string;
  alt?: string;
  className?: string;
  fill?: boolean;
  objectFit?: "cover" | "contain";
};

/** Native img — works with data URLs and any HTTPS host (no Next image config). */
export function DashboardMediaImage({
  src,
  alt = "",
  className = "",
  fill = false,
  objectFit = "cover",
}: Props) {
  if (!src.trim()) return null;

  const fitClass = objectFit === "contain" ? "object-contain" : "object-cover";

  if (fill) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        className={`absolute inset-0 h-full w-full ${fitClass} ${className}`.trim()}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className={`${fitClass} ${className}`.trim()} />
  );
}
