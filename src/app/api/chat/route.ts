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

/** Fallback response when Gemini API key is not configured */
const FALLBACK_RESPONSES: Record<string, string> = {
  "voter registration": `## 📋 Voter Registration

Here's what you need to know about **voter registration** in the United States:

- **Deadline**: Most states require registration **30 days before Election Day** — typically by **October 4, 2026**
- **Online**: Visit **vote.org/register** to register online (available in most states)
- **Same-Day**: Some states offer **same-day registration** at polling locations
- **Check Status**: Verify your registration at **vote.org/verify**

**Key Requirements:**
1. Must be a **U.S. citizen**
2. Must be **18 years old** by **Election Day**
3. Must meet your state's **residency requirements**
4. Must provide valid **identification** (varies by state)

> 💡 **Tip**: Even if you registered before, always verify your status before each election!`,

  "key dates": `## 📅 Key Election Dates & Deadlines

Here are the critical dates for the **2026 election cycle**:

- **January 2026** — State legislative sessions begin
- **March - June 2026** — **Primary elections** across states
- **July - August 2026** — **National party conventions**
- **September 2026** — General election debates begin
- **October 4, 2026** — Voter registration deadline (most states)
- **October 2026** — **Early voting** begins in many states
- **November 3, 2026** — **Election Day** 🗳️
- **December 2026** — States certify election results
- **January 20, 2027** — **Inauguration Day**

> ⚠️ Dates vary by state. Check your **Secretary of State website** for local deadlines.`,

  default: `## 🏛️ Welcome to VoteWise AI!

I'm your **election education assistant**, here to help you navigate the electoral process. I can help with:

- **Voter Registration** — Check status and requirements
- **Polling Locations** — Find where to vote
- **Candidate Research** — Learn about who's running
- **Fact-Checking** — Verify political claims
- **Key Dates** — Never miss a deadline
- **Voting Methods** — Mail-in, early, and in-person options

**What would you like to know?** Just ask a question or use the sidebar topics to get started!

> 🗓️ **Next Election Day**: **November 3, 2026** — Make your voice heard!`,
};

/** Find the best matching fallback response */
function getFallbackResponse(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("registration") || lower.includes("register")) return FALLBACK_RESPONSES["voter registration"];
  if (lower.includes("date") || lower.includes("deadline") || lower.includes("when")) return FALLBACK_RESPONSES["key dates"];
  if (lower.includes("primary") || lower.includes("general")) {
    return `## 🔄 Primary vs. General Elections\n\n**Primary Elections** narrow the field of candidates:\n- Held **months before** the general election (typically **March–June**)\n- Voters choose their **party's nominee**\n- Types: **Open** (any voter), **Closed** (party members only), **Semi-closed**\n\n**General Elections** determine the winners:\n- Held on **Election Day** — **November 3, 2026**\n- All registered voters can participate\n- Winners take office\n\n> 💡 **Key Difference**: Primaries = choosing your team's player. General = the championship game.`;
  }
  if (lower.includes("electoral college")) {
    return `## 🏛️ The Electoral College\n\n**What is it?** The system used to elect the **President and Vice President**.\n\n**How it works:**\n1. Each state gets **electors** equal to its Congressional delegation\n2. **538 total** electoral votes nationwide\n3. A candidate needs **270 electoral votes** to win\n4. Most states use **winner-take-all** — whoever wins the popular vote in that state gets ALL its electoral votes\n\n**Key Numbers:**\n- California: **54 votes** (most)\n- Texas: **40 votes**\n- Florida: **30 votes**\n- Swing states like **Pennsylvania (19)**, **Michigan (15)**, and **Wisconsin (10)** are often decisive\n\n> 📊 A candidate can win the **presidency** without winning the national **popular vote** — this has happened **5 times** in U.S. history.`;
  }
  if (lower.includes("ballot") || lower.includes("candidate")) {
    return `## 🗳️ Finding Your Ballot\n\nTo see who's on your ballot, I need your **registered voting address**. Here's what typically appears:\n\n**Federal Offices:**\n- **President** (every 4 years)\n- **U.S. Senator** (6-year terms, staggered)\n- **U.S. Representative** (every 2 years)\n\n**State & Local:**\n- **Governor** and state officers\n- **State legislators**\n- **County and city officials**\n- **Ballot measures** and propositions\n\n> 🔍 Visit **ballotpedia.org** or your state's election website to see your personalized ballot.`;
  }
  if (lower.includes("poll") && (lower.includes("station") || lower.includes("location") || lower.includes("where"))) {
    return `## 📍 Finding Your Polling Station\n\nHere's how to find where you vote:\n\n1. **Online**: Visit **vote.org/polling-place-locator**\n2. **By Phone**: Call your **county election office**\n3. **Voter Card**: Check the **poll card** mailed to your address\n\n**What to Bring:**\n- Valid **photo ID** (requirements vary by state)\n- Your **voter registration** confirmation\n- A **backup plan** in case of long lines\n\n**Polling Hours**: Most stations open **6:00 AM – 8:00 PM** on **November 3, 2026**\n\n> 📡 I can help find your nearest station if you share your general location!`;
  }
  if (lower.includes("winning") || lower.includes("polls") || lower.includes("ahead")) {
    return `## 📊 Current Polling Landscape\n\nHere's a snapshot of the **2026 election outlook**:\n\n**Key Senate Races:**\n- Multiple competitive races across swing states\n- Polling averages show tight margins in battleground regions\n\n**Prediction Markets vs. Polls:**\n- Traditional **polls** measure voter intent through surveys\n- **Betting markets** (Polymarket, PredictIt) reflect where people put their money\n- Markets often differ from polls — neither is perfectly predictive\n\n> 📈 I can show you a detailed comparison chart. Just ask about a specific race!`;
  }
  return FALLBACK_RESPONSES["default"];
}

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();
    const lastMessage = messages[messages.length - 1];
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
    const history = messages.slice(0, -1).map((msg: { role: string; content: string }) => ({
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

    return NextResponse.json({
      text: response.text() || "I processed your request. Check the interactive elements above for results.",
      toolResults,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { text: "I encountered an error processing your request. Please try again.", toolResults: [] },
      { status: 500 }
    );
  }
}
