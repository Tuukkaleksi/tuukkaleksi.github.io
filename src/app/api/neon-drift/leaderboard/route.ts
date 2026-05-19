import { NextResponse } from "next/server";
import { getLeaderboard, isLeaderboardEnabled } from "@/lib/neon-drift/leaderboard";

export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!isLeaderboardEnabled()) {
    return NextResponse.json({ ok: true as const, entries: [] });
  }

  const { searchParams } = new URL(request.url);
  const limit = Number(searchParams.get("limit") ?? "10");

  try {
    const entries = await getLeaderboard(limit);
    return NextResponse.json({ ok: true as const, entries });
  } catch {
    return NextResponse.json({ ok: false as const, error: "LEADERBOARD_FETCH_FAILED" }, { status: 502 });
  }
}
