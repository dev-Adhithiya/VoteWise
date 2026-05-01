/**
 * ==========================================================================
 * INTERACTIVE CHECKLIST — Voter Readiness Checklist
 * ==========================================================================
 * Region-aware voter readiness checklist with glowing gold checkboxes.
 * Syncs with Google Tasks API for persistent storage across devices.
 *
 * Logic: US varies by state, UK requires Photo ID/Voter Authority
 * Certificate, India requires EPIC/Aadhaar. Never displays or asks for
 * sensitive ID digits.
 */
"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import type { ChecklistItem } from "@/types";

/* Region-specific checklist configurations */
const CHECKLISTS: Record<string, ChecklistItem[]> = {
  US: [
    {
      id: "us-1",
      label: "Confirm voter registration status",
      checked: false,
      helpText: "Visit vote.org/verify to check your registration",
    },
    {
      id: "us-2",
      label: "Verify your polling location",
      checked: false,
      helpText: "Your polling place may have changed since the last election",
    },
    {
      id: "us-3",
      label: "Check voter ID requirements for your state",
      checked: false,
      helpText:
        "Requirements vary by state — some require photo ID, others accept utility bills",
    },
    {
      id: "us-4",
      label: "Review your sample ballot",
      checked: false,
      helpText: "Research candidates and ballot measures before you go",
    },
    {
      id: "us-5",
      label: "Plan your transportation to the polls",
      checked: false,
      helpText: "Know your route, parking options, or public transit schedule",
    },
    {
      id: "us-6",
      label: "Know your rights as a voter",
      checked: false,
      helpText:
        "You can ask for a provisional ballot if there are issues at the polls",
    },
    {
      id: "us-7",
      label: "Check early voting and mail-in ballot options",
      checked: false,
      helpText:
        "Many states offer early voting or no-excuse absentee ballots",
    },
  ],
  UK: [
    {
      id: "uk-1",
      label: "Confirm you are on the electoral register",
      checked: false,
      helpText: "Contact your local council to check registration",
    },
    {
      id: "uk-2",
      label: "Obtain accepted Photo ID",
      checked: false,
      helpText:
        "Passport, driving licence, or free Voter Authority Certificate",
    },
    {
      id: "uk-3",
      label: "Apply for Voter Authority Certificate if needed",
      checked: false,
      helpText: "Free from your local council if you lack photo ID",
    },
    {
      id: "uk-4",
      label: "Know your polling station location",
      checked: false,
      helpText: "Check your polling card for location details",
    },
    {
      id: "uk-5",
      label: "Bring your poll card (recommended)",
      checked: false,
      helpText: "Not required but speeds up the process",
    },
  ],
  IN: [
    {
      id: "in-1",
      label: "Verify name on electoral roll",
      checked: false,
      helpText: "Check at nvsp.in or your local election office",
    },
    {
      id: "in-2",
      label: "Obtain EPIC (Voter ID Card)",
      checked: false,
      helpText: "Apply online at nvsp.in if you don't have one",
    },
    {
      id: "in-3",
      label: "Keep valid photo ID ready",
      checked: false,
      helpText: "EPIC, Aadhaar, Passport, or other government photo ID",
    },
    {
      id: "in-4",
      label: "Locate your polling booth",
      checked: false,
      helpText: "Check your assigned booth on the voter slip",
    },
    {
      id: "in-5",
      label: "Check voting date for your constituency",
      checked: false,
      helpText: "Elections are held in phases across different dates",
    },
  ],
};

interface InteractiveChecklistProps {
  /** Region code for checklist selection */
  region?: string;
}

