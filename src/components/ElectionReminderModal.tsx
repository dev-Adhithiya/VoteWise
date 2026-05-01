/**
 * ==========================================================================
 * ELECTION REMINDER MODAL
 * ==========================================================================
 * Glassmorphic modal for adding Election Day to Google Calendar.
 * Integrates with Google Calendar API via OAuth tokens.
 * Country-aware election date calculation.
 */
"use client";

import React, { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";

interface ElectionReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  countryCode?: string;
  location?: string;
}

export default function ElectionReminderModal({
  isOpen,
  onClose,
  countryCode = "US",
  location,
}: ElectionReminderModalProps) {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  React.useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen, handleEscape]);

  const handleCreateEvent = async () => {
    if (!session?.user) {
      window.location.href = "/api/auth/signin";
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/calendar/create-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ countryCode }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create calendar event");
      }

      const data = await response.json();
      setSuccess(true);

      // Auto-close after 2 seconds
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  const countryNames: Record<string, string> = {
    US: "United States",
    UK: "United Kingdom",
    IN: "India",
  };

  const countryName = countryNames[countryCode] || "Your Country";

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
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-foreground-muted hover:text-white transition-colors text-xl rounded-lg p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue/50"
              aria-label="Close modal"
            >
              ✕
            </button>

            {!success ? (
              <>
                <div className="text-5xl mb-4 text-center">📅</div>
                <h2
                  className="text-2xl font-bold text-white text-center mb-2"
                  style={{ fontFamily: "var(--font-outfit)" }}
                >
                  Election Day Reminder
                </h2>

                <div className="space-y-3 mb-6">
                  {/* Country */}
                  <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <p className="text-xs text-blue-300 uppercase font-semibold mb-1">
                      Country
                    </p>
                    <p className="text-lg text-white font-semibold">{countryName}</p>
                  </div>

                  {/* Location if available */}
                  {location && (
                    <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                      <p className="text-xs text-green-300 uppercase font-semibold mb-1">
                        Polling Location
                      </p>
                      <p className="text-sm text-green-200">{location}</p>
                    </div>
                  )}

                  {/* Info */}
                  <p className="text-foreground-dim text-sm text-center leading-relaxed">
                    Add Election Day to your Google Calendar so you never forget to vote!
                  </p>

                  {/* Error if any */}
                  {error && (
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                      <p className="text-sm text-red-300">{error}</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-3">
                  {session?.user ? (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleCreateEvent}
                      disabled={isLoading}
                      className="w-full py-3.5 px-6 rounded-xl font-semibold text-white
                                 bg-gradient-to-r from-accent-blue to-blue-600 
                                 hover:from-blue-500 hover:to-blue-700 transition-all 
                                 duration-300 shadow-lg hover:shadow-accent-blue/25 
                                 focus-visible:outline-none focus-visible:ring-2 
                                 focus-visible:ring-accent-blue/50 disabled:opacity-50"
                    >
                      {isLoading ? "Adding..." : "🗓️ Add to Google Calendar"}
                    </motion.button>
                  ) : (
                    <button
                      onClick={() => (window.location.href = "/api/auth/signin")}
                      className="w-full py-3.5 px-6 rounded-xl font-semibold text-white
                                 bg-gradient-to-r from-accent-blue to-blue-600 
                                 hover:from-blue-500 hover:to-blue-700 transition-all"
                    >
                      🔐 Sign In to Add Event
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    className="w-full py-3 px-6 rounded-xl font-medium text-foreground-dim 
                               hover:text-white bg-white/5 hover:bg-white/10 transition-all 
                               focus-visible:outline-none focus-visible:ring-2 
                               focus-visible:ring-accent-blue/50"
                  >
                    Maybe Later
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Success state */}
                <div className="text-center py-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="w-16 h-16 rounded-full bg-green-500/20 border-2 border-green-500
                               flex items-center justify-center mx-auto mb-4"
                  >
                    <span className="text-3xl">✓</span>
                  </motion.div>
                  <h3 className="text-xl font-bold text-green-300 mb-2">Event Added!</h3>
                  <p className="text-sm text-white/60">
                    Election Day reminder added to your Google Calendar
                  </p>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
