/**
 * ==========================================================================
 * SESSION PROVIDER — Provides Auth Context to Client Components
 * ==========================================================================
 * Wraps the app with NextAuth SessionProvider so useSession() works.
 * Used in root layout.tsx
 */
"use client";

import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export function AuthSessionProvider({ children }: Props) {
  return (
    <SessionProvider
      refetchInterval={60 * 60} // Refresh session every hour
      refetchOnWindowFocus={true}
    >
      {children}
    </SessionProvider>
  );
}
