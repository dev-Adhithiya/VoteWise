/**
 * ==========================================================================
 * GOOGLE APIS CLIENT — Unified API Access with OAuth Tokens
 * ==========================================================================
 * Handles Google Calendar, Tasks, Maps, Civic, and YouTube API calls.
 * Uses OAuth access tokens from NextAuth session.
 */

import { google } from "googleapis";

export interface GoogleAPIConfig {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
}

/**
 * Initialize Google API client with OAuth credentials
 */
export function createGoogleClient(config: GoogleAPIConfig) {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({
    access_token: config.accessToken,
    refresh_token: config.refreshToken,
    expiry_date: config.expiresAt,
  });

  return {
    calendar: google.calendar({ version: "v3", auth }),
    tasks: google.tasks({ version: "v1", auth }),
    // For Maps, Civic, YouTube we use REST endpoints with API keys
  };
}

/**
 * Create calendar event for Election Day
 */
export async function createElectionReminder(
  accessToken: string,
  electionDate: string,
  countryCode: string
) {
  try {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });
    const calendar = google.calendar({ version: "v3", auth });

    const event = {
      summary: `Election Day ${new Date(electionDate).getFullYear()}`,
      description: `Reminder to vote in ${getCountryName(countryCode)}. Check your polling location and bring required ID.`,
      start: {
        date: new Date(electionDate).toISOString().split("T")[0],
      },
      end: {
        date: new Date(new Date(electionDate).getTime() + 86400000)
          .toISOString()
          .split("T")[0],
      },
      reminders: {
        useDefault: true,
      },
      transparency: "transparent",
      visibility: "private",
    };

    const result = await calendar.events.insert({
      calendarId: "primary",
      requestBody: event as any,
    });

    return {
      success: true,
      eventId: result.data.id,
      eventLink: result.data.htmlLink,
    };
  } catch (error) {
    console.error("Calendar API error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Create voter checklist in Google Tasks
 */
export async function createVoterChecklist(
  accessToken: string,
  items: string[],
  countryCode: string
) {
  try {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });
    const tasks = google.tasks({ version: "v1", auth });

    // Create task list
    const listResult = await tasks.tasklists.insert({
      requestBody: {
        title: `Voter Readiness - ${getCountryName(countryCode)}`,
      },
    });

    const taskListId = listResult.data.id;

    if (!taskListId) {
      throw new Error("Failed to create task list");
    }

    // Add items to task list
    const taskIds: string[] = [];
    for (const item of items) {
      const taskResult = await tasks.tasks.insert({
        tasklist: taskListId,
        requestBody: {
          title: item,
          status: "needsAction",
        },
      });

      if (taskResult.data.id) {
        taskIds.push(taskResult.data.id);
      }
    }

    return {
      success: true,
      taskListId,
      taskIds,
    };
  } catch (error) {
    console.error("Tasks API error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Update task completion status
 */
export async function updateTaskStatus(
  accessToken: string,
  taskListId: string,
  taskId: string,
  completed: boolean
) {
  try {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });
    const tasks = google.tasks({ version: "v1", auth });

    const result = await tasks.tasks.update({
      tasklist: taskListId,
      task: taskId,
      requestBody: {
        status: completed ? "completed" : "needsAction",
      },
    });

    return {
      success: true,
      task: result.data,
    };
  } catch (error) {
    console.error("Tasks update error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get election dates by country
 */
function getCountryName(code: string): string {
  const names: Record<string, string> = {
    US: "United States",
    UK: "United Kingdom",
    IN: "India",
  };
  return names[code] || "Your Country";
}

export function getNextElectionDate(countryCode: string): string {
  const year = new Date().getFullYear();
  // Election dates (simplified; production should use authoritative source)
  const nextYear = year + 1;
  const elections: Record<string, string> = {
    // US: First Tuesday after Nov 1 in even years
    US: getNextUsElectionDate(),
    // UK: placeholder date (use real schedule in production)
    UK: `${nextYear}-05-01`,
    // India: placeholder next major election date
    IN: `${nextYear}-02-15`,
  };

  return elections[countryCode] || `${nextYear}-11-01`;
}

function getNextUsElectionDate(): string {
  const now = new Date();
  let year = now.getFullYear();
  if (year % 2 !== 0) year += 1;

  const computeElectionDay = (targetYear: number) => {
    const nov1 = new Date(targetYear, 10, 1);
    const day = nov1.getDay();
    const offset = day <= 1 ? 1 - day : 8 - day;
    return new Date(targetYear, 10, 1 + offset + 1);
  };

  let electionDay = computeElectionDay(year);
  if (electionDay < now) {
    electionDay = computeElectionDay(year + 2);
  }

  return electionDay.toISOString().split("T")[0];
}
