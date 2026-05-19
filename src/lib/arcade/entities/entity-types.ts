import type { BossId, EnemyKind, ParticleKind } from "@/lib/arcade/types";
import type { PowerUpId } from "@/lib/arcade/power-ups";

export type Bullet = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  player: boolean;
  pierceLeft: number;
};

export type Enemy = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  hp: number;
  maxHp: number;
  kind: EnemyKind;
  r: number;
  wobble: number;
  speed: number;
  nearMissed: boolean;
  isBoss: boolean;
  bossId?: BossId;
  /** Sniper aim cooldown */
  aimCd: number;
  /** Orbiter angle */
  orbitAngle: number;
  /** Boss pattern timer */
  patternCd: number;
  phase: number;
};

export type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  kind: ParticleKind;
  size: number;
};

export type Gem = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  magnet: boolean;
  risk?: boolean;
};

export type PowerUpPickup = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  kind: PowerUpId;
  spin: number;
};
