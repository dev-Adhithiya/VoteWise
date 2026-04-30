/**
 * ==========================================================================
 * YOUTUBE API ROUTE — /api/youtube
 * Searches YouTube Data API v3 for candidate videos.
 * Returns video IDs for embedding in the Dossier Modal.
 * ==========================================================================
 */
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q");
  if (!query) {
    return NextResponse.json({ success: false, error: "Query required" }, { status: 400 });
  }

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      success: true,
      data: {
        videos: [
          { videoId: "dQw4w9WgXcQ", title: `${query} — Campaign Speech 2026` },
          { videoId: "jNQXAC9IVRw", title: `${query} — Debate Highlights` },
          { videoId: "M7lc1UVf-VE", title: `${query} — Town Hall Interview` },
        ],
      },
    });
  }

  try {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query + " interview debate 2026")}&type=video&maxResults=3&key=${apiKey}`;
    const res = await fetch(url);
    const data = await res.json();
    const videos = (data.items || []).map((item: { id: { videoId: string }; snippet: { title: string } }) => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
    }));
    return NextResponse.json({ success: true, data: { videos } });
  } catch (error) {
    console.error("YouTube API error:", error);
    return NextResponse.json({ success: false, error: "YouTube search failed" }, { status: 500 });
  }
}
