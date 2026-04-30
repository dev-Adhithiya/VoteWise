/**
 * ==========================================================================
 * GEMINI CHAT — Main Chat Interface Component
 * ==========================================================================
 * Full chat interface with message history, Gemini API integration,
 * tool result rendering, markdown support, and ARIA live regions.
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
import type { ChatMessage as ChatMessageType, ToolResult, Candidate } from "@/types";

/* --------------------------------------------------------------------------
   COMPONENT
   -------------------------------------------------------------------------- */
interface GeminiChatProps {
  /** Externally injected message (from sidebar or welcome cards) */
  injectedMessage?: string;
  /** Callback to clear the injected message after processing */
  onInjectedMessageProcessed?: () => void;
}

export default function GeminiChat({ injectedMessage, onInjectedMessageProcessed }: GeminiChatProps) {
  /* -- State Management -- */
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [showDossierModal, setShowDossierModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<string>("");

  /* -- Refs -- */
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /* Auto-scroll to bottom when messages change */
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, isLoading, scrollToBottom]);

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
   * Manages the full lifecycle: add user message → show typing →
   * call API → process tool results → add assistant message.
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
      /* Call the chat API endpoint */
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await response.json();

      /* Create assistant message with any tool results */
      const assistantMessage: ChatMessageType = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.text,
        timestamp: new Date().toISOString(),
        toolResults: data.toolResults || [],
      };

      setMessages((prev) => [...prev, assistantMessage]);

      /* Handle specific tool results that trigger UI components */
      if (data.toolResults) {
        for (const result of data.toolResults) {
          if (result.toolType === "getElectionReminder") {
            setShowReminderModal(true);
          }
        }
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      const errorMessage: ChatMessageType = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: "I'm having trouble connecting right now. Please try again in a moment.",
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
        return <InteractiveChecklist key={index} region={(result.data.region as string) || "US"} />;
      case "getPollingRoute":
        return (
          <VotingRouteMap
            key={index}
            userLat={result.data.userLat as number}
            userLng={result.data.userLng as number}
            stationLat={result.data.stationLat as number}
            stationLng={result.data.stationLng as number}
            stationName={result.data.stationName as string}
          />
        );
      case "getLocalCandidates":
        return (
          <CandidateCards
            key={index}
            candidates={result.data.candidates as Candidate[]}
            onResearch={handleResearchCandidate}
          />
        );
      case "getPollingData":
        return <PollingChart key={index} data={result.data.results as Array<{ name: string; polls: number; bettingMarkets: number; color: string }>} />;
      case "verifyPoliticalClaim":
        return (
          <VerdictCard
            key={index}
            verdict={{
              claim: result.data.claim as string,
              claimant: result.data.claimant as string,
              rating: result.data.rating as string,
              verdictLevel: result.data.verdictLevel as "true" | "false" | "misleading" | "unknown",
              publisher: result.data.publisher as string,
              url: result.data.url as string,
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
      <ElectionReminderModal isOpen={showReminderModal} onClose={() => setShowReminderModal(false)} />
      <DossierModal isOpen={showDossierModal} onClose={() => setShowDossierModal(false)} candidateName={selectedCandidate} />
    </div>
  );
}
