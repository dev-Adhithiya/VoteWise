/**
 * ==========================================================================
 * CIVIC API ROUTE — /api/civic
 * Proxies Google Civic Information API calls with server-side API key.
 * Returns representative and election data for a given address.
 * ==========================================================================
 */
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const address = request.nextUrl.searchParams.get("address");
  if (!address) {
    return NextResponse.json({ success: false, error: "Address is required" }, { status: 400 });
  }

  const apiKey = process.env.GOOGLE_CIVIC_API_KEY;
  if (!apiKey) {
    /* Return demo data when no API key is configured */
    return NextResponse.json({
      success: true,
      data: {
        offices: [
          { name: "U.S. Senate", candidates: ["Alexandra Rivera", "James Mitchell"] },
          { name: "U.S. House - District 7", candidates: ["Sarah Chen", "Robert Williams"] },
          { name: "Governor", candidates: ["Maria Santos"] },
        ],
      },
    });
  }

  try {
    const url = `https://www.googleapis.com/civicinfo/v2/representatives?address=${encodeURIComponent(address)}&key=${apiKey}`;
    const res = await fetch(url);
    const data = await res.json();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Civic API error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch civic data" }, { status: 500 });
  }
}
