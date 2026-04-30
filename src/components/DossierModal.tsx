/**
 * ==========================================================================
 * DOSSIER MODAL — 4-Tab Candidate Research Modal
 * ==========================================================================
 * Glassmorphic modal with 4 tabs:
 * 1. Promises/Platform — key policy positions
 * 2. Voting History — notable votes
 * 3. Recent News — latest headlines with sources
 * 4. Media — YouTube video carousel (embedded players)
 * Includes a TTS "Play" button for audio accessibility.
 */
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { CandidateDossier } from "@/types";

/** Demo dossier data for UI demonstration */
const DEMO_DOSSIER: CandidateDossier = {
  name: "Alexandra Rivera",
  platform: [
    "Expand access to affordable healthcare through a public option",
    "Invest $500B in clean energy infrastructure by 2030",
    "Reform student loan programs with income-based repayment caps",
    "Strengthen voting rights protections at the federal level",
    "Increase minimum wage to $17/hour indexed to inflation",
  ],
  votingHistory: [
    "Voted YES on the Infrastructure Investment and Jobs Act",
    "Voted YES on the Inflation Reduction Act (climate provisions)",
    "Voted NO on the proposed budget amendment to cut education funding",
    "Co-sponsored the Voting Rights Advancement Act",
    "Voted YES on the bipartisan gun safety legislation",
  ],
  recentNews: [
    { headline: "Rivera leads polls in key swing districts ahead of November", source: "Associated Press", url: "#" },
    { headline: "Senator Rivera proposes new clean energy tax credits for rural communities", source: "Reuters", url: "#" },
    { headline: "Rivera, Mitchell clash over healthcare policy in heated debate", source: "CNN", url: "#" },
    { headline: "Rivera campaign raises $12M in Q3, outpacing rivals", source: "Politico", url: "#" },
  ],
  videoIds: ["dQw4w9WgXcQ", "jNQXAC9IVRw", "M7lc1UVf-VE"],
};

const TABS = [
  { id: "platform", label: "Promises/Platform", icon: "📋" },
  { id: "history", label: "Voting History", icon: "📊" },
  { id: "news", label: "Recent News", icon: "📰" },
  { id: "media", label: "Media", icon: "🎬" },
] as const;

type TabId = (typeof TABS)[number]["id"];

interface DossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  dossier?: CandidateDossier;
  candidateName?: string;
}

export default function DossierModal({ isOpen, onClose, dossier = DEMO_DOSSIER, candidateName }: DossierModalProps) {
  const [activeTab, setActiveTab] = useState<TabId>("platform");
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const name = candidateName || dossier.name;

  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen, handleEscape]);

  /** Simulate TTS playback (would call /api/tts in production) */
  const handlePlayAudio = () => {
    setIsPlayingAudio(!isPlayingAudio);
    if (!isPlayingAudio) {
      setTimeout(() => setIsPlayingAudio(false), 5000);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 glass-modal-overlay"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={`Research dossier for ${name}`}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="glass-modal rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 pb-4 border-b border-white/5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white" style={{ fontFamily: "var(--font-outfit)" }}>
                  {name}
                </h2>
                <p className="text-xs text-foreground-muted mt-1">Candidate Research Dossier</p>
              </div>
              <div className="flex items-center gap-2">
                {/* TTS Play Button */}
                <button
                  onClick={handlePlayAudio}
                  className={`p-2.5 rounded-xl transition-all text-sm
                    ${isPlayingAudio
                      ? "bg-accent-blue text-white accent-glow"
                      : "bg-white/5 text-foreground-dim hover:bg-white/10 hover:text-white"
                    } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue/50`}
                  aria-label={isPlayingAudio ? "Stop audio summary" : "Play audio summary"}
                >
                  {isPlayingAudio ? "⏸️" : "🔊"} 
                </button>
                <button onClick={onClose} className="text-foreground-muted hover:text-white transition-colors text-xl rounded-lg p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue/50" aria-label="Close modal">✕</button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-white/5 px-6">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-3 px-4 text-xs font-semibold transition-all border-b-2
                    ${activeTab === tab.id
                      ? "text-accent-blue border-accent-blue"
                      : "text-foreground-muted border-transparent hover:text-foreground-dim"
                    } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue/50`}
                  role="tab"
                  aria-selected={activeTab === tab.id}
                >
                  <span className="mr-1">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Platform Tab */}
                  {activeTab === "platform" && (
                    <ul className="space-y-3">
                      {dossier.platform.map((item, i) => (
                        <li key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/5">
                          <span className="text-accent-blue font-bold text-sm mt-0.5">{i + 1}.</span>
                          <span className="text-foreground text-sm">{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Voting History Tab */}
                  {activeTab === "history" && (
                    <ul className="space-y-3">
                      {dossier.votingHistory.map((item, i) => (
                        <li key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/5">
                          <span className={`text-sm font-bold mt-0.5 ${item.includes("YES") ? "text-green-400" : item.includes("NO") ? "text-red-400" : "text-accent-blue"}`}>
                            {item.includes("YES") ? "✓" : item.includes("NO") ? "✗" : "•"}
                          </span>
                          <span className="text-foreground text-sm">{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* News Tab */}
                  {activeTab === "news" && (
                    <ul className="space-y-3">
                      {dossier.recentNews.map((item, i) => (
                        <li key={i} className="p-3 rounded-xl bg-white/5 hover:bg-white/8 transition-colors">
                          <a href={item.url} target="_blank" rel="noopener noreferrer" className="block">
                            <p className="text-foreground text-sm font-medium mb-1">{item.headline}</p>
                            <p className="text-foreground-muted text-xs">{item.source}</p>
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Media Tab — YouTube Embeds */}
                  {activeTab === "media" && (
                    <div className="flex gap-4 overflow-x-auto custom-scrollbar pb-2">
                      {(dossier.videoIds || []).map((videoId, i) => (
                        <div key={i} className="glass-panel rounded-xl overflow-hidden min-w-[280px] flex-shrink-0">
                          <iframe
                            src={`https://www.youtube.com/embed/${videoId}`}
                            className="w-full aspect-video"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            title={`${name} video ${i + 1}`}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
