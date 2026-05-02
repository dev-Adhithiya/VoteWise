/**
 * ==========================================================================
 * MAIN DASHBOARD PAGE — page.tsx
 * ==========================================================================
 * The primary page of the VoteWise AI Election Education Assistant.
 * Assembles all components into a cohesive dashboard layout:
 * 
 * Layout Structure:
 * ┌──────────┬──────────────────────────────────────┐
 * │          │  [Language Toggle]              Top   │
 * │ Sidebar  │  ┌──────────────────────────────┐    │
 * │ (Ask     │  │     Chat / Welcome Banner    │    │
 * │  About)  │  │     + Tool Result UIs        │    │
 * │          │  └──────────────────────────────┘    │
 * │          │  [Chat Input Bar]                    │
 * │          │  [Election Timeline] (collapsible)   │
 * └──────────┴──────────────────────────────────────┘
 * 
 * Responsive: Sidebar collapses to hamburger on mobile.
 * State: All shared state managed here, passed via props.
 */
"use client";

import React, { useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import Sidebar from "@/components/Sidebar";
import GeminiChat from "@/components/GeminiChat";
import dynamic from "next/dynamic";
import LanguageToggle from "@/components/LanguageToggle";

const ElectionTimeline = dynamic(() => import("@/components/ElectionTimeline"), { ssr: false });
import LoginButton from "@/components/LoginButton";
import TasksPanel from "@/components/TasksPanel";
import { useUserLocation, LocationStatus } from "@/components/LocationDetector";
import type { SupportedLanguage } from "@/types";

export default function DashboardPage() {
  /* -- Sidebar State -- */
  const [sidebarOpen, setSidebarOpen] = useState(false);

  /* -- Tasks Panel State -- */
  const [tasksOpen, setTasksOpen] = useState(false);

  /* -- Language State -- */
  const [language, setLanguage] = useState<SupportedLanguage>("en");

  /* -- Injected Message State (from sidebar/cards) -- */
  const [injectedMessage, setInjectedMessage] = useState<string>("");

  /* -- Auth State -- */
  const { data: session } = useSession();
  const isAuthed = !!session?.user;

  /* -- Location Detection -- */
  const {
    location,
    country,
    isLoading: locationLoading,
  } = useUserLocation({ enabled: isAuthed });

  /**
   * Handle topic selection from the sidebar.
   * Sets the injected message which GeminiChat picks up and sends.
   */
  const handleTopicSelect = useCallback((topic: string) => {
    setInjectedMessage(topic);
  }, []);

  /**
   * Clear the injected message after GeminiChat has processed it.
   * Prevents re-sending on re-renders.
   */
  const handleInjectedMessageProcessed = useCallback(() => {
    setInjectedMessage("");
  }, []);

  /**
   * Toggle handlers for panels to prevent unnecessary re-renders.
   */
  const handleToggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  const handleToggleTasks = useCallback(() => {
    setTasksOpen((prev) => !prev);
  }, []);

  return (
    <>
      {/* ================================================================
          SIDEBAR — Fixed left panel with election topics
          ================================================================ */}
      <Sidebar
        onTopicSelect={handleTopicSelect}
        isOpen={sidebarOpen}
        onToggle={handleToggleSidebar}
      />

      {/* ================================================================
          MAIN CONTENT AREA — Chat + Timeline
          ================================================================ */}
      <main className="flex-1 flex flex-col min-w-0 h-full" role="main">
        {/* ──────────────────────────────────────────────────────────────
            TOP BAR — App title + Language toggle
            ────────────────────────────────────────────────────────────── */}
        <header className="flex items-center justify-between px-4 md:px-8 py-3 border-b border-white/5 flex-shrink-0">
          {/* App Title — visible on desktop, hidden on mobile (hamburger takes precedence) */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-accent-blue to-blue-600 
                              flex items-center justify-center shadow-lg shadow-accent-blue/20">
                <span className="text-white text-sm font-bold">V</span>
              </div>
              <h1
                className="text-lg font-bold text-white"
                style={{ fontFamily: "var(--font-outfit)" }}
              >
                Vote<span className="text-accent-blue">Wise</span> AI
              </h1>
            </div>
            {/* Mobile spacer for hamburger menu */}
            <div className="w-12 md:hidden" />
          </div>

          {/* Right side controls */}
          <div className="flex items-center gap-3">
            {/* Location Status */}
            {isAuthed ? (
              <LocationStatus
                location={location}
                isLoading={locationLoading}
                className="hidden md:flex"
              />
            ) : (
              <span className="hidden md:inline text-xs text-foreground-muted">
                Sign in to enable location
              </span>
            )}

            {/* Status indicator */}
            <div className="hidden sm:flex items-center gap-2 glass-panel rounded-full px-3 py-1.5">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-foreground-dim font-medium">Online</span>
            </div>

            {/* Language Toggle */}
            <LanguageToggle
              currentLang={language}
              onLanguageChange={setLanguage}
            />

            {/* Tasks Toggle */}
            <button
              onClick={handleToggleTasks}
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors
                ${
                  tasksOpen
                    ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-200"
                    : "bg-white/5 border-white/10 text-foreground-muted hover:bg-white/10 hover:text-white"
                }`}
              aria-pressed={tasksOpen}
            >
              {tasksOpen ? "Hide Tasks" : "Tasks"}
            </button>

            {/* Login Button */}
            <LoginButton compact />
          </div>
        </header>

        {/* ──────────────────────────────────────────────────────────────
            CHAT AREA — Takes up remaining vertical space
            ────────────────────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col min-h-0">
          <GeminiChat
            injectedMessage={injectedMessage}
            onInjectedMessageProcessed={handleInjectedMessageProcessed}
            location={location}
            country={country}
            allowGeolocation={isAuthed}
          />
        </div>

        {/* ──────────────────────────────────────────────────────────────
            ELECTION TIMELINE — Collapsible bottom section
            ────────────────────────────────────────────────────────────── */}
        <div className="border-t border-white/5 px-4 md:px-8 py-3 flex-shrink-0">
          <ElectionTimeline countryCode={country} />
        </div>
      </main>

      <TasksPanel
        isOpen={tasksOpen}
        onToggle={handleToggleTasks}
        countryCode={country}
      />
    </>
  );
}
