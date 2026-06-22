"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { getDashboardTitle } from "@/lib/dashboard/nav-config";

const STORAGE_KEY = "dashboard-recent-v1";

export function DashboardRecentStrip() {
  const [paths, setPaths] = useState<string[]>([]);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        const list: unknown = raw ? JSON.parse(raw) : [];
        setPaths(Array.isArray(list) ? (list as string[]).filter(Boolean) : []);
      } catch {
        setPaths([]);
      }
    });
    return () => cancelAnimationFrame(id);
  }, []);

  if (paths.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Clock size={13} aria-hidden />
        Recent
      </span>
      {paths.map((path) => (
        <Link
          key={path}
          href={path}
          className="rounded-full border border-border bg-surface-elevated px-3 py-1 text-xs font-medium text-ink shadow-sm transition hover:border-brand/30 hover:bg-brand/8"
        >
          {getDashboardTitle(path)}
        </Link>
      ))}
    </div>
  );
}
