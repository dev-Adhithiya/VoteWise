/**
 * ==========================================================================
 * ROOT LAYOUT — Election Education Web Assistant
 * ==========================================================================
 * 
 * The root layout provides:
 * 1. Google Fonts (Inter + Outfit) for premium typography
 * 2. SEO meta tags for election education discoverability
 * 3. Animated gradient background div (the "Obsidian Frost" atmosphere)
 * 4. ARIA landmarks for accessibility compliance
 * 5. Dark theme enforced at the HTML level
 * 
 * This layout wraps all pages and provides the visual foundation
 * that all glassmorphism components sit on top of.
 */

import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

/* --------------------------------------------------------------------------
   FONT CONFIGURATION
   Inter: Primary body text — clean, highly legible at all sizes
   Outfit: Display/heading text — modern geometric sans-serif
   -------------------------------------------------------------------------- */
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap", // Prevent FOIT (Flash of Invisible Text)
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

/* --------------------------------------------------------------------------
   SEO METADATA
   Descriptive title and meta tags for search engine optimization.
   -------------------------------------------------------------------------- */
export const metadata: Metadata = {
  title: "VoteWise AI — Election Education & Voter Logistics Assistant",
  description:
    "Your intelligent guide to elections. Get voter registration help, find your polling station, research candidates, verify claims, and stay informed with AI-powered election education.",
  keywords: [
    "election",
    "voting",
    "voter registration",
    "polling station",
    "candidates",
    "election education",
    "voter guide",
  ],
  authors: [{ name: "VoteWise AI" }],
  openGraph: {
    title: "VoteWise AI — Election Education Assistant",
    description: "AI-powered election education and voter logistics",
    type: "website",
  },
};

/* --------------------------------------------------------------------------
   ROOT LAYOUT COMPONENT
   Renders the HTML shell with fonts, background, and content area.
   -------------------------------------------------------------------------- */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable} h-full`}
      /* Force dark theme regardless of system preference */
      data-theme="dark"
    >
      <body className="min-h-screen font-[family-name:var(--font-inter)] antialiased">
        {/* 
          ANIMATED GRADIENT BACKGROUND
          This fixed div creates the shifting dark gradient atmosphere.
          All content sits on top of this via relative/z-index positioning.
        */}
        <div className="animated-bg" aria-hidden="true" />

        {/* 
          MAIN CONTENT WRAPPER
          Positioned above the background with z-index.
          Uses flex layout for the sidebar + main area structure.
        */}
        <div className="relative z-10 flex h-screen overflow-hidden">
          {children}
        </div>
      </body>
    </html>
  );
}
