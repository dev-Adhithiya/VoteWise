/**
 * ==========================================================================
 * VOTING ROUTE MAP — Polling Station Map & Navigation
 * ==========================================================================
 * Embedded map showing the route from user's location to nearest polling
 * booth. Uses Google Maps Static API for the map image and provides
 * a "Start Navigation" button linking to Google Maps universal URL.
 */
"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface VotingRouteMapProps {
  /** User's latitude */
  userLat?: number;
  /** User's longitude */
  userLng?: number;
  /** Polling station latitude */
  stationLat?: number;
  /** Polling station longitude */
  stationLng?: number;
  /** Polling station name/address */
  stationName?: string;
}

/** Default demo coordinates (Washington D.C. area) */
const DEFAULT_USER = { lat: 38.8977, lng: -77.0365 };
const DEFAULT_STATION = { lat: 38.8899, lng: -77.0091, name: "Capitol Hill Polling Center" };

export default function VotingRouteMap({
  userLat = DEFAULT_USER.lat,
  userLng = DEFAULT_USER.lng,
  stationLat = DEFAULT_STATION.lat,
  stationLng = DEFAULT_STATION.lng,
  stationName = DEFAULT_STATION.name,
}: VotingRouteMapProps) {
  const [isLocating, setIsLocating] = useState(false);
  const [currentLat, setCurrentLat] = useState(userLat);
  const [currentLng, setCurrentLng] = useState(userLng);

  /** Request browser geolocation to get user's live coordinates */
  const getLocation = () => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCurrentLat(pos.coords.latitude);
        setCurrentLng(pos.coords.longitude);
        setIsLocating(false);
      },
      () => setIsLocating(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  useEffect(() => { getLocation(); }, []);

  /** Google Maps navigation URL — opens native app on mobile */
  const navigationUrl = `https://www.google.com/maps/dir/?api=1&origin=${currentLat},${currentLng}&destination=${stationLat},${stationLng}&travelmode=driving`;

  /** Embedded map URL using Google Maps Embed API */
  const embedUrl = `https://www.google.com/maps/embed/v1/directions?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || "demo"}&origin=${currentLat},${currentLng}&destination=${stationLat},${stationLng}&mode=driving`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel rounded-2xl overflow-hidden max-w-lg w-full"
    >
      {/* Map Header */}
      <div className="p-4 border-b border-white/5">
        <h3 className="text-lg font-bold text-white flex items-center gap-2" style={{ fontFamily: "var(--font-outfit)" }}>
          📍 Your Polling Route
        </h3>
        <p className="text-xs text-foreground-muted mt-1">Navigate to {stationName}</p>
      </div>

      {/* Map Display */}
      <div className="relative w-full h-64 bg-obsidian-light">
        {process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ? (
          <iframe
            src={embedUrl}
            className="w-full h-full border-0"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Route to polling station"
          />
        ) : (
          /* Fallback when no API key — stylized placeholder */
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-obsidian to-blue-900/20">
            <span className="text-4xl mb-3">🗺️</span>
            <p className="text-foreground-dim text-sm">Map preview</p>
            <p className="text-foreground-muted text-xs mt-1">
              {currentLat.toFixed(4)}, {currentLng.toFixed(4)} → {stationLat.toFixed(4)}, {stationLng.toFixed(4)}
            </p>
          </div>
        )}
      </div>

      {/* Route Info & Navigation Button */}
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <div>
            <p className="text-foreground-dim">Destination</p>
            <p className="text-white font-medium">{stationName}</p>
          </div>
          <button
            onClick={getLocation}
            disabled={isLocating}
            className="text-xs text-accent-blue hover:text-accent-blue-light transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue/50 rounded px-2 py-1"
          >
            {isLocating ? "Locating..." : "📡 Update Location"}
          </button>
        </div>

        {/* Start Navigation Button — prominent, links to Google Maps */}
        <a
          href={navigationUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full py-3.5 px-6 rounded-xl font-semibold text-white text-center
                     bg-gradient-to-r from-green-500 to-emerald-600
                     hover:from-green-400 hover:to-emerald-500 transition-all duration-300
                     shadow-lg hover:shadow-green-500/25
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500/50"
        >
          Start Navigation ↗
        </a>
      </div>
    </motion.div>
  );
}
