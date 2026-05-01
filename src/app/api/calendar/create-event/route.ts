/**
 * ==========================================================================
 * GOOGLE CALENDAR API ROUTE — Create Election Day Reminder
 * ==========================================================================
 * Endpoint: POST /api/calendar/create-event
 * Creates a Google Calendar event for Election Day with reminder.
 * Requires authenticated user (NextAuth session).
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createElectionReminder, getNextElectionDate } from "@/lib/google-apis";

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in with Google." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { countryCode = "US" } = body;

    // Validate country code
    if (!["US", "UK", "IN"].includes(countryCode)) {
      return NextResponse.json(
        { error: "Invalid country code. Must be US, UK, or IN." },
        { status: 400 }
      );
    }

    // Get election date for the country
    const electionDate = getNextElectionDate(countryCode);

    // Get access token from session
    const accessToken = (session as any).accessToken;
    if (!accessToken) {
      return NextResponse.json(
        { error: "OAuth token not available. Re-authenticate." },
        { status: 401 }
      );
    }

    // Create calendar event
    const result = await createElectionReminder(
      accessToken,
      electionDate,
      countryCode
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to create calendar event" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      eventId: result.eventId,
      eventLink: result.eventLink,
      electionDate,
      countryCode,
    });
  } catch (error) {
    console.error("Calendar API error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
