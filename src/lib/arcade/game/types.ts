import type { BossId, GamePhase, RunStats } from "@/lib/arcade/types";
import type { PowerUpId } from "@/lib/arcade/power-ups";

export type { BossId };

export type GameStats = {
  score: number;
  combo: number;
  wave: number;
  round: number;
  lives: number;
  highScore: number;
  phase: GamePhase;
  overloadTier: number;
  bossTelegraph: BossId | null;
  runStats: RunStats;
  nearMissStreak: number;
  activeSynergies: string[];
};

export type NeonDriftCallbacks = {
  onStats: (stats: GameStats) => void;
  onPhase: (phase: GamePhase) => void;
  onScorePop?: () => void;
  onOverload?: () => void;
  onDraft?: (choices: PowerUpId[]) => void;
  onAchievement?: (id: string) => void;
  onBossTelegraph?: (bossId: BossId) => void;
};
