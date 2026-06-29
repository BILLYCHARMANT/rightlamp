import { DashboardMediaImage } from "@/components/dashboard/dashboard-media-image";

type Props = {
  src: string;
  alt: string;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
};

const sizeClass = {
  xs: "h-8 w-8",
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

  return (
    <span
      className={`relative shrink-0 overflow-hidden rounded-sm border border-slate-200 bg-slate-100 ${dim} ${className}`}
    >
      <DashboardMediaImage src={src} alt={alt} fill />
    </span>
  );
}
