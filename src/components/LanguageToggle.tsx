/**
 * ==========================================================================
 * LANGUAGE TOGGLE — Top-Nav Language Selector
 * ==========================================================================
 * Glassmorphic dropdown for switching UI language.
 * Simulates Google Cloud Translation for static UI text.
 */
"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { SupportedLanguage } from "@/types";

const LANGUAGES: { code: SupportedLanguage; label: string; flag: string }[] = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "hi", label: "हिन्दी", flag: "🇮🇳" },
  { code: "zh", label: "中文", flag: "🇨🇳" },
  { code: "ar", label: "العربية", flag: "🇸🇦" },
];

interface LanguageToggleProps {
  currentLang: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
}

export default function LanguageToggle({ currentLang, onLanguageChange }: LanguageToggleProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const currentLangObj = LANGUAGES.find((l) => l.code === currentLang) || LANGUAGES[0];

  /* Close dropdown on outside click */
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="glass-panel rounded-xl px-3 py-2 flex items-center gap-2 text-sm
                   hover:bg-white/10 transition-colors
                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue/50"
        aria-label="Select language"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span>{currentLangObj.flag}</span>
        <span className="text-foreground-dim text-xs font-medium hidden sm:inline">{currentLangObj.label}</span>
        <span className={`text-foreground-muted text-xs transition-transform ${isOpen ? "rotate-180" : ""}`}>▼</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -5, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 glass-modal rounded-xl py-1 min-w-[160px] z-50"
            role="listbox"
            aria-label="Language options"
          >
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => { onLanguageChange(lang.code); setIsOpen(false); }}
                className={`w-full px-4 py-2.5 text-left flex items-center gap-3 text-sm
                  hover:bg-white/5 transition-colors
                  ${currentLang === lang.code ? "text-accent-blue" : "text-foreground-dim"}
                  focus-visible:outline-none focus-visible:bg-white/5`}
                role="option"
                aria-selected={currentLang === lang.code}
              >
                <span>{lang.flag}</span>
                <span className="font-medium">{lang.label}</span>
                {currentLang === lang.code && <span className="ml-auto text-accent-blue">✓</span>}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
