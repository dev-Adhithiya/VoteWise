/**
 * ==========================================================================
 * MAPS API ROUTE — /api/maps
 * Accepts user coordinates and returns nearest polling locations.
 * Uses server-side Google Maps API key.
 * ==========================================================================
 */
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { latitude, longitude } = await request.json();
  if (!latitude || !longitude) {
    return NextResponse.json({ success: false, error: "Coordinates required" }, { status: 400 });
  }

  /* Demo polling locations — in production would query Google Places API */
  return NextResponse.json({
    success: true,
    data: {
      stations: [
        {
          name: "Community Center Polling Station",
          address: "123 Democracy Ave, Suite 100",
          lat: latitude + 0.008,
          lng: longitude + 0.005,
          hours: "6:00 AM - 8:00 PM",
          distance: "1.2 miles",
        },
        {
          name: "Public Library Voting Center",
          address: "456 Freedom Blvd",
          lat: latitude + 0.012,
          lng: longitude - 0.003,
          hours: "7:00 AM - 7:00 PM",
          distance: "2.1 miles",
        },
      ],
    },
  });
}
