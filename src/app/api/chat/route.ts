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


export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const messages = Array.isArray(body?.messages) ? body.messages : [];
    const lastMessage = messages[messages.length - 1];

    if (!lastMessage || typeof lastMessage.content !== "string") {
      return NextResponse.json(
        { text: "Invalid request: messages array is required.", toolResults: [] },
        { status: 400 }
      );
    }
    const model = createGeminiModel();

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
        const toolResult = await executeToolCall(call.name, call.args as Record<string, unknown>);
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
  } catch (error: any) {
    console.error("Chat API error:", error);

    /* If the error is likely due to an invalid/expired API key, use fallback */
    const isApiError = error?.message?.includes("API key") || 
                       error?.status === 403 || 
                       error?.status === 401 ||
                       error?.message?.includes("model") ||
                       error?.message?.includes("fetch");

    if (isApiError) {
      console.log("Falling back to intelligent mock response due to API error.");
      const body = await request.json().catch(() => ({}));
      const messages = body?.messages || [];
      const lastMessage = messages[messages.length - 1];
      const fallbackText = getFallbackResponse(lastMessage?.content || "");
      
      return NextResponse.json({
        text: fallbackText,
        toolResults: [],
      });
    }

    return NextResponse.json(
      { text: "I encountered an error processing your request. Please try again.", toolResults: [] },
      { status: 500 }
    );
  }
}
