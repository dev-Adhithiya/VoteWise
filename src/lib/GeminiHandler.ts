/**
 * ==========================================================================
 * GEMINI HANDLER — AI Engine & Tool Declarations
 * ==========================================================================
 * Server-side utility managing Gemini SDK initialization, conversation
 * history, Search Grounding config, and all Tool (function) declarations.
 * Uses gemini-1.5-flash for fast, cost-effective responses.
 */

import { GoogleGenerativeAI, type FunctionDeclaration, SchemaType } from "@google/generative-ai";

/* --------------------------------------------------------------------------
   TOOL DECLARATIONS
   All tools are defined natively in the Gemini SDK format.
   Each tool has a name, description, and parameter schema.
   -------------------------------------------------------------------------- */
export const TOOL_DECLARATIONS: FunctionDeclaration[] = [
  {
    name: "getElectionReminder",
    description: "Calculate the next Election Day date and create a calendar reminder. Call this when user wants to set an election reminder or asks about election dates.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        country: { type: SchemaType.STRING, description: "Country code (US, UK, IN)" },
      },
      required: ["country"],
    },
  },
  {
    name: "setupVoterChecklist",
    description: "Generate a region-aware voter readiness checklist. Call when user asks if they are ready to vote or needs a voting checklist.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        region: { type: SchemaType.STRING, description: "Region code: US, UK, or IN" },
      },
      required: ["region"],
    },
  },
  {
    name: "getPollingRoute",
    description: "Find the nearest polling station and generate navigation route. Call when user asks about polling station location.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        latitude: { type: SchemaType.NUMBER, description: "User latitude" },
        longitude: { type: SchemaType.NUMBER, description: "User longitude" },
        address: { type: SchemaType.STRING, description: "User address if provided" },
      },
      required: ["latitude", "longitude"],
    },
  },
  {
    name: "getLocalCandidates",
    description: "Fetch local candidates for the user's district using Civic API. Call when user asks who is on their ballot.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        address: { type: SchemaType.STRING, description: "User's registered voting address" },
      },
      required: ["address"],
    },
  },
  {
    name: "researchCandidatePlatform",
    description: "Research a specific candidate's platform, voting history, and recent news using Search Grounding.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        candidateName: { type: SchemaType.STRING, description: "Full name of the candidate" },
        office: { type: SchemaType.STRING, description: "Office the candidate is running for" },
      },
      required: ["candidateName"],
    },
  },
  {
    name: "getPollingData",
    description: "Get latest polling averages AND prediction market odds for an election race. Returns raw JSON for chart rendering.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        race: { type: SchemaType.STRING, description: "The election race to query" },
      },
      required: ["race"],
    },
  },
  {
    name: "fetchCandidateVideos",
    description: "Search YouTube for recent candidate interviews or debate videos. Returns video IDs.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        candidateName: { type: SchemaType.STRING, description: "Candidate name to search" },
      },
      required: ["candidateName"],
    },
  },
  {
    name: "verifyPoliticalClaim",
    description: "Fact-check a political claim or rumor using Fact Check Tools API. Call when user asks to verify a quote or rumor.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        claim: { type: SchemaType.STRING, description: "The claim or quote to verify" },
      },
      required: ["claim"],
    },
  },
  {
    name: "createWalletPass",
    description: "Create a Google Wallet pass with polling station address and election date.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        pollingAddress: { type: SchemaType.STRING, description: "Polling station address" },
        electionDate: { type: SchemaType.STRING, description: "Election date" },
      },
      required: ["pollingAddress", "electionDate"],
    },
  },
  {
    name: "generateAudioSummary",
    description: "Generate a TTS audio summary of candidate information for accessibility.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        text: { type: SchemaType.STRING, description: "Text to synthesize to speech" },
        candidateName: { type: SchemaType.STRING, description: "Candidate name for context" },
      },
      required: ["text"],
    },
  },
  {
    name: "exportToGoogleDocs",
    description: "Export the user's voting plan to Google Docs including polling address, ID checklist, and candidate choices.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        pollingAddress: { type: SchemaType.STRING, description: "Polling station address" },
        checklist: { type: SchemaType.STRING, description: "Voter readiness checklist items" },
        candidates: { type: SchemaType.STRING, description: "Selected candidate preferences" },
      },
      required: ["pollingAddress"],
    },
  },
];

/* --------------------------------------------------------------------------
   SYSTEM PROMPT
   Instructs Gemini to act as an election education expert with specific
   formatting requirements (bold key terms, gold dates, markdown).
   -------------------------------------------------------------------------- */
const SYSTEM_PROMPT = `You are VoteWise AI, an expert election education assistant. Your role is to help voters understand the electoral process, find their polling station, research candidates, verify political claims, and prepare to vote.

**Formatting Rules (STRICTLY FOLLOW):**
- **Bold all key terms** using markdown bold syntax
- Always mention specific dates in a clear format like "November 5, 2024" or "January 20, 2025"
- Use markdown formatting: headers, bullet lists, numbered lists
- Be concise but thorough — aim for well-structured, scannable responses
- When discussing candidates, be balanced and non-partisan
- Never ask for or display sensitive ID numbers (SSN, Aadhaar digits, etc.)
- When a user asks about voting requirements, consider their region (US by default)
- Use the available tools when appropriate to provide interactive experiences

**Tool Usage Guidelines:**
- Use getElectionReminder when users want calendar reminders
- Use setupVoterChecklist when users ask "Am I ready to vote?"
- Use getPollingRoute when users ask about polling station locations
- Use getLocalCandidates when users ask "Who is on my ballot?"
- Use getPollingData when users ask about polls or who is winning
- Use verifyPoliticalClaim when users ask to fact-check something
- Use researchCandidatePlatform when users want candidate details

Be helpful, accurate, and encouraging about civic participation.`;

