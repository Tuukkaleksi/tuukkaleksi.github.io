const STORAGE_KEY = "neon-drift-achievements";

export type AchievementId =
  | "firstBoss"
  | "score10k"
  | "combo15"
  | "nearMiss10"
  | "survive5min";

export const ACHIEVEMENT_IDS: AchievementId[] = [
  "firstBoss",
  "score10k",
  "combo15",
  "nearMiss10",
  "survive5min",
];

export function loadUnlocked(): Set<AchievementId> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as AchievementId[]);
  } catch {
    return new Set();
  }
}

export function unlock(id: AchievementId): boolean {
  const set = loadUnlocked();
  if (set.has(id)) return false;
  set.add(id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
  return true;
}

export function checkAchievements(state: {
  score: number;
  combo: number;
  nearMissStreak: number;
  timeSurvived: number;
  bossesDefeated: number;
}): AchievementId[] {
  const newly: AchievementId[] = [];
  const tryUnlock = (id: AchievementId) => {
    if (unlock(id)) newly.push(id);
  };
  if (state.bossesDefeated >= 1) tryUnlock("firstBoss");
  if (state.score >= 10000) tryUnlock("score10k");
  if (state.combo >= 15) tryUnlock("combo15");
  if (state.nearMissStreak >= 10) tryUnlock("nearMiss10");
  if (state.timeSurvived >= 300) tryUnlock("survive5min");
  return newly;
}
