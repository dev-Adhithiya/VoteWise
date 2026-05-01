/**
 * ==========================================================================
 * NEXTAUTH.JS API ROUTES — Google OAuth Handler
 * ==========================================================================
 * Manages OAuth sign-in, callback, sign-out, and session endpoints.
 * Location: src/app/api/auth/[...nextauth]/route.ts
 */

import { handlers, auth, signIn, signOut } from "@/lib/auth";

export const { GET, POST } = handlers;

export { auth as middleware };
