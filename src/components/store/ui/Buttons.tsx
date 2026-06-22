import Link from "next/link";
import type { ReactNode } from "react";

const base =
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-muted";

export function PrimaryButton({
  href,
  children,
  size = "md",
  className = "",
}: {
  href: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-sm",
    lg: "px-7 py-3.5 text-base",
  };

  return (
    <Link
      href={href}
      className={`${base} bg-brand text-white hover:bg-brand-hover ${sizes[size]} ${className}`}
    >
      {children}
    </Link>
  );
}

export function AccentButton({
  href,
  children,
  size = "md",
  className = "",
}: {
  href: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-sm",
    lg: "px-7 py-3.5 text-base",
  };

  return (
    <Link
      href={href}
      className={`${base} bg-accent text-white hover:bg-accent-hover ${sizes[size]} ${className}`}
    >
      {children}
    </Link>
  );
}

export function GhostButton({
  href,
  children,
  size = "md",
  className = "",
  dark = false,
}: {
  href: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg";
  className?: string;
  dark?: boolean;
}) {
  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-sm",
    lg: "px-7 py-3.5 text-base",
  };

  return (
    <Link
      href={href}
      className={`${base} ${
        dark
          ? "border border-white/25 bg-white/10 text-white hover:bg-white/15"
          : "border border-border bg-surface text-ink hover:border-accent/40 hover:text-accent"
      } ${sizes[size]} ${className}`}
    >
      {children}
    </Link>
  );
}
