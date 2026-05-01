/**
 * ==========================================================================
 * GEMINI CHAT — Main Chat Interface Component
 * ==========================================================================
 * Full chat interface with message history, Gemini API integration,
 * tool result rendering, markdown support, and ARIA live regions.
 * 
 * Enhanced with:
 * - Location context (country-aware features)
 * - Google Calendar, Tasks, Maps, Civic API integration
 * - Gemini Search Grounding for candidate research
 * - Polling data and prediction markets
 * 
 * Architecture:
 * - Maintains full message history in state
 * - Sends messages to /api/chat endpoint
 * - Renders tool results as interactive UI components inline
 * - Auto-scrolls to bottom on new messages
 * - ARIA live region announces new messages to screen readers
 */
"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import ChatMessage from "./ChatMessage";
import TypingIndicator from "./TypingIndicator";
import WelcomeBanner from "./WelcomeBanner";
import InteractiveChecklist from "./InteractiveChecklist";
import VotingRouteMap from "./VotingRouteMap";
import CandidateCards from "./CandidateCards";
import PollingChart from "./PollingChart";
import VerdictCard from "./VerdictCard";
import GoogleWalletButton from "./GoogleWalletButton";
import ElectionReminderModal from "./ElectionReminderModal";
import DossierModal from "./DossierModal";
import type { Location, CountryCode } from "@/lib/geolocation";
import type {
  ChatMessage as ChatMessageType,
  ToolResult,
  Candidate,
  PollingDataPoint,
} from "@/types";

/* --------------------------------------------------------------------------
   COMPONENT
   -------------------------------------------------------------------------- */
interface GeminiChatProps {
  /** Externally injected message (from sidebar or welcome cards) */
  injectedMessage?: string;
  /** Callback to clear the injected message after processing */
  onInjectedMessageProcessed?: () => void;
  /** User location from parent (login-gated) */
  location?: Location | null;
  /** Country code from location detection */
  country?: CountryCode;
  /** Whether geolocation prompts are allowed */
  allowGeolocation?: boolean;
}

