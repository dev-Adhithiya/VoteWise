/**
 * ==========================================================================
 * GOOGLE CIVIC API ROUTE — Fetch Local Candidates & Elections
 * ==========================================================================
 * Endpoint: GET /api/civic/candidates?address=...
 * Uses Google Civic Information API to fetch candidates for user's district.
 */

import { NextRequest, NextResponse } from "next/server";

interface CivicCandidate {
  name: string;
  party: string;
  office: string;
  photoUrl?: string;
  website?: string;
  phone?: string;
  email?: string;
  channels?: Array<{ type: string; id: string }>;
}

interface CivicContest {
  office: string;
  level: string;
  candidates: CivicCandidate[];
  type: string;
  numberElected: number;
}

export async function GET(request: NextRequest) {
  try {
    // Get address from query parameter
    const searchParams = request.nextUrl.searchParams;
    const address = searchParams.get("address");

    if (!address) {
      return NextResponse.json(
        { error: "Missing required parameter: address" },
        { status: 400 }
      );
    }

    // Get Civic API key
    const civicApiKey = process.env.GOOGLE_CIVIC_API_KEY;
    if (!civicApiKey) {
      console.error("GOOGLE_CIVIC_API_KEY not set in environment");
      return NextResponse.json(
        { error: "Civic API not configured" },
        { status: 500 }
      );
    }

    // Call Google Civic Information API
    const url = new URL("https://www.googleapis.com/civicinfo/v2/representatives");
    url.searchParams.set("address", address);
    url.searchParams.set("key", civicApiKey);

    const civicResponse = await fetch(url.toString());
    if (!civicResponse.ok) {
      if (civicResponse.status === 400) {
        return NextResponse.json(
          {
            error: "Invalid address. Please provide a valid US address.",
            candidates: [],
          },
          { status: 400 }
        );
      }
      throw new Error(`Civic API error: ${civicResponse.statusText}`);
    }

    const civicData = (await civicResponse.json()) as {
      officials?: Array<{
        name: string;
        address?: Array<{ line1: string; city: string; state: string; zip: string }>;
        phones?: string[];
        emails?: string[];
        urls?: string[];
        photoUrl?: string;
        channels?: Array<{ type: string; id: string }>;
      }>;
      contests?: Array<{
        office: string;
        level: string;
        candidates?: Array<{
          name: string;
          party?: string;
          phone?: string;
          email?: string;
          url?: string;
          photoUrl?: string;
          channels?: Array<{ type: string; id: string }>;
        }>;
        type: string;
        numberElected: number;
      }>;
      normalizedInput?: {
        line1: string;
        city: string;
        state: string;
        zip: string;
      };
      divisions?: Record<string, { name: string }>;
    };

    // Transform contests to match candidate structure
    const contests: CivicContest[] = (civicData.contests || []).map(
      (contest) => ({
        office: contest.office,
        level: contest.level,
        type: contest.type,
        numberElected: contest.numberElected,
        candidates: (contest.candidates || []).map((candidate) => ({
          name: candidate.name,
          party: candidate.party || "Nonpartisan",
          office: contest.office,
          photoUrl: candidate.photoUrl,
          website: candidate.url,
          phone: candidate.phone,
          email: candidate.email,
          channels: candidate.channels,
        })),
      })
    );

    // Get officials
    const officials = civicData.officials || [];
    const formattedOfficials = officials.map((official, index) => ({
      name: official.name,
      photoUrl: official.photoUrl,
      phone: official.phones?.[0],
      email: official.emails?.[0],
      website: official.urls?.[0],
      channels: official.channels,
    }));

    return NextResponse.json({
      success: true,
      address: civicData.normalizedInput,
      contests,
      officials: formattedOfficials,
      divisions: civicData.divisions,
    });
  } catch (error) {
    console.error("Civic API error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Internal server error",
        candidates: [],
      },
      { status: 500 }
    );
  }
}
