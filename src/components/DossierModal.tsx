/**
 * ==========================================================================
 * DOSSIER MODAL — 3-Tab Candidate Research
 * ==========================================================================
 * Shows candidate's Platform, Voting History, and Recent News
 * Uses Gemini Search Grounding for current information
 * Glassmorphic design with smooth animations
 */
"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { CandidateDossier } from "@/types";

interface DossierModalProps {
  isOpen: boolean;
  candidateName: string;
  office?: string;
  onClose: () => void;
}

type TabType = "platform" | "history" | "news";

export default function DossierModal({
  isOpen,
  candidateName,
  office,
  onClose,
}: DossierModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>("platform");
  const [dossier, setDossier] = useState<CandidateDossier | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setDossier(null);
    setError(null);
  }, [isOpen, candidateName, office]);

  // Fetch candidate research when modal opens
  useEffect(() => {
    if (!isOpen || !candidateName.trim()) return;

    const fetchResearch = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/civic/research", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            candidateName,
            office,
          }),
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.statusText}`);
        }

        const data = await response.json();
        if (!data?.dossier) {
          throw new Error("No dossier returned from research API");
        }
        setDossier(data.dossier);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
        console.error("Research fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchResearch();
  }, [isOpen, candidateName, office]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      >
        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="glass-panel rounded-2xl border border-white/10 shadow-2xl shadow-blue-500/10
                     max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="border-b border-white/10 px-6 py-4 bg-gradient-to-r from-blue-500/10 to-blue-600/10">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">{candidateName}</h2>
                {office && (
                  <p className="text-sm text-blue-300 mt-1">
                    Candidate for {office}
                  </p>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <span className="text-2xl">✕</span>
              </button>
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full border-2 border-blue-500/30 border-t-blue-500 animate-spin mx-auto mb-4" />
                <p className="text-blue-300">Researching candidate...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="text-center">
                <p className="text-red-300 font-semibold mb-2">Research Failed</p>
                <p className="text-sm text-red-300/70">{error}</p>
                <button
                  onClick={onClose}
                  className="mt-4 px-4 py-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30
                             text-blue-300 font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          ) : dossier ? (
            <>
              {/* Tab Navigation */}
              <div className="flex border-b border-white/10 bg-white/5 px-6">
                {(["platform", "history", "news"] as TabType[]).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-3 text-sm font-medium transition-colors relative ${
                      activeTab === tab
                        ? "text-blue-300"
                        : "text-foreground-dim hover:text-white"
                    }`}
                  >
                    {tab === "platform"
                      ? "📋 Platform"
                      : tab === "history"
                        ? "📊 Voting History"
                        : "📰 Recent News"}

                    {activeTab === tab && (
                      <motion.div
                        layoutId="tab-indicator"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-blue-600"
                      />
                    )}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <AnimatePresence mode="wait">
                  {activeTab === "platform" && (
                    <motion.div
                      key="platform"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-3"
                    >
                      <h3 className="font-semibold text-blue-300 mb-4">
                        Policy Positions & Campaign Promises
                      </h3>
                      {dossier.platform && dossier.platform.length > 0 ? (
                        dossier.platform.map((item, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/15 transition-colors"
                          >
                            <p className="text-sm text-white">{item}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-foreground-dim">
                          No platform information available
                        </p>
                      )}
                    </motion.div>
                  )}

                  {activeTab === "history" && (
                    <motion.div
                      key="history"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-3"
                    >
                      <h3 className="font-semibold text-blue-300 mb-4">
                        Notable Voting Record
                      </h3>
                      {dossier.votingHistory &&
                      dossier.votingHistory.length > 0 ? (
                        dossier.votingHistory.map((item, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/15 transition-colors"
                          >
                            <p className="text-sm text-white">{item}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-foreground-dim">
                          No voting history available
                        </p>
                      )}
                    </motion.div>
                  )}

                  {activeTab === "news" && (
                    <motion.div
                      key="news"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-3"
                    >
                      <h3 className="font-semibold text-blue-300 mb-4">
                        Recent News Coverage
                      </h3>
                      {dossier.recentNews && dossier.recentNews.length > 0 ? (
                        dossier.recentNews.map((news, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/15 transition-colors"
                          >
                            <p className="text-sm font-medium text-white mb-1">
                              {news.headline}
                            </p>
                            <p className="text-xs text-amber-300/70">
                              Source: {news.source}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="text-foreground-dim">
                          No recent news available
                        </p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : null}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
