import { NextResponse } from "next/server";
import { isLeaderboardEnabled } from "@/lib/neon-drift/leaderboard";
import { createRunToken, isNeonDriftSigningConfigured } from "@/lib/neon-drift/token";

export const runtime = "nodejs";

export async function POST() {
  if (!isLeaderboardEnabled() || !isNeonDriftSigningConfigured()) {
    return NextResponse.json({ ok: false as const, error: "LEADERBOARD_DISABLED" });
  }

  const session = createRunToken();
  if (!session) {
    return NextResponse.json({ ok: false as const, error: "LEADERBOARD_DISABLED" });
  }

  return NextResponse.json({
    ok: true as const,
    runToken: session.runToken,
    startedAt: session.startedAt,
  });
}
