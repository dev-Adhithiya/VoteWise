/**
 * ==========================================================================
 * CHAT MESSAGE — Individual Message Component
 * ==========================================================================
 * 
 * Renders a single chat message with role-based styling (user vs assistant).
 * Supports Markdown rendering with custom components that enforce the
 * strict styling requirements:
 * - Bold all key terms (handled by Gemini's response formatting)
 * - Render dates/times in Gold (#FFD700) with text-glow effect
 * - Support for lists, code blocks, links, and other markdown elements
 * 
 * Design Decisions:
 * - User messages: right-aligned with subtle blue-tinted glass
 * - Assistant messages: left-aligned with wider glass panel
 * - Custom ReactMarkdown components for gold date highlighting
 * - Framer Motion fade-in animation on mount
 * - ARIA attributes for screen reader compatibility
 * 
 * @param message - The ChatMessage object to render
 */
"use client";

import React from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion } from "framer-motion";
import type { ChatMessage as ChatMessageType } from "@/types";

/* --------------------------------------------------------------------------
   DATE/TIME REGEX PATTERN
   Matches common date and time formats to apply gold glow styling.
   Patterns matched:
   - "January 5, 2026", "Jan 5, 2026"
   - "11/05/2026", "2026-11-05"
   - "November 2026"
   - "Nov 3"
   - "Election Day" and other election-specific date references
   -------------------------------------------------------------------------- */
const DATE_REGEX = /(\b(?:January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2}(?:,?\s+\d{4})?|\d{1,2}\/\d{1,2}\/\d{2,4}|\d{4}-\d{2}-\d{2}|\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}\b|Election Day|Inauguration Day)/g;

/**
 * Processes text content to wrap date/time patterns in gold-glow spans.
 * This is called by the custom ReactMarkdown text renderer to ensure
 * all dates are visually highlighted per the design requirements.
 * 
 * @param text - Raw text to process
 * @returns Array of React nodes with dates wrapped in styled spans
 */
function highlightDates(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  /* Reset regex state for global matching */
  DATE_REGEX.lastIndex = 0;

  while ((match = DATE_REGEX.exec(text)) !== null) {
    /* Add any text before this match */
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    /* Wrap the matched date in a gold-glow span */
    parts.push(
      <span key={match.index} className="text-gold-glow font-semibold">
        {match[0]}
      </span>
    );
    lastIndex = match.index + match[0].length;
  }

  /* Add any remaining text after the last match */
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
}

/* --------------------------------------------------------------------------
   CUSTOM MARKDOWN COMPONENTS
   These override ReactMarkdown's default renderers to apply our
   Obsidian Frost styling. Key customizations:
   - <strong> tags get a white glow effect
   - <p> tags process text for date highlighting
   - <a> tags are styled as accent-blue links
   - <ul>/<ol> get proper spacing and bullet styling
   - <code> blocks use glass-panel styling
   -------------------------------------------------------------------------- */
/* eslint-disable @typescript-eslint/no-explicit-any */
const markdownComponents: Components = {
  /* Paragraphs — process text children for date highlighting */
  p: ({ children }: any) => {
    const processChildren = (child: React.ReactNode): React.ReactNode => {
      if (typeof child === "string") return <>{highlightDates(child)}</>;
      return child;
    };
    return (
      <p className="mb-3 leading-relaxed text-foreground">
        {React.Children.map(children, processChildren)}
      </p>
    );
  },
  strong: ({ children }: any) => (
    <strong className="font-bold text-white" style={{ textShadow: "0 0 8px rgba(255,255,255,0.1)" }}>{children}</strong>
  ),
  a: ({ href, children }: any) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-accent-blue hover:text-accent-blue-light underline underline-offset-2 transition-colors">{children}</a>
  ),
  ul: ({ children }: any) => (
    <ul className="list-disc list-inside space-y-1.5 mb-3 ml-2 text-foreground-dim">{children}</ul>
  ),
  ol: ({ children }: any) => (
    <ol className="list-decimal list-inside space-y-1.5 mb-3 ml-2 text-foreground-dim">{children}</ol>
  ),
  li: ({ children }: any) => {
    const processChildren = (child: React.ReactNode): React.ReactNode => {
      if (typeof child === "string") return <>{highlightDates(child)}</>;
      return child;
    };
    return <li className="text-foreground-dim">{React.Children.map(children, processChildren)}</li>;
  },
  code: ({ children }: any) => (
    <code className="bg-white/10 text-accent-blue-light px-1.5 py-0.5 rounded text-sm font-mono">{children}</code>
  ),
  pre: ({ children }: any) => (
    <pre className="glass-panel rounded-xl p-4 mb-3 overflow-x-auto text-sm">{children}</pre>
  ),
  h1: ({ children }: any) => (
    <h1 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: "var(--font-outfit)" }}>{children}</h1>
  ),
  h2: ({ children }: any) => (
    <h2 className="text-xl font-bold text-white mb-2" style={{ fontFamily: "var(--font-outfit)" }}>{children}</h2>
  ),
  h3: ({ children }: any) => (
    <h3 className="text-lg font-semibold text-white mb-2">{children}</h3>
  ),
  hr: () => <hr className="border-white/10 my-4" />,
  blockquote: ({ children }: any) => (
    <blockquote className="border-l-2 border-accent-blue/50 pl-4 my-3 text-foreground-dim italic">{children}</blockquote>
  ),
};
/* eslint-enable @typescript-eslint/no-explicit-any */

/* --------------------------------------------------------------------------
   COMPONENT PROPS
   -------------------------------------------------------------------------- */
interface ChatMessageProps {
  /** The message data to render */
  message: ChatMessageType;
}

/* --------------------------------------------------------------------------
   CHAT MESSAGE COMPONENT
   -------------------------------------------------------------------------- */
export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`flex items-start gap-3 mb-4 ${isUser ? "flex-row-reverse" : ""}`}
    >
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center 
                    flex-shrink-0 mt-1 text-xs font-bold
                    ${isUser
            ? "bg-purple-500/20 border border-purple-500/30 text-purple-400"
            : "bg-accent-blue/20 border border-accent-blue/30 text-accent-blue"
          }`}
        aria-hidden="true"
      >
        {isUser ? "You" : "AI"}
      </div>

      {/* Message Bubble */}
      <div
        className={`max-w-[80%] rounded-2xl px-5 py-3.5
                    ${isUser
            ? "glass-panel bg-blue-500/5 rounded-tr-md border-blue-500/10"
            : "glass-panel rounded-tl-md"
          }`}
      >
        {isUser ? (
          /* User messages — plain text, no markdown processing needed */
          <p className="text-foreground text-sm leading-relaxed">
            {message.content}
          </p>
        ) : (
          /* Assistant messages — full markdown rendering with custom components */
          <div className="text-sm prose-invert max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={markdownComponents}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        )}

        {/* Timestamp */}
        <div
          className={`text-[10px] mt-2 text-foreground-muted ${isUser ? "text-right" : ""}`}
        >
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>
    </motion.div>
  );
}
