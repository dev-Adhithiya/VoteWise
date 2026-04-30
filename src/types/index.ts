/* ==========================================================================
   TYPE DEFINITIONS
   Central type definitions for the Election Education Web Assistant.
   All interfaces and types used across components and API routes.
   ========================================================================== */

/* --------------------------------------------------------------------------
   CHAT MESSAGE TYPES
   Represents messages in the conversation between user and Gemini assistant.
   -------------------------------------------------------------------------- */

/** Role of the message sender in the conversation */
export type MessageRole = 'user' | 'assistant';

/** Represents a single chat message in the conversation history */
export interface ChatMessage {
  /** Unique identifier for the message */
  id: string;
  /** Who sent this message */
  role: MessageRole;
  /** The text content of the message (supports Markdown) */
  content: string;
  /** ISO timestamp of when the message was created */
  timestamp: string;
  /** Optional tool results attached to this message (e.g., candidate data, charts) */
  toolResults?: ToolResult[];
}

/** Result from a Gemini function call / tool invocation */
export interface ToolResult {
  /** Which tool was called (matches tool declaration names) */
  toolType: ToolType;
  /** The structured data returned by the tool */
  data: Record<string, unknown>;
}

/** All available tool types in the Gemini function calling setup */
export type ToolType =
  | 'getElectionReminder'
  | 'setupVoterChecklist'
  | 'getPollingRoute'
  | 'getLocalCandidates'
  | 'researchCandidatePlatform'
  | 'getPollingData'
  | 'fetchCandidateVideos'
  | 'verifyPoliticalClaim'
  | 'createWalletPass'
  | 'generateAudioSummary'
  | 'exportToGoogleDocs';

/* --------------------------------------------------------------------------
   ELECTION TIMELINE TYPES
   Represents steps in the 12-step election process timeline.
   -------------------------------------------------------------------------- */

/** Status of a timeline step */
export type TimelineStatus = 'completed' | 'in-progress' | 'upcoming';

/** A single step in the election timeline */
export interface TimelineStep {
  /** Step number (1–12) */
  number: number;
  /** Display label for the step */
  label: string;
  /** Current status of this step */
  status: TimelineStatus;
  /** Optional date/date range for the step */
  date?: string;
}

/* --------------------------------------------------------------------------
   CANDIDATE & CIVIC DATA TYPES
   Structures for candidate information from Google Civic API and research.
   -------------------------------------------------------------------------- */

/** A political candidate fetched from the Civic API */
export interface Candidate {
  /** Candidate's full name */
  name: string;
  /** Political party affiliation */
  party: string;
  /** Office they are running for */
  office: string;
  /** URL to candidate's photo (if available) */
  photoUrl?: string;
  /** Candidate's campaign website */
  website?: string;
  /** Phone number for the campaign */
  phone?: string;
  /** Email contact */
  email?: string;
}

/** Research dossier for a candidate (generated via Search Grounding) */
export interface CandidateDossier {
  /** Candidate's name */
  name: string;
  /** Key policy positions and campaign promises */
  platform: string[];
  /** Notable voting history items */
  votingHistory: string[];
  /** Recent news headlines with sources */
  recentNews: { headline: string; source: string; url?: string }[];
  /** YouTube video IDs for interviews/debates */
  videoIds?: string[];
}

/* --------------------------------------------------------------------------
   POLLING & MARKET DATA TYPES
   Structures for polling averages and prediction market odds.
   -------------------------------------------------------------------------- */

/** A single data point in the polling chart */
export interface PollingDataPoint {
  /** Candidate or party name */
  name: string;
  /** Traditional polling average percentage */
  polls: number;
  /** Prediction market odds percentage (e.g., Polymarket) */
  bettingMarkets: number;
  /** Party color for chart styling */
  color: string;
}

/* --------------------------------------------------------------------------
   VOTER CHECKLIST TYPES
   Region-aware voter readiness checklist items.
   -------------------------------------------------------------------------- */

/** A single item in the voter readiness checklist */
export interface ChecklistItem {
  /** Unique identifier */
  id: string;
  /** Display text for the checklist item */
  label: string;
  /** Whether this item has been checked off */
  checked: boolean;
  /** Help text explaining this requirement */
  helpText?: string;
  /** Which regions this item applies to */
  regions?: string[];
}

/* --------------------------------------------------------------------------
   FACT-CHECK VERDICT TYPES
   Structures for Google Fact Check Tools API results.
   -------------------------------------------------------------------------- */

/** Verdict level for a fact-check claim */
export type VerdictLevel = 'true' | 'false' | 'misleading' | 'unknown';

/** A fact-check verdict from the Fact Check Tools API */
export interface FactCheckVerdict {
  /** The claim that was checked */
  claim: string;
  /** The claimant (who made the claim) */
  claimant?: string;
  /** The verdict/rating text from the publisher */
  rating: string;
  /** Simplified verdict level for UI styling */
  verdictLevel: VerdictLevel;
  /** Name of the fact-checking organization */
  publisher: string;
  /** URL to the full fact-check article */
  url?: string;
}

/* --------------------------------------------------------------------------
   LANGUAGE & TRANSLATION TYPES
   -------------------------------------------------------------------------- */

/** Supported languages for UI localization */
export type SupportedLanguage = 'en' | 'es' | 'fr' | 'hi' | 'zh' | 'ar';

/** Translation dictionary for static UI text */
export interface TranslationDict {
  [key: string]: string;
}

/* --------------------------------------------------------------------------
   ELECTION REMINDER TYPES
   -------------------------------------------------------------------------- */

/** Data for creating a Google Calendar election reminder */
export interface ElectionReminder {
  /** Title of the calendar event */
  title: string;
  /** ISO date string for the event */
  date: string;
  /** Description/notes for the event */
  description: string;
  /** Location (polling station address if known) */
  location?: string;
}

/* --------------------------------------------------------------------------
   API RESPONSE TYPES
   Standard response shapes from our Next.js API routes.
   -------------------------------------------------------------------------- */

/** Standard API response wrapper */
export interface ApiResponse<T = unknown> {
  /** Whether the request was successful */
  success: boolean;
  /** Response data (present on success) */
  data?: T;
  /** Error message (present on failure) */
  error?: string;
}

/** Chat API response from /api/chat */
export interface ChatApiResponse {
  /** The assistant's text response */
  text: string;
  /** Any tool results that should trigger UI components */
  toolResults?: ToolResult[];
}
