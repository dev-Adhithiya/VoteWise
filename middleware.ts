/**
 * ==========================================================================
 * NEXTAUTH.JS MIDDLEWARE — Route Protection
 * ==========================================================================
 * Protects API routes and restricts access to authenticated users.
 * Location: middleware.ts (root of project)
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

/**
 * Public routes that don't require authentication
 */
const PUBLIC_ROUTES = ["/", "/api/health"];

/**
 * API routes that require authentication
 */
const PROTECTED_API_ROUTES = [
  "/api/calendar",
  "/api/tasks",
  "/api/civic/research",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.next();
  }

  // Check authentication for protected API routes
  if (PROTECTED_API_ROUTES.some((route) => pathname.startsWith(route))) {
    const session = await auth();

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in with Google." },
        { status: 401 }
      );
    }

    // Attach session to request for use in API routes
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-email", session.user?.email || "");
    requestHeaders.set("x-user-id", session.user?.id || "");
    requestHeaders.set("x-access-token", (session as any).accessToken || "");

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};
