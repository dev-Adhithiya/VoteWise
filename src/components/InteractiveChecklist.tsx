/**
 * ==========================================================================
 * INTERACTIVE CHECKLIST — Voter Readiness Checklist
 * ==========================================================================
 * Region-aware voter readiness checklist with glowing gold checkboxes.
 * Syncs with Google Tasks API for persistent storage across devices.
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
      helpText: "Requirements vary by state — some require photo ID, others accept utility bills",
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
      helpText: "You can ask for a provisional ballot if there are issues at the polls",
    },
    {
      id: "us-7",
      label: "Check early voting and mail-in ballot options",
      checked: false,
      helpText: "Many states offer early voting or no-excuse absentee ballots",
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
      helpText: "Passport, driving licence, or free Voter Authority Certificate",
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
  region?: string;
}

export default function InteractiveChecklist({
  region = "US",
}: InteractiveChecklistProps) {
  const { data: session } = useSession();
  const [selectedRegion, setSelectedRegion] = useState(region);
  const [items, setItems] = useState<ChecklistItem[]>(CHECKLISTS[region] || CHECKLISTS.US);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [taskListId, setTaskListId] = useState<string | null>(null);
  const [taskMap, setTaskMap] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!session?.user) return;

    const initializeTaskList = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/tasks/checklist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ countryCode: selectedRegion }),
        });

        if (response.ok) {
          const data = await response.json();
          setTaskListId(data.taskListId);
          const newTaskMap: Record<string, string> = {};
          const currentChecklist = CHECKLISTS[selectedRegion] || CHECKLISTS.US;
          currentChecklist.forEach((item, index) => {
            if (data.taskIds && data.taskIds[index]) {
              newTaskMap[item.id] = data.taskIds[index];
            }
          });
          setTaskMap(newTaskMap);
        }
      } catch (err) {
        console.error("Failed to sync tasks:", err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeTaskList();
  }, [session?.user, selectedRegion]);

  const toggleItem = async (id: string) => {
    let nextChecked = false;
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          nextChecked = !item.checked;
          return { ...item, checked: nextChecked };
        }
        return item;
      })
    );

    if (session?.user && taskListId && taskMap[id]) {
      try {
        await fetch("/api/tasks/checklist", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            taskListId,
            taskId: taskMap[id],
            status: nextChecked ? "completed" : "needsAction",
          }),
        });
      } catch (err) {
        console.error("Failed to sync update:", err);
      }
    }
  };

  const switchRegion = (newRegion: string) => {
    setSelectedRegion(newRegion);
    setItems(CHECKLISTS[newRegion] || CHECKLISTS.US);
    setTaskListId(null);
    setTaskMap({});
  };

  const completedCount = items.filter((i) => i.checked).length;
  const progress = (completedCount / items.length) * 100;

  return (
    <div className="glass-panel rounded-2xl p-6 max-w-lg w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white" style={{ fontFamily: "var(--font-outfit)" }}>
          ✅ Voter Readiness Checklist
        </h3>
        <div className="flex gap-1">
          {Object.keys(CHECKLISTS).map((r) => (
            <button
              key={r}
              onClick={() => switchRegion(r)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all
                ${selectedRegion === r ? "bg-accent-blue text-white" : "bg-white/5 text-foreground-muted hover:bg-white/10"}`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full h-2 bg-white/5 rounded-full mb-2 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-accent-blue to-blue-600"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-xs text-foreground-muted mb-4">{completedCount} of {items.length} completed</p>

      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors group">
            <input
              type="checkbox"
              checked={item.checked}
              onChange={() => toggleItem(item.id)}
              className="mt-1"
              id={`check-${item.id}`}
            />
            <div className="flex-1 min-w-0">
              <label
                htmlFor={`check-${item.id}`}
                className={`text-sm font-medium cursor-pointer block ${item.checked ? "text-foreground-muted line-through" : "text-foreground"}`}
              >
                {item.label}
              </label>
              {item.helpText && (
                <p className="text-xs text-foreground-muted mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.helpText}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