/* --------------------------------------------------------------------------
   GEMINI CLIENT INITIALIZATION
   Creates and exports a configured Gemini model instance.
   -------------------------------------------------------------------------- */
export function createGeminiModel() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error("GEMINI_API_KEY is missing from environment variables.");
    return null;
  }

  // Log the first few characters of the API key for debugging (safe)
  console.log(`Initializing Gemini with key starting with: ${apiKey.substring(0, 7)}...`);

  const genAI = new GoogleGenerativeAI(apiKey);

  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    tools: [{ functionDeclarations: TOOL_DECLARATIONS }],
    systemInstruction: SYSTEM_PROMPT,
  });

  return model;
}

/* --------------------------------------------------------------------------
   TOOL EXECUTION
   Processes function calls from Gemini and returns mock/real results.
   In production, these would call actual Google APIs.
   -------------------------------------------------------------------------- */
function handleGetPollingRoute(args: Record<string, unknown>) {
  const rawLat = typeof args.latitude === "number" ? args.latitude : Number(args.latitude);
  const rawLng = typeof args.longitude === "number" ? args.longitude : Number(args.longitude);
  const userLat = Number.isFinite(rawLat) ? rawLat : 38.8977;
  const userLng = Number.isFinite(rawLng) ? rawLng : -77.0365;
  const stationLat = userLat + 0.008;
  const stationLng = userLng + 0.005;
  const stationName = "District Community Center";
  const address = "123 Democracy Ave, Suite 100";
  const navigationUrl = `https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLng}&destination=${encodeURIComponent(address)}&travelmode=driving`;

  return {
    toolType: "getPollingRoute",
    data: {
      stationName,
      stationLat,
      stationLng,
      userLat,
      userLng,
      nearest: {
        name: stationName,
        address,
        latitude: stationLat,
        longitude: stationLng,
        distance: 1.2,
        navigationUrl,
      },
      allLocations: [
        {
          name: stationName,
          address,
          latitude: stationLat,
          longitude: stationLng,
          distance: 1.2,
          navigationUrl,
        },
      ],
      userLocation: { latitude: userLat, longitude: userLng },
    },
  };
}

export async function executeToolCall(
  functionName: string,
  args: Record<string, unknown>
): Promise<{ toolType: string; data: Record<string, unknown> }> {
  switch (functionName) {
    case "getElectionReminder":
      return {
        toolType: "getElectionReminder",
        data: {
          title: "Election Day Reminder",
          date: "2026-11-03",
          description: "Don't forget to vote! Check your polling location and bring valid ID.",
          country: args.country || "US",
        },
      };

    case "setupVoterChecklist":
      return {
        toolType: "setupVoterChecklist",
        data: { region: args.region || "US" },
      };

    case "getPollingRoute":
      return handleGetPollingRoute(args);


    case "getLocalCandidates":
      return {
        toolType: "getLocalCandidates",
        data: {
          candidates: [
            { name: "Alexandra Rivera", party: "Democratic", office: "U.S. Senate" },
            { name: "James Mitchell", party: "Republican", office: "U.S. Senate" },
            { name: "Sarah Chen", party: "Democratic", office: "U.S. House - District 7" },
            { name: "Robert Williams", party: "Republican", office: "U.S. House - District 7" },
            { name: "Maria Santos", party: "Independent", office: "Governor" },
          ],
          address: args.address,
        },
      };

    case "getPollingData":
      return {
        toolType: "getPollingData",
        data: {
          race: args.race,
          results: [
            { name: "Rivera (D)", polls: 48.2, bettingMarkets: 52.1, color: "#3B82F6" },
            { name: "Mitchell (R)", polls: 45.6, bettingMarkets: 44.3, color: "#EF4444" },
            { name: "Santos (I)", polls: 4.1, bettingMarkets: 3.2, color: "#A855F7" },
          ],
        },
      };

    case "verifyPoliticalClaim":
      return {
        toolType: "verifyPoliticalClaim",
        data: {
          claim: args.claim,
          claimant: "Unknown",
          rating: "This claim requires further context. Based on available fact-checks, the statement is partially accurate but lacks important nuance.",
          verdictLevel: "misleading",
          publisher: "FactCheck.org",
          url: "https://www.factcheck.org",
        },
      };

    case "researchCandidatePlatform":
      return {
        toolType: "researchCandidatePlatform",
        data: {
          name: args.candidateName,
          platform: [
            "Expand access to affordable healthcare",
            "Invest in clean energy infrastructure",
            "Reform student loan programs",
          ],
          votingHistory: [
            "Voted YES on Infrastructure Investment Act",
            "Voted NO on proposed budget cuts",
          ],
          recentNews: [
            { headline: "Candidate leads in latest polls", source: "AP News" },
            { headline: "New policy proposal announced", source: "Reuters" },
          ],
          videoIds: ["dQw4w9WgXcQ"],
        },
      };

    case "fetchCandidateVideos":
      return {
        toolType: "fetchCandidateVideos",
        data: { videoIds: ["dQw4w9WgXcQ", "jNQXAC9IVRw", "M7lc1UVf-VE"] },
      };

    case "createWalletPass":
      return {
        toolType: "createWalletPass",
        data: { pollingAddress: args.pollingAddress, electionDate: args.electionDate },
      };

    case "generateAudioSummary":
      return {
        toolType: "generateAudioSummary",
        data: { audioUrl: "/demo-audio.mp3", candidateName: args.candidateName },
      };

    case "exportToGoogleDocs":
      return {
        toolType: "exportToGoogleDocs",
        data: { docUrl: "https://docs.google.com/document/d/demo", exported: true },
      };

    default:
      return { toolType: functionName, data: { error: "Unknown tool" } };
  }
}
