/**
 * ==========================================================================
 * CALENDAR API ROUTE — /api/calendar
 * Generates Google Calendar event URLs for election reminders.
 * Auto-calculates the next Election Day.
 * ==========================================================================
 */
import { NextResponse } from "next/server";

function getNextElectionDay(): Date {
  const now = new Date();
  let year = now.getFullYear();
  if (year % 2 !== 0) year += 1;
  const nov1 = new Date(year, 10, 1);
  const d = nov1.getDay();
  const dm = d <= 1 ? (1 - d) : (8 - d);
  const electionDay = new Date(year, 10, 1 + dm + 1);
  if (electionDay < now) return new Date(year + 2, 10, 1 + dm + 1);
  return electionDay;
}

export async function POST() {
  const date = getNextElectionDay();
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").split("T")[0];
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: "🗳️ Election Day — Don't Forget to Vote!",
    dates: `${fmt(date)}/${fmt(new Date(date.getTime() + 86400000))}`,
    details: "Powered by VoteWise AI",
    sf: "true",
  });

  return NextResponse.json({
    success: true,
    data: {
      calendarUrl: `https://calendar.google.com/calendar/render?${params}`,
      date: date.toISOString(),
      formatted: date.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }),
    },
  });
}
