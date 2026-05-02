/**
 * ==========================================================================
 * CHAT API ROUTE — /api/chat
 * ==========================================================================
 * POST endpoint that receives user messages, sends them to Gemini 1.5 Flash,
 * handles function calling loops, and returns structured responses.
 * All API keys are server-side only (never exposed to client).
 */

import { NextRequest, NextResponse } from "next/server";
import { createGeminiModel, executeToolCall } from "@/lib/GeminiHandler";
import { getFallbackResponse } from "@/lib/fallbackResponses";

function isGeminiAuthError(error: unknown): boolean {
  const err = error as { message?: string; status?: number; code?: number | string };
  const message = String(err?.message || "").toLowerCase();
  const status = typeof err?.status === "number" ? err.status : undefined;

  return (
    status === 401 ||
    status === 403 ||
    message.includes("api key") ||
    message.includes("permission") ||
    message.includes("unauthorized") ||
    message.includes("forbidden")
  );
}

function isGeminiRateLimitError(error: unknown): boolean {
  const err = error as { message?: string; status?: number; code?: number | string };
  const message = String(err?.message || "").toLowerCase();
  const status = typeof err?.status === "number" ? err.status : undefined;

  return status === 429 || message.includes("quota") || message.includes("rate limit") || message.includes("too many requests");
}


export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const messages = Array.isArray(body?.messages) ? body.messages : [];
    const lastMessage = messages[messages.length - 1];
    const location = body?.location;

    if (!lastMessage || typeof lastMessage.content !== "string") {
      return NextResponse.json(
        { text: "Invalid request: messages array is required.", toolResults: [] },
        { status: 400 }
      );
    }
    const model = createGeminiModel(location);

    /* If no API key, use intelligent fallback responses */
    if (!model) {
      const fallbackText = getFallbackResponse(lastMessage.content);
      return NextResponse.json({
        text: fallbackText,
        toolResults: [],
      });
    }

    /* Build conversation history for Gemini */
    const history = messages
      .slice(0, -1)
      .filter((msg: { role?: string; content?: string }) => typeof msg?.content === "string")
      .map((msg: { role?: string; content: string }) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
      }));

    /* Start chat with history */
    const chat = model.startChat({ history });

    /* Send the latest user message */
    let result = await chat.sendMessage(lastMessage.content);
    let response = result.response;
    const toolResults: Array<{ toolType: string; data: Record<string, unknown> }> = [];

    /* Function calling loop — execute tools until Gemini returns text */
    let functionCalls = response.functionCalls?.() ?? [];
    while (functionCalls.length > 0) {
      const functionResponses = [];

      for (const call of functionCalls) {
        const toolResult = await executeToolCall(call.name, call.args as Record<string, unknown>, location);
        toolResults.push(toolResult);

        functionResponses.push({
          functionResponse: {
            name: call.name,
            response: { result: toolResult.data },
          },
        });
      }

      /* Send function results back to Gemini for final response */
      result = await chat.sendMessage(functionResponses);
      response = result.response;
      functionCalls = response.functionCalls?.() ?? [];
    }

    let finalTags = "";
    try {
      finalTags = response.text();
    } catch (e) {
      console.warn("No text part in Gemini response, using fallback label.");
      finalTags = "I processed your request. Check the interactive elements above for results.";
    }

    return NextResponse.json({
      text: finalTags,
      toolResults,
    });
  } catch (error: unknown) {
    console.error("Chat API error:", error);

    if (isGeminiAuthError(error)) {
      return NextResponse.json(
        {
          text: "AI chat authentication failed. Verify GEMINI_API_KEY and model access in your deployment environment.",
          toolResults: [],
        },
        { status: 502 }
      );
    }

    if (isGeminiRateLimitError(error)) {
      return NextResponse.json(
        {
          text: "AI chat is temporarily unavailable because Gemini API quota is exceeded for this project. Enable billing or increase quota, then retry.",
          toolResults: [],
        },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { text: "I encountered an error processing your request. Please try again.", toolResults: [] },
      { status: 500 }
    );
  }
}
