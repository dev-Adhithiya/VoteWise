/**
 * ==========================================================================
 * CANDIDATE CARDS — Scrollable Candidate Row
 * ==========================================================================
 * Horizontal scrollable row of candidate cards from Civic API data.
 * Each card shows name, party, office, and a "Research Candidate" button
 * that triggers the dossier modal.
 */
"use client";

import React from "react";
import { motion } from "framer-motion";
import type { Candidate } from "@/types";

/** Demo candidates shown when no API data is available */
const DEMO_CANDIDATES: Candidate[] = [
  { name: "Alexandra Rivera", party: "Democratic", office: "U.S. Senate", photoUrl: "", website: "#" },
  { name: "James Mitchell", party: "Republican", office: "U.S. Senate", photoUrl: "", website: "#" },
  { name: "Sarah Chen", party: "Democratic", office: "U.S. House - District 7", photoUrl: "", website: "#" },
  { name: "Robert Williams", party: "Republican", office: "U.S. House - District 7", photoUrl: "", website: "#" },
  { name: "Maria Santos", party: "Independent", office: "Governor", photoUrl: "", website: "#" },
];

/** Maps party name to accent color for card styling */
const PARTY_COLORS: Record<string, string> = {
  Democratic: "from-blue-500/20 to-blue-600/10",
  Republican: "from-red-500/20 to-red-600/10",
  Independent: "from-purple-500/20 to-purple-600/10",
  Libertarian: "from-yellow-500/20 to-yellow-600/10",
  Green: "from-green-500/20 to-green-600/10",
};

const PARTY_TEXT_COLORS: Record<string, string> = {
  Democratic: "text-blue-400",
  Republican: "text-red-400",
  Independent: "text-purple-400",
  Libertarian: "text-yellow-400",
  Green: "text-green-400",
};

interface CandidateCardsProps {
  /** Array of candidates to display */
  candidates?: Candidate[];
  /** Callback when "Research Candidate" is clicked */
  onResearch: (candidate: Candidate) => void;
}

export default function CandidateCards({ candidates = DEMO_CANDIDATES, onResearch }: CandidateCardsProps) {
  return (
    <div className="w-full">
      <h3 className="text-lg font-bold text-white mb-3 px-1" style={{ fontFamily: "var(--font-outfit)" }}>
        🗳️ Candidates On Your Ballot
      </h3>
      {/* Horizontal scrollable row */}
      <div className="flex gap-3 overflow-x-auto custom-scrollbar pb-2">
        {candidates.map((candidate, index) => (
          <motion.div
            key={`${candidate.name}-${index}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.08 }}
            className={`glass-panel-interactive rounded-2xl p-5 min-w-[220px] max-w-[240px] flex-shrink-0
                        bg-gradient-to-br ${PARTY_COLORS[candidate.party] || "from-gray-500/20 to-gray-600/10"}`}
          >
            {/* Avatar Circle */}
            <div className="w-14 h-14 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-2xl mb-3 mx-auto">
              {candidate.photoUrl ? (
                <img src={candidate.photoUrl} alt={candidate.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                <span>👤</span>
              )}
            </div>
            {/* Name */}
            <h4 className="text-white font-semibold text-sm text-center mb-1">{candidate.name}</h4>
            {/* Party */}
            <p className={`text-xs text-center font-medium mb-1 ${PARTY_TEXT_COLORS[candidate.party] || "text-gray-400"}`}>
              {candidate.party}
            </p>
            {/* Office */}
            <p className="text-xs text-foreground-muted text-center mb-3">{candidate.office}</p>
            {/* Research Button */}
            <button
              onClick={() => onResearch(candidate)}
              className="w-full py-2 px-3 rounded-lg text-xs font-semibold text-accent-blue
                         bg-accent-blue/10 hover:bg-accent-blue/20 border border-accent-blue/20
                         hover:border-accent-blue/40 transition-all
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue/50"
            >
              Research Candidate 🔍
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
