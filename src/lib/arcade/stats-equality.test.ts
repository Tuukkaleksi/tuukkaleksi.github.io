import { describe, expect, it } from "vitest";
import type { GameStats } from "@/lib/arcade/game/types";
import { statsHudEqual } from "@/lib/arcade/stats-equality";

function baseStats(overrides: Partial<GameStats> = {}): GameStats {
  return {
    score: 1000,
    combo: 2,
    wave: 3,
    round: 1,
    lives: 2,
    highScore: 5000,
    phase: "playing",
    overloadTier: 0,
    bossTelegraph: null,
    runStats: {
      timeSurvived: 30,
      kills: 10,
      bestCombo: 5,
      bestNearMissStreak: 2,
      bossesDefeated: 0,
      picks: [],
    },
    nearMissStreak: 0,
    activeSynergies: [],
    ...overrides,
  };
}

describe("statsHudEqual", () => {
  it("returns true when HUD fields are unchanged", () => {
    const a = baseStats();
    const b = baseStats({ runStats: { ...a.runStats, kills: 99 } });
    expect(statsHudEqual(a, b)).toBe(true);
  });

  it("returns false when score changes", () => {
    const a = baseStats();
    const b = baseStats({ score: 1001 });
    expect(statsHudEqual(a, b)).toBe(false);
  });

  it("returns false on phase change and during draft/gameover", () => {
    expect(statsHudEqual(baseStats(), baseStats({ phase: "paused" }))).toBe(false);
    expect(statsHudEqual(baseStats({ phase: "draft" }), baseStats({ phase: "draft" }))).toBe(
      false,
    );
    expect(
      statsHudEqual(baseStats({ phase: "gameover" }), baseStats({ phase: "gameover" })),
    ).toBe(false);
  });
});
