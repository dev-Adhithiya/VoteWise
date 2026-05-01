/**
 * ==========================================================================
 * LOGIN BUTTON — Google OAuth Sign In
 * ==========================================================================
 * Renders Sign In / Sign Out button based on authentication state.
 * Uses NextAuth session hook.
 */
"use client";

import React from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { motion } from "framer-motion";

interface LoginButtonProps {
  compact?: boolean;
  onSuccess?: () => void;
}

export default function LoginButton({ compact = false, onSuccess }: LoginButtonProps) {
  const { data: session, status } = useSession();
  const isLoading = status === "loading";

  if (isLoading) {
    return (
      <button
        disabled
        className="px-4 py-2 rounded-lg bg-white/5 text-white/50 font-medium
                   cursor-not-allowed border border-white/10"
      >
        Loading...
      </button>
    );
  }

  if (session?.user) {
    // Signed in - show user profile + sign out
    return (
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 glass-panel rounded-full px-3 py-1.5">
          {session.user.image && (
            <img
              src={session.user.image}
              alt={session.user.name || "User"}
              className="w-6 h-6 rounded-full border border-white/20"
            />
          )}
          <span className="text-sm text-white font-medium hidden md:inline">
            {session.user.name || session.user.email}
          </span>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => signOut()}
          className="px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 
                     text-red-300 hover:text-red-200 font-medium transition-colors
                     border border-red-500/30 text-sm"
        >
          Sign Out
        </motion.button>
      </div>
    );
  }

  // Not signed in - show sign in button
  if (compact) {
    return (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => signIn("google")}
        className="px-3 py-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 
                   text-blue-300 hover:text-blue-200 font-medium transition-colors
                   border border-blue-500/30 text-sm"
      >
        Sign In
      </motion.button>
    );
  }

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => {
        signIn("google");
        onSuccess?.();
      }}
      className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 
                 hover:from-blue-600 hover:to-blue-700
                 text-white font-semibold transition-all shadow-lg shadow-blue-500/20
                 flex items-center gap-2"
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032 c0-3.331,2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.461,2.268,15.365,1.25,12.545,1.25 c-6.235,0-11.27,5.035-11.27,11.271c0,6.236,5.035,11.271,11.27,11.271c6.236,0,11.27-5.035,11.27-11.271 c0-0.758-0.083-1.5-0.236-2.216H12.545Z" />
      </svg>
      Sign In with Google
    </motion.button>
  );
}
