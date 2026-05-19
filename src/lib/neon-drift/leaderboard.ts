import { count, desc, gt } from "drizzle-orm";
import { getDb, isDatabaseConfigured } from "@/db";
import { neonDriftScores } from "@/db/schema";

export type LeaderboardEntry = {
  rank: number;
  initials: string;
  score: number;
  wave: number;
  timeSurvivedSec: number;
  createdAt: string;
};

export async function getLeaderboard(limit = 10): Promise<LeaderboardEntry[]> {
  if (!isDatabaseConfigured()) return [];

  const db = getDb();
  if (!db) return [];

  const capped = Math.min(Math.max(limit, 1), 25);
  try {
    const rows = await db
      .select({
        initials: neonDriftScores.initials,
        score: neonDriftScores.score,
        wave: neonDriftScores.wave,
        timeSurvivedSec: neonDriftScores.timeSurvivedSec,
        createdAt: neonDriftScores.createdAt,
      })
      .from(neonDriftScores)
      .orderBy(desc(neonDriftScores.score), desc(neonDriftScores.createdAt))
      .limit(capped);

    return rows.map((row, i) => ({
      rank: i + 1,
      initials: row.initials,
      score: row.score,
      wave: row.wave,
      timeSurvivedSec: row.timeSurvivedSec,
      createdAt: row.createdAt.toISOString(),
    }));
  } catch {
    return [];
  }
}

export async function insertScore(data: {
  initials: string;
  score: number;
  wave: number;
  round: number;
  timeSurvivedSec: number;
  kills: number;
  bestCombo: number;
  bossesDefeated: number;
}): Promise<{ rank: number } | null> {
  if (!isDatabaseConfigured()) return null;

  const db = getDb();
  if (!db) return null;

  try {
    await db.insert(neonDriftScores).values({
      initials: data.initials,
      score: data.score,
      wave: data.wave,
      round: data.round,
      timeSurvivedSec: data.timeSurvivedSec,
      kills: data.kills,
      bestCombo: data.bestCombo,
      bossesDefeated: data.bossesDefeated,
    });

    const [higher] = await db
      .select({ count: count() })
      .from(neonDriftScores)
      .where(gt(neonDriftScores.score, data.score));

    const rank = (higher?.count ?? 0) + 1;
    return { rank };
  } catch {
    return null;
  }
}

export function isLeaderboardEnabled(): boolean {
  return isDatabaseConfigured();
}
