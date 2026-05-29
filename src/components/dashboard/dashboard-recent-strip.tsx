"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { History } from "lucide-react";
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
    <section className="rounded-2xl border border-border bg-surface-elevated/90 p-5 shadow-sm shadow-ink/[0.04] ring-1 ring-ink/[0.03]">
      <div className="mb-3 flex items-center gap-2">
        <History size={16} className="text-brand" aria-hidden />
        <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
          Pick up where you left off
        </h2>
      </div>
      <ul className="flex flex-wrap gap-2">
        {paths.map((path) => (
          <li key={path}>
            <Link
              href={path}
              className="inline-flex items-center rounded-full border border-border bg-canvas px-3 py-1.5 text-xs font-medium text-ink transition hover:border-brand/35 hover:bg-brand/8"
            >
              {getDashboardTitle(path)}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
