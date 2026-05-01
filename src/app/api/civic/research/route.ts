/**
 * ==========================================================================
 * CANDIDATE RESEARCH ROUTE — Gemini Search Grounding
 * ==========================================================================
 * Endpoint: POST /api/civic/research
 * Uses Gemini with Google Search Grounding to research candidate:
 * 1. Platform/Promises
 * 2. Voting History
 * 3. Recent News
 * Returns structured dossier data for modal display.
 */

import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

interface CandidateDossier {
  name: string;
  office: string;
  platform: string[];
  votingHistory: string[];
  recentNews: Array<{ headline: string; source: string }>;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const candidateName = typeof body?.candidateName === "string" ? body.candidateName.trim() : "";
    const office = typeof body?.office === "string" ? body.office.trim() : "";

    if (!candidateName) {
      return NextResponse.json(
        { error: "Missing required parameter: candidateName" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("GEMINI_API_KEY not set");
      return NextResponse.json(
        { error: "AI service not configured" },
        { status: 500 }
      );
    }

    const client = new GoogleGenerativeAI(apiKey);

    // Create a research prompt with structured output requirement
    const prompt = `Research the following political candidate and return ONLY valid JSON with no markdown formatting or code blocks.

Candidate: ${candidateName}
${office ? `Office: ${office}` : ""}

Return JSON in this exact format:
{
  "name": "${candidateName}",
  "office": "${office || 'Unknown'}",
  "platform": ["policy 1", "policy 2", "policy 3", "policy 4", "policy 5"],
  "votingHistory": ["vote 1 on topic", "vote 2 on topic", "vote 3 on topic", "vote 4 on topic"],
  "recentNews": [
    {"headline": "news headline 1", "source": "news source"},
    {"headline": "news headline 2", "source": "news source"},
    {"headline": "news headline 3", "source": "news source"}
  ]
}

Rules:
1. Return ONLY the JSON object, no additional text
2. Platform should be 5 key policy positions or campaign promises
3. Voting History should be 4 notable votes or legislative actions (including outcome)
4. Recent News should be 3 recent news items about the candidate
5. Do not include any markdown, code blocks, or explanation text
6. If information cannot be found, use empty arrays: []`;

    // Call Gemini with search grounding enabled
    const model = client.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction:
        "You are a neutral research assistant. Return only valid JSON as requested, with no citations or markdown.",
      tools: [
        {
          googleSearch: {},
        } as any,
      ],
    });

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 1000,
      },
    });

    // The SDK's response shape can vary. Prefer structured content if present,
    // otherwise fall back to the text() helper. Use `any` to avoid strict type
    // errors from SDK typings that may not include `content`.
    let responseText = "";
    const respAny = result.response as any;
    if (respAny && respAny.content) {
      for (const content of respAny.content) {
        for (const part of content.parts || []) {
          if (part && typeof part.text === "string") responseText += part.text;
        }
      }
    } else if (typeof result.response.text === "function") {
      responseText = result.response.text();
    } else if (respAny && respAny.message) {
      // Last-resort: stringify whatever message object exists
      responseText = JSON.stringify(respAny.message);
    }

    // Parse the JSON response
    let dossier: CandidateDossier;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON found in response");
      dossier = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error("Failed to parse Gemini response:", responseText);
      return NextResponse.json(
        {
          name: candidateName,
          office: office || "Unknown",
          platform: [],
          votingHistory: [],
          recentNews: [],
          error: "Could not retrieve candidate information. Please try again.",
        },
        { status: 200 }
      );
    }

    return NextResponse.json({
      success: true,
      dossier,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Candidate research error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
