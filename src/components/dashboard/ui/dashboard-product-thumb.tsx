import Image from "next/image";

type Props = {
  src: string;
  alt: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeClass = {
  sm: "h-10 w-10",
  md: "h-12 w-12",
  lg: "h-16 w-16",
};

export function DashboardProductThumb({
  src,
  alt,
  size = "md",
  className = "",
}: Props) {
  const dim = sizeClass[size];
  const isLocal = src.startsWith("/");

  return (
    <span
      className={`relative shrink-0 overflow-hidden rounded-sm border border-slate-200 bg-slate-100 ${dim} ${className}`}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes={size === "lg" ? "64px" : size === "md" ? "48px" : "40px"}
        className="object-cover"
        unoptimized={!isLocal && src.includes("unsplash")}
      />
    </span>
  );
}
