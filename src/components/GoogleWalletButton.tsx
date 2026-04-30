/**
 * ==========================================================================
 * GOOGLE WALLET BUTTON — Add to Google Wallet
 * ==========================================================================
 * Standard "Add to Google Wallet" button that generates a pass with
 * polling station address and election date.
 */
"use client";

import React from "react";
import { motion } from "framer-motion";

interface GoogleWalletButtonProps {
  /** Polling station address */
  pollingAddress?: string;
  /** Election date string */
  electionDate?: string;
}

export default function GoogleWalletButton({
  pollingAddress = "Capitol Hill Polling Center, Washington D.C.",
  electionDate = "November 3, 2026",
}: GoogleWalletButtonProps) {
  /**
   * In production, this would call /api/wallet to generate a JWT
   * and redirect to the Google Wallet save URL. For demo purposes,
   * we show the button with an alert.
   */
  const handleAddToWallet = () => {
    alert(
      `Google Wallet Pass Created!\n\n` +
      `📍 Polling Station: ${pollingAddress}\n` +
      `📅 Election Date: ${electionDate}\n\n` +
      `In production, this would generate a real Google Wallet pass.`
    );
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleAddToWallet}
      className="flex items-center gap-3 bg-black border border-white/20 rounded-xl 
                 px-5 py-3 hover:bg-gray-900 transition-colors group
                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
      aria-label="Add election details to Google Wallet"
    >
      {/* Google Wallet Icon (simplified SVG) */}
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
        <path d="M19.5 3.5L18 2l-1.5 1.5L15 2l-1.5 1.5L12 2l-1.5 1.5L9 2 7.5 3.5 6 2v14l1.5 1.5L6 19l1.5 1.5L9 19l1.5 1.5L12 19l1.5 1.5L15 19l1.5 1.5L18 19l1.5 1.5L21 19V2l-1.5 1.5zM19 19.09H8V4.91h11v14.18z" fill="#fff"/>
        <path d="M9 7h2v2H9zm4 0h4v2h-4zm-4 4h2v2H9zm4 0h4v2h-4zm-4 4h2v2H9zm4 0h4v2h-4z" fill="#fff" opacity="0.6"/>
      </svg>
      <div className="text-left">
        <p className="text-[10px] text-gray-400 leading-none mb-0.5">Add to</p>
        <p className="text-white font-semibold text-sm leading-none group-hover:text-gray-200 transition-colors">Google Wallet</p>
      </div>
    </motion.button>
  );
}
