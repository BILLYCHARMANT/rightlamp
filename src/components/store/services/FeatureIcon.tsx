import type { ReactNode } from "react";
import type { ServiceFeatureIcon } from "@/lib/company/site-content";

const iconPaths: Record<ServiceFeatureIcon, ReactNode> = {
  solar: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </>
  ),
  emergency: (
    <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8zM12 8v4M12 16h.01" />
  ),
  maintenance: (
    <path d="M14.7 6.3a4 4 0 00-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 005.4-5.4l-2.1 2.1-3.2-3.2 2.1-2.1z" />
  ),
  modeling: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </>
  ),
  biogas: (
    <path d="M12 3c-1.5 3-4 5.5-4 9a4 4 0 108 0c0-3.5-2.5-6-4-9z" />
  ),
  construction: (
    <>
      <path d="M3 21h18M5 21V7l7-4 7 4v14" />
      <path d="M9 21v-6h6v6" />
    </>
  ),
  lighting: (
    <>
      <path d="M9 18h6M10 22h4M12 2a5 5 0 015 5c0 2.2-1.5 3.5-2.5 4.5-.6.6-1 1.2-1 2h-3c0-.8-.4-1.4-1-2C8.5 10.5 7 9.2 7 7a5 5 0 015-5z" />
    </>
  ),
  parking: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M7 16V8h3.5a2.5 2.5 0 010 5H10v3" />
    </>
  ),
  design: (
    <>
      <path d="M12 3l2.4 4.8 5.3.8-3.8 3.7 1 5.2L12 15.8 7.1 17.5l1-5.2L4.3 8.6l5.3-.8L12 3z" />
    </>
  ),
  generator: (
    <>
      <rect x="4" y="6" width="16" height="12" rx="2" />
      <path d="M8 10h8M8 14h5M16 14h.01" />
    </>
  ),
  panel: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M7 8h2M7 12h2M7 16h2M13 8h4M13 12h4M13 16h4" />
    </>
  ),
  equipment: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2" />
    </>
  ),
};

export function FeatureIcon({
  icon,
  className = "h-5 w-5",
}: {
  icon: ServiceFeatureIcon;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      className={className}
      aria-hidden
    >
      {iconPaths[icon]}
    </svg>
  );
}
