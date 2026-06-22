import type { ReactNode } from "react";
import type { Service } from "@/lib/company/site-content";

const iconPaths: Record<Service["icon"], ReactNode> = {
  gas: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 3c-1.5 3-4 5.5-4 9a4 4 0 108 0c0-3.5-2.5-6-4-9z"
    />
  ),
  bolt: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M13 2L4 14h7l-1 8 9-12h-7l1-8z"
    />
  ),
  wrench: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M14.7 6.3a4 4 0 00-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 005.4-5.4l-2.1 2.1-3.2-3.2 2.1-2.1z"
    />
  ),
  shop: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 9l2-5h14l2 5M5 9v10h14V9M9 19V12h6v7"
    />
  ),
  stove: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4 10h16v8H4zM8 6v4M12 6v4M16 6v4"
    />
  ),
  research: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 3h6v2a6 6 0 01-4 5.66V14H9v-2.34A6 6 0 015 5V3h4zM10 18h4v3h-4z"
    />
  ),
};

export function ServiceIcon({
  icon,
  className = "h-6 w-6",
}: {
  icon: Service["icon"];
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
