/**
 * ==========================================================================
 * NEXTAUTH.JS CONFIGURATION — Google OAuth Setup
 * ==========================================================================
 * Configures Google OAuth authentication with NextAuth.js v5.
 * Handles session management, JWT tokens, and user profile storage.
 * 
 * OAuth Scopes Requested:
 * - openid, profile, email (standard)
 * - calendar.events (Google Calendar for election reminders)
 * - tasks (Google Tasks for voter checklist)
 * 
 * Usage in components:
 *   const session = await getSession()
 *   const { data: session } = useSession()
 */

import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

function getAuthBaseUrl(): string | null {
  const raw = process.env.AUTH_URL || process.env.NEXTAUTH_URL;
  if (!raw) return null;

  const trimmed = raw.trim().replace(/\/$/, "");
  try {
    const parsed = new URL(trimmed);
    if (process.env.NODE_ENV === "production" && parsed.protocol !== "https:") {
      parsed.protocol = "https:";
    }
    return parsed.toString().replace(/\/$/, "");
  } catch {
    return null;
  }
}

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.warn("Missing Google OAuth credentials. Check .env.local");
}

if (!process.env.NEXTAUTH_SECRET) {
  console.warn("Missing NEXTAUTH_SECRET. Generate with: openssl rand -base64 32");
}

export const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          // Request additional scopes for Google APIs
          scope: [
            "openid",
            "profile", 
            "email",
            "https://www.googleapis.com/auth/calendar.events",
            "https://www.googleapis.com/auth/tasks",
          ].join(" "),
          access_type: "offline",
          prompt: "consent", // Force user to grant permissions each time (for testing)
        },
      },
    }),
  ],

  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },

  callbacks: {
    /**
     * JWT Callback — Runs when JWT is created/updated
     * Store access_token and other info for API calls
     */
    async jwt({ token, account, user }) {
      if (account) {
        // First login: store OAuth tokens
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at ? account.expires_at * 1000 : null;
      }

      // Check if token needs refresh
      if (token.expiresAt && Date.now() > (token.expiresAt as number)) {
        // Token expired - would need to refresh here
        // For now, mark as expired
        token.expired = true;
      }

      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.image = user.image;
      }

      return token;
    },

    /**
     * Session Callback — Runs when session is read
     * Make tokens available to client
     */
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub || "";
        session.user.email = token.email || "";
        session.user.name = token.name || "";
        session.user.image = typeof token.image === "string" ? token.image : "";
      }

      // Attach access token for API calls
      (session as any).accessToken = token.accessToken;
      (session as any).refreshToken = token.refreshToken;
      (session as any).expiresAt = token.expiresAt;
      (session as any).tokenExpired = token.expired || false;

      return session;
    },

    /**
     * Redirect Callback — force secure/same-origin redirects in production
     */
    async redirect({ url, baseUrl }) {
      const configuredBaseUrl = getAuthBaseUrl();
      const effectiveBaseUrl = configuredBaseUrl || baseUrl;

      try {
        const base = new URL(effectiveBaseUrl);

        if (url.startsWith("/")) {
          return `${base.origin}${url}`;
        }

        const target = new URL(url);
        if (target.origin === base.origin) {
          if (process.env.NODE_ENV === "production" && target.protocol !== "https:") {
            target.protocol = "https:";
          }
          return target.toString();
        }

        return base.origin;
      } catch {
        return effectiveBaseUrl;
      }
    },

    /**
     * Authorized Callback — Check if user is authorized (runs on protected routes)
     */
    async authorized({ request, auth }) {
      // Redirect to signin if not authenticated
      return !!auth;
    },
  },

  // Configure session strategy
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // Refresh daily
  },

  // Events for debugging
  events: {
    async signIn({ user, account }) {
      console.log(`✅ User signed in: ${user?.email}`);
      if (account) {
        console.log(`   OAuth Provider: ${account.provider}`);
      }
    },
    async signOut(event) {
      const token = (event as any).token;
      console.log(`👋 User signed out`);
    },
  },

  // Trust host for development
  trustHost: true,
  useSecureCookies: process.env.NODE_ENV === "production",
};

export const { handlers, auth, signIn, signOut } = (
  await import("next-auth")
).default({
  ...authConfig,
  secret: process.env.NEXTAUTH_SECRET,
});
