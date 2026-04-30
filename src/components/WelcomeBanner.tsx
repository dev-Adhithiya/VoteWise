/**
 * ==========================================================================
 * WELCOME BANNER — Shortcut Cards
 * ==========================================================================
 * 
 * Displays 4 large glassmorphic shortcut cards at the start of the chat
 * area, before any messages have been sent. Each card represents a common
 * election-related question that users can click to instantly ask.
 * 
 * Design Decisions:
 * - Cards use glass-panel-interactive for hover lift + glow
 * - Framer Motion staggered entrance animation (slide-up + fade)
 * - Responsive grid: 2x2 on desktop, stacked on mobile
 * - Disappears once the first message is sent (controlled by parent)
 * - Large emoji icons for instant visual recognition
 * 
 * @param onCardClick - Callback fired with the card's question text
 */
"use client";

import React from "react";
import { motion } from "framer-motion";

/* --------------------------------------------------------------------------
   SHORTCUT CARD DATA
   4 cards with emoji, question text, and a brief description.
   These represent the most common voter questions.
   -------------------------------------------------------------------------- */
const SHORTCUT_CARDS = [
  {
    id: "ballot",
    emoji: "🗳️",
    question: "Who is on my ballot?",
    description: "Find candidates running in your district",
    gradient: "from-blue-500/20 to-purple-500/20",
  },
  {
    id: "ready",
    emoji: "✅",
    question: "Am I ready to vote?",
    description: "Check your registration and ID requirements",
    gradient: "from-green-500/20 to-emerald-500/20",
  },
  {
    id: "polling",
    emoji: "📍",
    question: "Where is my polling station?",
    description: "Get directions to your nearest voting location",
    gradient: "from-orange-500/20 to-red-500/20",
  },
  {
    id: "winning",
    emoji: "📊",
    question: "Who is winning the race?",
    description: "View latest polls and prediction markets",
    gradient: "from-purple-500/20 to-pink-500/20",
  },
] as const;

/* --------------------------------------------------------------------------
   ANIMATION VARIANTS
   Staggered children entrance: each card fades in and slides up
   with a slight delay between them for a polished reveal effect.
   -------------------------------------------------------------------------- */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1, // 100ms delay between each card
      delayChildren: 0.2,   // 200ms initial delay before first card
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

/* --------------------------------------------------------------------------
   COMPONENT PROPS
   -------------------------------------------------------------------------- */
interface WelcomeBannerProps {
  /** Callback when a shortcut card is clicked — sends the question to chat */
  onCardClick: (question: string) => void;
}

/* --------------------------------------------------------------------------
   WELCOME BANNER COMPONENT
   -------------------------------------------------------------------------- */
export default function WelcomeBanner({ onCardClick }: WelcomeBannerProps) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 px-4 py-8">
      {/* Hero Title */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="text-center mb-10"
      >
        <h1
          className="text-4xl md:text-5xl font-bold text-white mb-3"
          style={{ fontFamily: "var(--font-outfit)" }}
        >
          Vote<span className="text-accent-blue">Wise</span> AI
        </h1>
        <p className="text-foreground-dim text-lg max-w-md mx-auto">
          Your intelligent guide to elections. Ask anything about voting,
          candidates, or the electoral process.
        </p>
      </motion.div>

      {/* Shortcut Cards Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl w-full"
        role="list"
        aria-label="Quick questions to get started"
      >
        {SHORTCUT_CARDS.map((card) => (
          <motion.button
            key={card.id}
            variants={cardVariants}
            whileHover={{ scale: 1.03, y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onCardClick(card.question)}
            className={`glass-panel-interactive rounded-2xl p-6 text-left
                       bg-gradient-to-br ${card.gradient}
                       focus-visible:outline-none focus-visible:ring-2 
                       focus-visible:ring-accent-blue/50`}
            role="listitem"
            aria-label={card.question}
          >
            {/* Emoji Icon */}
            <span className="text-3xl mb-3 block" aria-hidden="true">
              {card.emoji}
            </span>

            {/* Question Text */}
            <h3 className="text-white font-semibold text-base mb-1">
              {card.question}
            </h3>

            {/* Description */}
            <p className="text-foreground-muted text-sm">
              {card.description}
            </p>
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
}
