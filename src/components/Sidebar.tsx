/**
 * ==========================================================================
 * SIDEBAR COMPONENT — "Ask About" Menu
 * ==========================================================================
 * 
 * A vertical, dark glassmorphic sidebar containing 8 numbered election
 * topics. When a user clicks a topic, it injects that topic as a message
 * into the chat input, prompting the AI to respond about that subject.
 * 
 * Design Decisions:
 * - Numbers styled in bright accent blue for visual hierarchy
 * - Text in gray/white for readability on dark glass
 * - Hover effect: subtle glass highlight + slight scale
 * - Full keyboard accessibility (tab-indexing, Enter/Space activation)
 * - Collapsible to hamburger on mobile via CSS + state toggle
 * 
 * @param onTopicSelect - Callback fired when a topic is clicked
 * @param isOpen - Whether the sidebar is visible (mobile responsive)
 * @param onToggle - Callback to toggle sidebar visibility on mobile
 */
"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";

/* --------------------------------------------------------------------------
   SIDEBAR MENU ITEMS
   Exactly 8 topics as specified in the requirements.
   Each item has a 2-digit number prefix and descriptive label.
   -------------------------------------------------------------------------- */
const SIDEBAR_ITEMS = [
  { number: "01", label: "Voter Registration" },
  { number: "02", label: "Key Dates & Deadlines" },
  { number: "03", label: "Primary vs General" },
  { number: "04", label: "Electoral College" },
  { number: "05", label: "Voter ID Requirements" },
  { number: "06", label: "Mail-In Voting" },
  { number: "07", label: "Vote Counting & Certification" },
  { number: "08", label: "Be a Poll Worker" },
] as const;

/* --------------------------------------------------------------------------
   COMPONENT PROPS
   -------------------------------------------------------------------------- */
interface SidebarProps {
  /** Callback when a topic is selected — injects the topic into chat */
  onTopicSelect: (topic: string) => void;
  /** Whether the sidebar is open (relevant for mobile responsive view) */
  isOpen: boolean;
  /** Toggle the sidebar open/closed on mobile */
  onToggle: () => void;
}

/* --------------------------------------------------------------------------
   SIDEBAR COMPONENT
   -------------------------------------------------------------------------- */
export default function Sidebar({ onTopicSelect, isOpen, onToggle }: SidebarProps) {
  /**
   * Handles clicking a sidebar item.
   * Constructs a natural-language prompt from the topic label and
   * passes it to the parent component via onTopicSelect callback.
   */
  const handleItemClick = (label: string) => {
    onTopicSelect(`Tell me about ${label}`);
    // On mobile, close the sidebar after selection
    if (window.innerWidth < 768) {
      onToggle();
    }
  };

  /**
   * Handles keyboard activation (Enter/Space) for accessibility.
   * Ensures sidebar items are fully keyboard-navigable.
   */
  const handleKeyDown = (e: React.KeyboardEvent, label: string) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleItemClick(label);
    }
  };

  return (
    <>
      {/* 
        MOBILE HAMBURGER BUTTON
        Only visible on small screens. Toggles sidebar visibility.
      */}
      <button
        onClick={onToggle}
        className="fixed top-4 left-4 z-50 md:hidden glass-panel rounded-xl p-3 
                   hover:bg-white/10 transition-colors"
        aria-label={isOpen ? "Close menu" : "Open menu"}
        aria-expanded={isOpen}
      >
        <div className="w-5 h-0.5 bg-white mb-1.5 transition-transform" />
        <div className="w-5 h-0.5 bg-white mb-1.5 transition-opacity" />
        <div className="w-5 h-0.5 bg-white transition-transform" />
      </button>

      {/* 
        MOBILE OVERLAY
        Darkened backdrop shown when sidebar is open on mobile.
        Clicking it closes the sidebar.
      */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-black/50 md:hidden"
            onClick={onToggle}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* 
        SIDEBAR PANEL
        Fixed on desktop, slide-in on mobile.
        Contains the "ASK ABOUT" header and all 8 topic items.
      */}
      <aside
        className={`glass-sidebar h-full w-64 flex-shrink-0 flex flex-col
                    transition-transform duration-300 ease-in-out
                    fixed md:relative z-40
                    ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
        role="navigation"
        aria-label="Election topics menu"
      >
        {/* Sidebar Header */}
        <div className="p-6 pb-4 border-b border-white/5">
          <h2
            className="text-xs font-semibold tracking-[0.3em] uppercase text-accent-blue"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            Ask About
          </h2>
        </div>

        {/* Topic Items List */}
        <nav className="flex-1 overflow-y-auto custom-scrollbar py-2">
          <ul className="space-y-0.5" role="list">
            {SIDEBAR_ITEMS.map((item, index) => (
              <li key={item.number}>
                <motion.div
                  /* Staggered entrance animation when sidebar first mounts */
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleItemClick(item.label)}
                  onKeyDown={(e) => handleKeyDown(e, item.label)}
                  className="flex items-center gap-3 px-6 py-3.5 mx-2 rounded-xl
                             cursor-pointer transition-all duration-200
                             hover:bg-white/5 focus-visible:bg-white/5
                             focus-visible:outline-none focus-visible:ring-2 
                             focus-visible:ring-accent-blue/50 focus-visible:ring-inset
                             group"
                  aria-label={`Ask about ${item.label}`}
                >
                  {/* Number badge — bright accent blue */}
                  <span className="text-accent-blue font-mono text-sm font-bold 
                                   min-w-[24px] group-hover:text-accent-blue-light 
                                   transition-colors">
                    {item.number}
                  </span>

                  {/* Topic label — gray/white text */}
                  <span className="text-foreground-dim text-sm font-medium
                                   group-hover:text-foreground transition-colors">
                    {item.label}
                  </span>
                </motion.div>
              </li>
            ))}
          </ul>
        </nav>

        {/* Sidebar Footer — Branding */}
        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-2 px-2">
            <div className="w-2 h-2 rounded-full bg-accent-blue animate-pulse-glow" />
            <span className="text-xs text-foreground-muted font-medium">
              VoteWise AI
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