export default function InteractiveChecklist({
  region = "US",
}: InteractiveChecklistProps) {
  const { data: session } = useSession();
  const [selectedRegion, setSelectedRegion] = useState(region);
  const [items, setItems] = useState<ChecklistItem[]>(
    CHECKLISTS[region] || CHECKLISTS.US
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [taskListId, setTaskListId] = useState<string | null>(null);
  const [taskMap, setTaskMap] = useState<Record<string, string>>({}); // Maps local ID to task ID

  useEffect(() => {
    setSelectedRegion(region);
  }, [region]);

  useEffect(() => {
    setItems(CHECKLISTS[selectedRegion] || CHECKLISTS.US);
  }, [selectedRegion]);

  // Fetch or create task list on mount
  useEffect(() => {
    if (!session?.user) return;

    const initializeTaskList = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const checklistItems = CHECKLISTS[selectedRegion] || CHECKLISTS.US;
        const response = await fetch("/api/tasks/checklist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ countryCode: selectedRegion }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to create task list");
        }

        const data = await response.json();

        if (data.success) {
          setTaskListId(data.taskListId);
          // Create mapping from local IDs to task IDs
          const newTaskMap: Record<string, string> = {};
          if (data.taskIds && Array.isArray(data.taskIds)) {
            checklistItems.forEach((item, index) => {
              if (data.taskIds[index]) {
                newTaskMap[item.id] = data.taskIds[index];
              }
            });
          }
          setTaskMap(newTaskMap);
        }
      } catch (err) {
        console.error("Failed to initialize task list:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to sync with Google Tasks"
        );
      } finally {
        setIsLoading(false);
      }
    };

    initializeTaskList();
  }, [session?.user, selectedRegion]);

  /** Toggle a checklist item's checked state and sync with Google Tasks */
  const toggleItem = async (id: string) => {
    const currentItem = items.find((item) => item.id === id);
    const nextChecked = currentItem ? !currentItem.checked : false;

    // Update local state
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, checked: nextChecked } : item
      )
    );

    // Sync with Google Tasks if available
    if (session?.user && taskListId && taskMap[id]) {
      try {
        const response = await fetch("/api/tasks/checklist", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            taskListId,
            taskId: taskMap[id],
            completed: nextChecked,
          }),
        });

        if (!response.ok) {
          console.error("Failed to update task");
        }
      } catch (err) {
        console.error("Failed to sync task update:", err);
      }
    }
  };

  /** Switch to a different region's checklist */
  const switchRegion = (newRegion: string) => {
    setSelectedRegion(newRegion);
    setTaskListId(null);
    setTaskMap({});
  };

  const completedCount = items.filter((i) => i.checked).length;
  const progress = (completedCount / items.length) * 100;

  return (
    <div className="glass-panel rounded-2xl p-6 max-w-lg w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3
          className="text-lg font-bold text-white"
          style={{ fontFamily: "var(--font-outfit)" }}
        >
          ✅ Voter Readiness Checklist
        </h3>
        {/* Region Selector */}
        <div className="flex gap-1">
          {Object.keys(CHECKLISTS).map((r) => (
            <button
              key={r}
              onClick={() => switchRegion(r)}
              disabled={isLoading}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all disabled:opacity-50
                ${
                  selectedRegion === r
                    ? "bg-accent-blue text-white"
                    : "bg-white/5 text-foreground-muted hover:bg-white/10 hover:text-white"
                } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue/50`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Error message if sync failed */}
      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 mb-4">
          <p className="text-red-300 text-xs">{error}</p>
        </div>
      )}

      {/* Google Tasks sync indicator */}
      {session?.user && taskListId && (
        <div className="text-xs text-green-300 mb-3 flex items-center gap-2">
          <span>✓</span>
          <span>Syncing with Google Tasks</span>
        </div>
      )}

      {/* Progress Bar */}
      <div className="w-full h-2 bg-white/5 rounded-full mb-5 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-gold-dim to-gold"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          style={
            progress > 0
              ? { boxShadow: "0 0 10px rgba(255,215,0,0.4)" }
              : undefined
          }
        />
      </div>
      <p className="text-xs text-foreground-muted mb-4">
        {completedCount} of {items.length} completed
      </p>

      {/* Checklist Items */}
      <ul className="space-y-2" role="list">
        {isLoading ? (
          <li className="flex items-center justify-center py-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-5 h-5 border-2 border-accent-blue/30 border-t-accent-blue rounded-full"
            />
          </li>
        ) : (
          items.map((item, index) => (
            <motion.li
              key={item.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors group"
            >
              {/* Gold Checkbox */}
              <input
                type="checkbox"
                checked={item.checked}
                onChange={() => toggleItem(item.id)}
                disabled={isLoading}
                className="gold-checkbox mt-0.5 disabled:opacity-50"
                aria-label={item.label}
                id={`check-${item.id}`}
              />
              <div className="flex-1 min-w-0">
                <label
                  htmlFor={`check-${item.id}`}
                  className={`text-sm font-medium cursor-pointer block transition-colors
                    ${
                      item.checked
                        ? "text-foreground-muted line-through"
                        : "text-foreground"
                    }`}
                >
                  {item.label}
                </label>
                {item.helpText && (
                  <p className="text-xs text-foreground-muted mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.helpText}
                  </p>
                )}
              </div>
            </motion.li>
          ))
        )}
      </ul>

      {/* Sign in prompt if not authenticated */}
      {!session?.user && (
        <div className="mt-4 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
          <p className="text-blue-300 text-xs">
            Sign in with Google to sync your checklist across devices
          </p>
        </div>
      )}
    </div>
  );
}
