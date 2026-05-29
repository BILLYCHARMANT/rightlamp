"use client";

import type { ReactNode } from "react";
import type { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";

type Props = {
  children: ReactNode;
  session: Session | null;
};

/** Hydrates client session from server session (same pattern as Pod Café). */
export function AuthProvider({ children, session }: Readonly<Props>) {
  return <SessionProvider session={session}>{children}</SessionProvider>;
}
