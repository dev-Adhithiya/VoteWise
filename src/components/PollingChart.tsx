/**
 * ==========================================================================
 * POLLING CHART — Dual-Bar Glassmorphic Graph (Recharts)
 * ==========================================================================
 * Recharts BarChart comparing traditional polling averages vs prediction
 * market odds (e.g., Polymarket). Bars styled with party colors and
 * neon drop-shadows. Glassmorphic container with dark tooltip.
 */
"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { PollingDataPoint } from "@/types";

/** Demo polling data */
const DEMO_DATA: PollingDataPoint[] = [
  { name: "Rivera (D)", polls: 48.2, bettingMarkets: 52.1, color: "#3B82F6" },
  { name: "Mitchell (R)", polls: 45.6, bettingMarkets: 44.3, color: "#EF4444" },
  { name: "Santos (I)", polls: 4.1, bettingMarkets: 3.2, color: "#A855F7" },
];

/** Custom glassmorphic tooltip for the chart */
const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) => {
  if (!active || !payload) return null;
  return (
    <div className="glass-modal rounded-xl p-3 text-xs" style={{ minWidth: 160 }}>
      <p className="text-white font-semibold mb-2">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex justify-between gap-4 mb-1">
          <span className="text-foreground-dim">{entry.name}:</span>
          <span className="text-white font-bold">{entry.value}%</span>
        </div>
      ))}
    </div>
  );
};

interface PollingChartProps {
  /** Polling data array */
  data?: PollingDataPoint[];
  /** Optional race label for the chart header */
  race?: string;
}

export default function PollingChart({ data = DEMO_DATA, race }: PollingChartProps) {
  return (
    <div className="glass-panel rounded-2xl p-6 w-full max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white" style={{ fontFamily: "var(--font-outfit)" }}>
          📊 Polls vs. Betting Markets{race ? ` — ${race}` : ""}
        </h3>
        <span className="text-xs text-foreground-muted bg-white/5 px-3 py-1 rounded-full">
          {race ? "Race Data" : "Live Data"}
        </span>
      </div>

      {/* Chart */}
      <div className="w-full h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={4} barCategoryGap="20%">
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="name"
              stroke="#6B7280"
              tick={{ fill: "#9CA3AF", fontSize: 12 }}
              axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
            />
            <YAxis
              stroke="#6B7280"
              tick={{ fill: "#9CA3AF", fontSize: 12 }}
              axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
            <Legend
              wrapperStyle={{ fontSize: 12, color: "#9CA3AF" }}
              formatter={(value) => <span style={{ color: "#9CA3AF" }}>{value}</span>}
            />
            {/* Polling Average Bars */}
            <Bar dataKey="polls" name="Polling Average" radius={[6, 6, 0, 0]}>
              {data.map((entry, i) => (
                <Cell
                  key={i}
                  fill={entry.color}
                  style={{ filter: `drop-shadow(0 0 8px ${entry.color}80)` }}
                />
              ))}
            </Bar>
            {/* Betting Markets Bars */}
            <Bar dataKey="bettingMarkets" name="Betting Markets" radius={[6, 6, 0, 0]}>
              {data.map((entry, i) => (
                <Cell
                  key={i}
                  fill={`${entry.color}99`}
                  style={{ filter: `drop-shadow(0 0 6px ${entry.color}60)` }}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend footnote */}
      <p className="text-xs text-foreground-muted mt-3 text-center">
        Sources: Polling averages from aggregators • Prediction markets from Polymarket & PredictIt
      </p>
    </div>
  );
}
