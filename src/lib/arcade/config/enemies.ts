import type { BossId, EnemyKind } from "@/lib/arcade/types";

export type EnemyDef = {
  hp: number;
  radius: number;
  speedMul: number;
  score: number;
  minWave: number;
  weight: number;
  color: string;
};

export const ENEMY_DEFS: Record<EnemyKind, EnemyDef> = {
  drifter: { hp: 1, radius: 16, speedMul: 1, score: 12, minWave: 1, weight: 0.35, color: "#94a3b8" },
  stalker: { hp: 2, radius: 18, speedMul: 1.35, score: 22, minWave: 2, weight: 0.2, color: "#fb7185" },
  splitter: { hp: 2, radius: 22, speedMul: 0.92, score: 35, minWave: 3, weight: 0.12, color: "#a78bfa" },
  swarmer: { hp: 1, radius: 11, speedMul: 1.55, score: 8, minWave: 2, weight: 0.18, color: "#fbbf24" },
  orbiter: { hp: 2, radius: 17, speedMul: 0.85, score: 18, minWave: 3, weight: 0.1, color: "#38bdf8" },
  sniper: { hp: 2, radius: 15, speedMul: 0.7, score: 24, minWave: 4, weight: 0.08, color: "#f472b6" },
  tank: { hp: 5, radius: 26, speedMul: 0.55, score: 45, minWave: 5, weight: 0.07, color: "#64748b" },
};

export type BossDef = {
  hp: number;
  radius: number;
  speed: number;
  score: number;
  color: string;
};

export const BOSS_DEFS: Record<BossId, BossDef> = {
  driftColossus: {
    hp: 120,
    radius: 48,
    speed: 45,
    score: 500,
    color: "#e879f9",
  },
};

export function pickEnemyKind(wave: number, round: number): EnemyKind {
  const pool: { kind: EnemyKind; w: number }[] = [];
  for (const [kind, def] of Object.entries(ENEMY_DEFS) as [EnemyKind, EnemyDef][]) {
    if (wave >= def.minWave) {
      const roundBoost = kind === "tank" || kind === "sniper" ? round * 0.02 : 0;
      pool.push({ kind, w: def.weight + roundBoost });
    }
  }
  if (pool.length === 0) return "drifter";
  let roll = Math.random() * pool.reduce((s, p) => s + p.w, 0);
  for (const p of pool) {
    roll -= p.w;
    if (roll <= 0) return p.kind;
  }
  return pool[pool.length - 1]!.kind;
}
