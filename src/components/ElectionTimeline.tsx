/**
 * ==========================================================================
 * ELECTION TIMELINE — Interactive 12-Step Visual Component
 * ==========================================================================
 * 
 * A horizontal scrollable timeline showing the 12 major steps in the
 * U.S. election process, from Announcement through Inauguration.
 * 
 * Key Features:
 * - "In Progress" step has a Framer Motion pulsing glow animation
 * - Completed steps show solid accent color
 * - Upcoming steps are dimmed/muted
 * - Horizontal scroll on mobile, full width on desktop
 * - Connecting lines between nodes with gradient coloring
 * - Collapsible via toggle button to save vertical space
 * 
 * Design Decisions:
 * - Uses Framer Motion `animate` with infinite repeat for the pulse
 * - Glass-panel container with custom scrollbar
 * - Each node is a circle with a connecting line to the next
 */
"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import type { TimelineStep } from "@/types";

/* --------------------------------------------------------------------------
   TIMELINE DATA
   12 steps in the U.S. presidential election cycle.
   The "status" field determines visual styling:
   - completed: solid accent blue, checkmark
   - in-progress: pulsing glow animation
   - upcoming: dimmed/muted appearance
   -------------------------------------------------------------------------- */
const TIMELINE_STEPS: TimelineStep[] = [
  { number: 1, label: "Announcement", status: "completed", date: "2024-2025" },
  { number: 2, label: "Candidate Filing", status: "completed", date: "Early 2025" },
  { number: 3, label: "Primary Debates", status: "completed", date: "Mid 2025" },
  { number: 4, label: "Primary Elections", status: "completed", date: "Feb-Jun 2026" },
  { number: 5, label: "National Conventions", status: "completed", date: "Jul-Aug 2026" },
  { number: 6, label: "General Debates", status: "in-progress", date: "Sep-Oct 2026" },
  { number: 7, label: "Early Voting Begins", status: "upcoming", date: "Oct 2026" },
  { number: 8, label: "Election Day", status: "upcoming", date: "Nov 3, 2026" },
  { number: 9, label: "Provisional Counting", status: "upcoming", date: "Nov 2026" },
  { number: 10, label: "State Certification", status: "upcoming", date: "Dec 2026" },
  { number: 11, label: "Electoral College Vote", status: "upcoming", date: "Dec 2026" },
  { number: 12, label: "Inauguration", status: "upcoming", date: "Jan 20, 2027" },
];

/* --------------------------------------------------------------------------
   TIMELINE COMPONENT
   -------------------------------------------------------------------------- */
export default function ElectionTimeline() {
  /* State to toggle the timeline panel open/closed */
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="w-full">
      {/* Toggle Button — allows user to collapse/expand the timeline */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-foreground-muted text-xs 
                   uppercase tracking-widest mb-2 px-4 hover:text-foreground 
                   transition-colors focus-visible:outline-none 
                   focus-visible:ring-2 focus-visible:ring-accent-blue/50 
                   rounded-lg py-1"
        aria-expanded={isExpanded}
        aria-controls="election-timeline"
      >
        <span
          className={`transition-transform duration-300 ${isExpanded ? "rotate-90" : ""}`}
        >
          ▶
        </span>
        Election Timeline
      </button>

      {/* Timeline Panel — slides in/out with animation */}
      <motion.div
        id="election-timeline"
        initial={false}
        animate={{
          height: isExpanded ? "auto" : 0,
          opacity: isExpanded ? 1 : 0,
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="overflow-hidden"
      >
        <div
          className="glass-panel rounded-2xl p-4 md:p-6 overflow-x-auto 
                     custom-scrollbar"
          role="list"
          aria-label="Election process timeline"
        >
          {/* Horizontal scrollable timeline container */}
          <div className="flex items-start min-w-max gap-0">
            {TIMELINE_STEPS.map((step, index) => (
              <div
                key={step.number}
                className="flex items-start"
                role="listitem"
                aria-label={`Step ${step.number}: ${step.label} — ${step.status}`}
              >
                {/* Individual Step Node */}
                <div className="flex flex-col items-center w-24 md:w-28">
                  {/* Node Circle */}
                  {step.status === "in-progress" ? (
                    /* IN-PROGRESS: Animated pulsing glow using Framer Motion */
                    <motion.div
                      className="w-10 h-10 rounded-full bg-accent-blue flex items-center 
                                 justify-center text-white text-sm font-bold relative"
                      animate={{
                        boxShadow: [
                          "0 0 5px rgba(59,130,246,0.5), 0 0 10px rgba(59,130,246,0.3)",
                          "0 0 20px rgba(59,130,246,0.8), 0 0 40px rgba(59,130,246,0.4), 0 0 60px rgba(59,130,246,0.2)",
                          "0 0 5px rgba(59,130,246,0.5), 0 0 10px rgba(59,130,246,0.3)",
                        ],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      {step.number}
                    </motion.div>
                  ) : (
                    /* COMPLETED or UPCOMING: Static node */
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center 
                                  text-sm font-bold transition-all duration-300
                                  ${step.status === "completed"
                          ? "bg-accent-blue/80 text-white"
                          : "bg-white/5 text-foreground-muted border border-white/10"
                        }`}
                    >
                      {step.status === "completed" ? "✓" : step.number}
                    </div>
                  )}

                  {/* Step Label */}
                  <span
                    className={`text-xs mt-2 text-center leading-tight font-medium
                               ${step.status === "in-progress"
                        ? "text-accent-blue-light"
                        : step.status === "completed"
                          ? "text-foreground-dim"
                          : "text-foreground-muted"
                      }`}
                  >
                    {step.label}
                  </span>

                  {/* Date — shown below the label */}
                  {step.date && (
                    <span className="text-[10px] mt-1 text-gold-glow font-medium">
                      {step.date}
                    </span>
                  )}
                </div>

                {/* Connecting Line between steps (not after the last step) */}
                {index < TIMELINE_STEPS.length - 1 && (
                  <div className="flex items-center pt-5">
                    <div
                      className={`h-0.5 w-6 md:w-8 transition-colors duration-300
                                 ${step.status === "completed"
                          ? "bg-accent-blue/50"
                          : "bg-white/10"
                        }`}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
