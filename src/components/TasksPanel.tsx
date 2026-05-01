"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useSession } from "next-auth/react";
import InteractiveChecklist from "./InteractiveChecklist";
import LoginButton from "./LoginButton";
import type { CountryCode } from "@/lib/geolocation";

interface TasksPanelProps {
  isOpen: boolean;
  onToggle: () => void;
  countryCode?: CountryCode;
}

function resolveRegion(countryCode?: CountryCode): string {
  if (!countryCode || countryCode === "UNKNOWN") {
    return "US";
  }
  return countryCode;
}

export default function TasksPanel({
  isOpen,
  onToggle,
  countryCode,
}: TasksPanelProps) {
  const { data: session } = useSession();
  const region = resolveRegion(countryCode);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-black/40 md:hidden"
            onClick={onToggle}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      <aside
        className={`fixed right-0 top-0 z-40 h-full w-[320px] max-w-full
          glass-panel border-l border-white/10 shadow-2xl
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "translate-x-full"}`}
        aria-hidden={!isOpen}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <h2
            className="text-sm font-semibold text-white tracking-wide"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            Tasks
          </h2>
          <button
            onClick={onToggle}
            className="px-2 py-1 rounded-md text-xs text-foreground-muted hover:text-white
              hover:bg-white/10 transition-colors"
            aria-label="Close tasks panel"
          >
            Close
          </button>
        </div>

        <div className="h-[calc(100%-52px)] overflow-y-auto p-4">
          {session?.user ? (
            <InteractiveChecklist region={region} />
          ) : (
            <div className="glass-panel rounded-2xl p-5 text-center">
              <p className="text-sm text-foreground mb-2">
                Sign in to view and sync your task list.
              </p>
              <p className="text-xs text-foreground-muted mb-4">
                Your checklist will sync with Google Tasks across devices.
              </p>
              <div className="flex justify-center">
                <LoginButton />
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
