"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type DashboardNavContextValue = {
  mobileNavOpen: boolean;
  setMobileNavOpen: (open: boolean) => void;
  toggleMobileNav: () => void;
};

const DashboardNavContext = createContext<DashboardNavContextValue | null>(
  null,
);

export function DashboardNavProvider({ children }: { children: ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const toggleMobileNav = useCallback(() => {
    setMobileNavOpen((o) => !o);
  }, []);

  const value = useMemo(
    () => ({ mobileNavOpen, setMobileNavOpen, toggleMobileNav }),
    [mobileNavOpen, toggleMobileNav],
  );

  return (
    <DashboardNavContext.Provider value={value}>
      {children}
    </DashboardNavContext.Provider>
  );
}

export function useDashboardNav() {
  const ctx = useContext(DashboardNavContext);
  if (!ctx) {
    throw new Error(
      "useDashboardNav must be used within DashboardNavProvider",
    );
  }
  return ctx;
}
