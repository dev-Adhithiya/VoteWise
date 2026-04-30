/**
 * ==========================================================================
 * ELECTION REMINDER MODAL
 * ==========================================================================
 * Glassmorphic modal for adding Election Day to Google Calendar.
 * Auto-calculates the next Election Day (first Tuesday after first Monday in November).
 */
"use client";

import React, { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

/** Calculate next U.S. Election Day (first Tue after first Mon in Nov, even years) */
function getNextElectionDay(): Date {
  const now = new Date();
  let year = now.getFullYear();
  if (year % 2 !== 0) year += 1;

  const nov1 = new Date(year, 10, 1);
  const dayOfWeek = nov1.getDay();
  const daysToMon = dayOfWeek <= 1 ? (1 - dayOfWeek) : (8 - dayOfWeek);
  const electionDay = new Date(year, 10, 1 + daysToMon + 1);

  if (electionDay < now) {
    year += 2;
    const n1 = new Date(year, 10, 1);
    const d = n1.getDay();
    const dm = d <= 1 ? (1 - d) : (8 - d);
    return new Date(year, 10, 1 + dm + 1);
  }
  return electionDay;
}

/** Generate Google Calendar URL with pre-filled election event */
function makeCalendarUrl(date: Date): string {
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").split("T")[0];
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: "🗳️ Election Day — Don't Forget to Vote!",
    dates: `${fmt(date)}/${fmt(new Date(date.getTime() + 86400000))}`,
    details: "Today is Election Day! Have your voter ID ready and know your polling location.\n\nPowered by VoteWise AI",
    sf: "true",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

interface ElectionReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ElectionReminderModal({ isOpen, onClose }: ElectionReminderModalProps) {
  const electionDay = getNextElectionDay();
  const calendarUrl = makeCalendarUrl(electionDay);

  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen, handleEscape]);

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
          aria-label="Election Day Reminder"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="glass-modal rounded-3xl p-8 max-w-md w-full relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={onClose} className="absolute top-4 right-4 text-foreground-muted hover:text-white transition-colors text-xl rounded-lg p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue/50" aria-label="Close modal">✕</button>
            <div className="text-5xl mb-4 text-center">📅</div>
            <h2 className="text-2xl font-bold text-white text-center mb-2" style={{ fontFamily: "var(--font-outfit)" }}>Election Day Reminder</h2>
            <div className="text-center mb-6">
              <p className="text-foreground-dim mb-2">The next Election Day is:</p>
              <p className="text-gold-glow text-2xl font-bold">{electionDay.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
            </div>
            <p className="text-foreground-dim text-sm text-center mb-6 leading-relaxed">Add a reminder to your Google Calendar so you never miss an election.</p>
            <div className="flex flex-col gap-3">
              <a href={calendarUrl} target="_blank" rel="noopener noreferrer" className="w-full py-3.5 px-6 rounded-xl font-semibold text-white text-center bg-gradient-to-r from-accent-blue to-blue-600 hover:from-blue-500 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-accent-blue/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue/50">🗓️ Add to Google Calendar</a>
              <button onClick={onClose} className="w-full py-3 px-6 rounded-xl font-medium text-foreground-dim hover:text-white bg-white/5 hover:bg-white/10 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue/50">Maybe Later</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
