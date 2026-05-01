/**
 * ==========================================================================
 * POLLING & MARKET DATA ROUTE — Combine Polls + Prediction Markets
 * ==========================================================================
 * Endpoint: GET /api/elections/polling-data?race=...
 * Combines traditional polling averages with Polymarket prediction odds.
 * Returns JSON formatted for Recharts visualization.
 */

import { NextRequest, NextResponse } from "next/server";

interface PollingDataPoint {
  name: string;
  polls: number;
  bettingMarkets: number;
  color: string;
  party?: string;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const race = searchParams.get("race");

    if (!race) {
      return NextResponse.json(
        { error: "Missing required parameter: race" },
        { status: 400 }
      );
    }

    // Mock polling data (in production, query 538, FiveThirtyEight, or polling aggregator API)
    // This is simplified for demonstration
    const mockPollingData: Record<string, PollingDataPoint[]> = {
      "2024 Presidential": [
        {
          name: "Candidate A",
          polls: 48.2,
          bettingMarkets: 52.5,
          color: "#3b82f6", // Blue
          party: "Democratic",
        },
        {
          name: "Candidate B",
          polls: 46.1,
          bettingMarkets: 44.2,
          color: "#ef4444", // Red
          party: "Republican",
        },
        {
          name: "Other",
          polls: 5.7,
          bettingMarkets: 3.3,
          color: "#8b5cf6", // Purple
          party: "Independent",
        },
      ],
      "2024 Senate": [
        {
          name: "Democratic",
          polls: 51.3,
          bettingMarkets: 54.1,
          color: "#3b82f6",
          party: "Democratic",
        },
        {
          name: "Republican",
          polls: 45.2,
          bettingMarkets: 42.8,
          color: "#ef4444",
          party: "Republican",
        },
        {
          name: "Other",
          polls: 3.5,
          bettingMarkets: 3.1,
          color: "#8b5cf6",
          party: "Independent",
        },
      ],
      "2024 House": [
        {
          name: "Democratic",
          polls: 49.8,
          bettingMarkets: 52.3,
          color: "#3b82f6",
          party: "Democratic",
        },
        {
          name: "Republican",
          polls: 47.6,
          bettingMarkets: 45.1,
          color: "#ef4444",
          party: "Republican",
        },
        {
          name: "Other",
          polls: 2.6,
          bettingMarkets: 2.6,
          color: "#8b5cf6",
          party: "Independent",
        },
      ],
    };

    // Get polling data for the specified race
    let pollingData = mockPollingData[race];

    // If race not found, try to fetch from Polymarket API
    if (!pollingData) {
      pollingData = await fetchPolymarketData(race);
    }

    if (!pollingData || pollingData.length === 0) {
      return NextResponse.json(
        {
          error: `No polling data found for race: ${race}`,
          data: [],
        },
        { status: 404 }
      );
    }

    // Calculate statistics
    const totalPolls = pollingData.reduce((sum, d) => sum + d.polls, 0);
    const totalMarkets = pollingData.reduce((sum, d) => sum + d.bettingMarkets, 0);

    // Normalize to 100% with divide-by-zero protection
    const normalized = pollingData.map((d) => ({
      ...d,
      polls:
        totalPolls > 0
          ? Math.round((d.polls / totalPolls) * 100 * 10) / 10
          : 0,
      bettingMarkets:
        totalMarkets > 0
          ? Math.round((d.bettingMarkets / totalMarkets) * 100 * 10) / 10
          : 0,
    }));

    return NextResponse.json({
      success: true,
      race,
      data: normalized,
      lastUpdated: new Date().toISOString(),
      sources: [
        "Traditional Polling Averages",
        "Polymarket Prediction Markets",
      ],
      disclaimer:
        "Polls reflect recent surveys. Betting markets reflect aggregate probability estimates. Neither is a guaranteed prediction.",
    });
  } catch (error) {
    console.error("Polling data error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

/**
 * Fetch prediction market data from Polymarket
 * Polymarket API is typically public; no authentication required
 */
async function fetchPolymarketData(race: string): Promise<PollingDataPoint[]> {
  try {
    const baseUrl = process.env.POLYMARKET_API_BASE || "https://api.polymarket.com";

    // Query Polymarket API for markets related to the race
    const url = `${baseUrl}/markets?q=${encodeURIComponent(race)}&limit=10`;
    const response = await fetch(url, {
      headers: { "User-Agent": "VoteWise-AI" },
    });

    if (!response.ok) {
      console.warn(
        `Polymarket API returned ${response.status}, using mock data`
      );
      return [];
    }

    const data = (await response.json()) as {
      data?: Array<{
        question: string;
        outcomes: Array<{ name: string; probability: number }>;
      }>;
    };

    if (!data.data || data.data.length === 0) {
      return [];
    }

    // Transform Polymarket format to our format
    const market = data.data[0];
    return (market.outcomes || []).slice(0, 3).map((outcome) => ({
      name: outcome.name,
      polls: 0, // Polymarket doesn't have traditional polls
      bettingMarkets: outcome.probability * 100,
      color: getPartyColor(outcome.name),
      party: getPartyFromName(outcome.name),
    }));
  } catch (error) {
    console.warn("Failed to fetch Polymarket data:", error);
    return [];
  }
}

/**
 * Helper: Get color based on party
 */
function getPartyColor(name: string): string {
  const upper = name.toUpperCase();
  if (upper.includes("DEM") || upper.includes("BLUE") || upper.includes("HARRIS")) {
    return "#3b82f6"; // Blue
  }
  if (upper.includes("REP") || upper.includes("RED") || upper.includes("TRUMP")) {
    return "#ef4444"; // Red
  }
  return "#8b5cf6"; // Purple
}

/**
 * Helper: Get party from candidate name
 */
function getPartyFromName(name: string): string {
  const upper = name.toUpperCase();
  if (upper.includes("DEM")) return "Democratic";
  if (upper.includes("REP")) return "Republican";
  return "Independent";
}
