/**
 * ==========================================================================
 * LOCATION DETECTOR — Browser Geolocation & Country Detection
 * ==========================================================================
 * Hook/Component for detecting user location and country.
 * Stores location in state and provides fallback mechanisms.
 */
"use client";

import { useState, useEffect, useCallback } from "react";
import type { Location, CountryCode } from "@/lib/geolocation";
import {
  getUserLocation,
  formatLocation,
} from "@/lib/geolocation";

export interface UseLocationResult {
  location: Location | null;
  country: CountryCode;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export interface UseLocationOptions {
  enabled?: boolean;
}

/**
 * Hook: useUserLocation
 * Detects user location with fallback chain:
 * 1. Browser Geolocation API
 * 2. IP-based geolocation
 * 3. Default to UNKNOWN
 */
export function useUserLocation(
  options: UseLocationOptions = {}
): UseLocationResult {
  const { enabled = true } = options;
  const [location, setLocation] = useState<Location | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const detectLocation = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const detectedLocation = await getUserLocation();
      setLocation(detectedLocation);

      if (detectedLocation.countryCode === "UNKNOWN") {
        setError("Could not determine your location. Some features may be limited.");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      console.error("Location detection error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Detect location on mount or when enabled
  useEffect(() => {
    if (!enabled) {
      setLocation(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    detectLocation();
  }, [detectLocation, enabled]);

  const country = (location?.countryCode || "UNKNOWN") as CountryCode;

  return {
    location,
    country,
    isLoading,
    error,
    refresh: detectLocation,
  };
}

/**
 * Component: LocationStatus
 * Displays current location and country in the UI
 */
interface LocationStatusProps {
  location: Location | null;
  isLoading: boolean;
  className?: string;
}

export function LocationStatus({
  location,
  isLoading,
  className = "",
}: LocationStatusProps) {
  if (isLoading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
        <span className="text-xs text-foreground-dim font-medium">
          Detecting location...
        </span>
      </div>
    );
  }

  if (!location) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="w-2 h-2 rounded-full bg-red-400" />
        <span className="text-xs text-red-300 font-medium">
          Location unavailable
        </span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="w-2 h-2 rounded-full bg-green-400" />
      <span className="text-xs text-green-300 font-medium">
        📍 {formatLocation(location)}
      </span>
    </div>
  );
}

/**
 * Component: LocationRequestPrompt
 * Prompts user to enable geolocation permission
 */
interface LocationRequestPromptProps {
  onRequest?: () => void;
  onDismiss?: () => void;
  countryCode: CountryCode;
}

export function LocationRequestPrompt({
  onRequest,
  onDismiss,
  countryCode,
}: LocationRequestPromptProps) {
  if (countryCode !== "UNKNOWN") return null; // Only show if location is unknown

  return (
    <div className="glass-panel rounded-lg p-4 border border-yellow-500/30 bg-yellow-500/10 mb-4">
      <div className="flex items-start gap-3">
        <span className="text-xl">📍</span>
        <div className="flex-1">
          <p className="text-sm font-semibold text-yellow-200">
            Enable Location Services
          </p>
          <p className="text-xs text-yellow-200/70 mt-1">
            We need your location to show the nearest polling booth and customize
            voting requirements for your region.
          </p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={onRequest}
              className="px-3 py-1.5 rounded-lg bg-yellow-500/30 hover:bg-yellow-500/40
                         text-yellow-200 font-medium text-sm transition-colors"
            >
              Enable Location
            </button>
            <button
              onClick={onDismiss}
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10
                         text-white/70 font-medium text-sm transition-colors"
            >
              Not Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
