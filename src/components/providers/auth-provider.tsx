"use client";

import type { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";

type Props = {
  children: ReactNode;
};

/** Client session; avoids blocking the root layout on getServerSession. */
export function AuthProvider({ children }: Readonly<Props>) {
  return (
    <SessionProvider refetchOnWindowFocus={false} refetchInterval={0}>
      {children}
    </SessionProvider>
  );
}
