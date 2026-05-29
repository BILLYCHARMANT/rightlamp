"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const STORAGE_KEY = "dashboard-recent-v1";
const MAX = 6;

function pushRecent(path: string) {
  if (
    path === "/dashboard" ||
    path === "/dashboard/" ||
    !path.startsWith("/dashboard")
  ) {
    return;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const list: string[] = raw ? JSON.parse(raw) : [];
    const next = [path, ...list.filter((p) => p !== path)].slice(0, MAX);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* ignore quota / private mode */
  }
}

/** Records last visited dashboard routes for the home “Pick up where you left off” strip */
export function DashboardRecentTracker() {
  const pathname = usePathname() ?? "";

  useEffect(() => {
    pushRecent(pathname);
  }, [pathname]);

  return null;
}