export default function GeminiChat({
  injectedMessage,
  onInjectedMessageProcessed,
  location,
  country,
  allowGeolocation = false,
}: GeminiChatProps) {
  const resolvedCountry = country || "UNKNOWN";
  const fallbackRegion = resolvedCountry === "UNKNOWN" ? "US" : resolvedCountry;

  /* -- State Management -- */
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [showDossierModal, setShowDossierModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<string>("");
  const [pollingLocation, setPollingLocation] = useState<{
    address: string;
    latitude: number;
    longitude: number;
  } | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [pollingData, setPollingData] = useState<PollingDataPoint[]>([]);

  /* -- Refs -- */
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /* Auto-scroll to bottom when messages change */
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  /* Handle externally injected messages (from sidebar / welcome cards) */
  useEffect(() => {
    if (injectedMessage) {
      sendMessage(injectedMessage);
      onInjectedMessageProcessed?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [injectedMessage]);

  /**
   * Send a message to the Gemini API and handle the response.
   * Includes location context for country-aware features.
   */
  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    /* Hide welcome banner on first message */
    setShowWelcome(false);

    /* Create and add user message */
    const userMessage: ChatMessageType = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text.trim(),
      timestamp: new Date().toISOString(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputValue("");
    setIsLoading(true);

    try {
      /* Call the chat API endpoint with location context */
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          location: {
            latitude: location?.latitude || 0,
            longitude: location?.longitude || 0,
            countryCode: resolvedCountry,
            address: location?.city ? `${location.city}, ${location.country}` : undefined,
          },
        }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok || !data) {
        const message = data?.text || data?.error || "Failed to fetch chat response";
        throw new Error(message);
      }

      /* Create assistant message with any tool results */
      const assistantMessage: ChatMessageType = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.text,
        timestamp: new Date().toISOString(),
        toolResults: data.toolResults || [],
      };

      setMessages((prev) => [...prev, assistantMessage]);

      /* Handle specific tool results that trigger UI interactions */
      if (data.toolResults) {
        for (const result of data.toolResults) {
          if (result.toolType === "getElectionReminder") {
            setShowReminderModal(true);
          } else if (result.toolType === "getLocalCandidates") {
            setCandidates((result.data.candidates as Candidate[]) || []);
          } else if (result.toolType === "getPollingData") {
            setPollingData((result.data.results as PollingDataPoint[]) || []);
          } else if (result.toolType === "getPollingRoute") {
            const nearest = (result.data.nearest as any) || {
              address: result.data.stationName,
              latitude: result.data.stationLat,
              longitude: result.data.stationLng,
            };

            if (
              nearest &&
              typeof nearest.address === "string" &&
              typeof nearest.latitude === "number" &&
              typeof nearest.longitude === "number"
            ) {
              setPollingLocation({
                address: nearest.address,
                latitude: nearest.latitude,
                longitude: nearest.longitude,
              });
            }
          }
        }
      }
    } catch (error: any) {
      console.error("Failed to send message:", error);
      const errorMessage: ChatMessageType = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: error?.message || "I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  /** Handle form submission */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  /** Handle Enter key (submit) and Shift+Enter (newline) */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  };

  /** Handle clicking a candidate's "Research" button */
  const handleResearchCandidate = (candidate: Candidate) => {
    setSelectedCandidate(candidate.name);
    setShowDossierModal(true);
  };

  /**
   * Renders tool result UI components inline within the chat.
   * Each tool type maps to a specific interactive component.
   */
  const renderToolResult = (result: ToolResult, index: number) => {
    switch (result.toolType) {
      case "setupVoterChecklist":
        return (
          <InteractiveChecklist
            key={index}
            region={(result.data.region as string) || fallbackRegion}
          />
        );
      case "getPollingRoute":
        {
          const nearest = (result.data.nearest as any) || {};
          const stationLat =
            typeof nearest.latitude === "number"
              ? nearest.latitude
              : (result.data.stationLat as number | undefined);
          const stationLng =
            typeof nearest.longitude === "number"
              ? nearest.longitude
              : (result.data.stationLng as number | undefined);
          const stationName =
            (nearest.name as string) || (result.data.stationName as string) || "Polling Station";
          const userLat =
            location?.latitude ??
            (result.data.userLocation as any)?.latitude ??
            (result.data.userLat as number | undefined);
          const userLng =
            location?.longitude ??
            (result.data.userLocation as any)?.longitude ??
            (result.data.userLng as number | undefined);

        return (
          <VotingRouteMap
            key={index}
            userLat={userLat}
            userLng={userLng}
            stationLat={stationLat}
            stationLng={stationLng}
            stationName={stationName}
            countryCode={resolvedCountry}
            allowGeolocation={allowGeolocation}
          />
        );
        }
      case "getLocalCandidates":
        return (
          <CandidateCards
            key={index}
            candidates={
              ((result.data.contests as any[])?.[0]?.candidates as Candidate[]) ||
              (result.data.candidates as Candidate[]) ||
              candidates
            }
            onResearch={handleResearchCandidate}
          />
        );
      case "getPollingData":
        {
          const chartData =
            (result.data.results as PollingDataPoint[]) || pollingData || [];
          const raceLabel = (result.data.race as string) || "Election";
        return (
          <PollingChart
            key={index}
            race={raceLabel}
            data={chartData}
          />
        );
        }
      case "verifyPoliticalClaim":
        return (
          <VerdictCard
            key={index}
            verdict={{
              claim: (result.data.claim as string) || "",
              claimant: (result.data.claimant as string) || "",
              rating: (result.data.rating as string) || "",
              verdictLevel:
                ((result.data.verdictLevel as any) || "unknown") as
                  | "true"
                  | "false"
                  | "misleading"
                  | "unknown",
              publisher: (result.data.publisher as string) || "",
              url: (result.data.url as string) || "",
            }}
          />
        );
      case "createWalletPass":
        return (
          <GoogleWalletButton
            key={index}
            pollingAddress={result.data.pollingAddress as string}
            electionDate={result.data.electionDate as string}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full flex-1 min-w-0">
      {/* MESSAGES AREA — scrollable container with all chat content */}
      <div
        className="flex-1 overflow-y-auto custom-scrollbar px-4 md:px-8 py-6"
        role="log"
        aria-label="Chat messages"
        aria-live="polite"
        aria-atomic="false"
      >
        {/* Welcome Banner — shown before any messages */}
        {showWelcome && messages.length === 0 && (
          <WelcomeBanner onCardClick={(q) => sendMessage(q)} />
        )}

        {/* Message List */}
        {messages.map((message) => (
          <div key={message.id}>
            <ChatMessage message={message} />
            {/* Render tool result components after the assistant message */}
            {message.toolResults && message.toolResults.length > 0 && (
              <div className="ml-11 mb-4 space-y-4">
                {message.toolResults.map((result, i) => renderToolResult(result, i))}
              </div>
            )}
          </div>
        ))}

        {/* Typing Indicator */}
        {isLoading && <TypingIndicator />}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT BAR — glassmorphic input with send button */}
      <div className="border-t border-white/5 p-4 md:px-8">
        <form onSubmit={handleSubmit} className="flex gap-3 max-w-4xl mx-auto">
          <div className="flex-1 glass-panel rounded-2xl flex items-center px-4 transition-all focus-within:border-accent-blue/30">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about elections, voting, candidates..."
              className="flex-1 bg-transparent text-foreground text-sm py-3.5 
                         outline-none placeholder:text-foreground-muted"
              disabled={isLoading}
              aria-label="Type your message"
              id="chat-input"
            />
          </div>

          {/* Send Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="px-5 py-3.5 rounded-2xl font-semibold text-white text-sm
                       bg-gradient-to-r from-accent-blue to-blue-600
                       hover:from-blue-500 hover:to-blue-700
                       disabled:opacity-40 disabled:cursor-not-allowed
                       transition-all duration-300 shadow-lg hover:shadow-accent-blue/25
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue/50
                       flex-shrink-0"
            aria-label="Send message"
          >
            {isLoading ? (
              <span className="animate-spin">⏳</span>
            ) : (
              "Send ↗"
            )}
          </motion.button>
        </form>
      </div>

      {/* MODALS */}
      <ElectionReminderModal
        isOpen={showReminderModal}
        onClose={() => setShowReminderModal(false)}
        countryCode={country}
        location={pollingLocation?.address}
      />
      <DossierModal
        isOpen={showDossierModal}
        onClose={() => setShowDossierModal(false)}
        candidateName={selectedCandidate}
      />
    </div>
  );
}
