/**
 * ==========================================================================
 * TYPING INDICATOR — 3-Dot Pulse Animation
 * ==========================================================================
 * 
 * A smooth, glassmorphic 3-dot pulse animation displayed while the
 * Gemini model is processing a response. Creates a "thinking" effect
 * that reassures the user their request is being handled.
 * 
 * Design Decisions:
 * - Dots are styled as small circles with staggered CSS animations
 * - Container uses glass-panel styling for consistency
 * - ARIA attributes inform screen readers about the loading state
 * - Animation uses CSS keyframes (defined in globals.css) for performance
 */
"use client";

import React from "react";

/* --------------------------------------------------------------------------
   TYPING INDICATOR COMPONENT
   Renders 3 animated dots inside a glassmorphic pill shape.
   -------------------------------------------------------------------------- */
export default function TypingIndicator() {
  return (
    <div
      className="flex items-start gap-3 mb-4 animate-fade-in"
      role="status"
      aria-label="Assistant is typing"
    >
      {/* Avatar — small accent-blue circle representing the AI */}
      <div
        className="w-8 h-8 rounded-full bg-accent-blue/20 border border-accent-blue/30
                    flex items-center justify-center flex-shrink-0 mt-1"
        aria-hidden="true"
      >
        <span className="text-accent-blue text-xs font-bold">AI</span>
      </div>

      {/* Dots Container — glassmorphic pill */}
      <div className="glass-panel rounded-2xl rounded-tl-md px-5 py-4">
        <div className="flex gap-1.5">
          {/* 
            THREE ANIMATED DOTS
            Each dot has a staggered animation delay to create 
            a cascading bounce effect. Uses the typing-dot keyframe
            defined in globals.css.
          */}
          <span
            className="w-2.5 h-2.5 rounded-full bg-accent-blue/60"
            style={{ animation: "typing-dot 1.4s infinite", animationDelay: "0ms" }}
          />
          <span
            className="w-2.5 h-2.5 rounded-full bg-accent-blue/60"
            style={{ animation: "typing-dot 1.4s infinite", animationDelay: "200ms" }}
          />
          <span
            className="w-2.5 h-2.5 rounded-full bg-accent-blue/60"
            style={{ animation: "typing-dot 1.4s infinite", animationDelay: "400ms" }}
          />
        </div>
      </div>
    </div>
  );
}
