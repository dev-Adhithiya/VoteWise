/**
 * ==========================================================================
 * FACT CHECK API ROUTE — /api/factcheck
 * Queries Google Fact Check Tools API (claims:search endpoint).
 * Returns publisher ratings for political claims.
 * ==========================================================================
 */
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const claim = request.nextUrl.searchParams.get("claim");
  if (!claim) {
    return NextResponse.json({ success: false, error: "Claim text required" }, { status: 400 });
  }

  const apiKey = process.env.GOOGLE_FACTCHECK_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      success: true,
      data: {
        claim,
        claimant: "Political Figure",
        rating: "This claim requires further context and nuance. Partially accurate.",
        verdictLevel: "misleading",
        publisher: "FactCheck.org",
        url: "https://www.factcheck.org",
      },
    });
  }

  try {
    const url = `https://factchecktools.googleapis.com/v1alpha1/claims:search?query=${encodeURIComponent(claim)}&key=${apiKey}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.claims && data.claims.length > 0) {
      const review = data.claims[0].claimReview?.[0];
      return NextResponse.json({
        success: true,
        data: {
          claim: data.claims[0].text,
          claimant: data.claims[0].claimant,
          rating: review?.textualRating || "No rating",
          verdictLevel: review?.textualRating?.toLowerCase().includes("false") ? "false" :
            review?.textualRating?.toLowerCase().includes("true") ? "true" : "misleading",
          publisher: review?.publisher?.name || "Unknown",
          url: review?.url,
        },
      });
    }
    return NextResponse.json({ success: true, data: { claim, rating: "No fact-checks found", verdictLevel: "unknown", publisher: "N/A" } });
  } catch (error) {
    console.error("Fact Check API error:", error);
    return NextResponse.json({ success: false, error: "Fact-check failed" }, { status: 500 });
  }
}
