/**
 * ==========================================================================
 * GOOGLE TASKS API ROUTE — Create Voter Readiness Checklist
 * ==========================================================================
 * Endpoint: POST /api/tasks/checklist
 * Creates a Google Tasks list with region-aware checklist items.
 * Region-specific requirements (US/UK/India) - no sensitive ID digits.
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createVoterChecklist } from "@/lib/google-apis";
import { REGION_REQUIREMENTS } from "@/lib/geolocation";

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in with Google." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { countryCode = "US" } = body;

    // Validate country code
    if (!["US", "UK", "IN", "UNKNOWN"].includes(countryCode)) {
      return NextResponse.json(
        { error: "Invalid country code." },
        { status: 400 }
      );
    }

    // Get checklist items for region
    const regionRequirements =
      REGION_REQUIREMENTS[countryCode as "US" | "UK" | "IN" | "UNKNOWN"];
    if (!regionRequirements) {
      return NextResponse.json(
        { error: "Country not supported for checklist" },
        { status: 400 }
      );
    }

    // Get access token from session
    const accessToken = (session as any).accessToken;
    if (!accessToken) {
      return NextResponse.json(
        { error: "OAuth token not available. Re-authenticate." },
        { status: 401 }
      );
    }

    // Create task list with region-aware items
    const result = await createVoterChecklist(
      accessToken,
      regionRequirements.checklistItems,
      countryCode
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to create task list" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      taskListId: result.taskListId,
      taskIds: result.taskIds,
      items: regionRequirements.checklistItems,
      idTypes: regionRequirements.idTypes,
      country: countryCode,
      electionCycle: regionRequirements.electionCycle,
    });
  } catch (error) {
    console.error("Tasks API error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

/**
 * Update task completion status
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in with Google." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { taskListId, taskId, completed } = body;

    if (!taskListId || !taskId || typeof completed !== "boolean") {
      return NextResponse.json(
        { error: "Missing required fields: taskListId, taskId, completed" },
        { status: 400 }
      );
    }

    const accessToken = (session as any).accessToken;
    if (!accessToken) {
      return NextResponse.json(
        { error: "OAuth token not available." },
        { status: 401 }
      );
    }

    // Import the updateTaskStatus function
    const { updateTaskStatus } = await import("@/lib/google-apis");

    const result = await updateTaskStatus(
      accessToken,
      taskListId,
      taskId,
      completed
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to update task" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      task: result.task,
    });
  } catch (error) {
    console.error("Task update error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
