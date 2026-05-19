import type { GameStats } from "@/lib/arcade/game/types";

/** Skip React updates when HUD-visible fields are unchanged. */
export function statsHudEqual(a: GameStats, b: GameStats): boolean {
  if (a.phase !== b.phase) return false;
  if (a.phase === "gameover" || a.phase === "draft") return false;
  if (a.activeSynergies.length !== b.activeSynergies.length) return false;
  if (!a.activeSynergies.every((id, i) => id === b.activeSynergies[i])) return false;
  return (
    a.score === b.score &&
    a.combo === b.combo &&
    a.wave === b.wave &&
    a.round === b.round &&
    a.lives === b.lives &&
    a.highScore === b.highScore &&
    a.overloadTier === b.overloadTier &&
    a.bossTelegraph === b.bossTelegraph &&
    a.nearMissStreak === b.nearMissStreak
  );
}
