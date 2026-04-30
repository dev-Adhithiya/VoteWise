/**
 * ==========================================================================
 * VERDICT CARD — Fact-Check Result Display
 * ==========================================================================
 * Displays fact-check results from Google Fact Check Tools API.
 * Color-coded border glow: Red=False, Yellow=Misleading, Green=True.
 * Cites the source organization.
 */
"use client";

import React from "react";
import { motion } from "framer-motion";
import type { FactCheckVerdict, VerdictLevel } from "@/types";

/** Maps verdict level to CSS class and display text */
const VERDICT_STYLES: Record<VerdictLevel, { className: string; label: string; emoji: string }> = {
  true: { className: "verdict-true", label: "Verified True", emoji: "✅" },
  false: { className: "verdict-false", label: "False", emoji: "❌" },
  misleading: { className: "verdict-misleading", label: "Misleading", emoji: "⚠️" },
  unknown: { className: "", label: "Unverified", emoji: "❓" },
};

interface VerdictCardProps {
  verdict: FactCheckVerdict;
}

export default function VerdictCard({ verdict }: VerdictCardProps) {
  const style = VERDICT_STYLES[verdict.verdictLevel] || VERDICT_STYLES.unknown;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={`glass-panel rounded-2xl p-6 max-w-lg w-full border ${style.className}`}
    >
      {/* Verdict Header */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-3xl">{style.emoji}</span>
        <div>
          <h3 className="text-white font-bold text-base" style={{ fontFamily: "var(--font-outfit)" }}>
            Fact Check Result
          </h3>
          <p className={`text-sm font-semibold ${
            verdict.verdictLevel === "true" ? "text-green-400" :
            verdict.verdictLevel === "false" ? "text-red-400" :
            verdict.verdictLevel === "misleading" ? "text-yellow-400" : "text-foreground-muted"
          }`}>
            {style.label}
          </p>
        </div>
      </div>

      {/* Claim Text */}
      <div className="bg-white/5 rounded-xl p-4 mb-4">
        <p className="text-xs text-foreground-muted mb-1">Claim:</p>
        <p className="text-foreground text-sm italic">&ldquo;{verdict.claim}&rdquo;</p>
        {verdict.claimant && (
          <p className="text-xs text-foreground-muted mt-2">— {verdict.claimant}</p>
        )}
      </div>

      {/* Rating */}
      <div className="mb-3">
        <p className="text-xs text-foreground-muted mb-1">Publisher Rating:</p>
        <p className="text-white text-sm font-medium">{verdict.rating}</p>
      </div>

      {/* Source */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-foreground-muted">Source: <span className="text-foreground-dim">{verdict.publisher}</span></p>
        {verdict.url && (
          <a
            href={verdict.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-accent-blue hover:text-accent-blue-light transition-colors"
          >
            Read Full Article →
          </a>
        )}
      </div>
    </motion.div>
  );
}
