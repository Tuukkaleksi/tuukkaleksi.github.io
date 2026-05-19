export type Vec2 = { x: number; y: number };

export type EnemyKind =
  | "drifter"
  | "stalker"
  | "splitter"
  | "orbiter"
  | "sniper"
  | "swarmer"
  | "tank";

export type BossId = "driftColossus";

export type ParticleKind = "spark" | "trail" | "glow" | "gem" | "explosion" | "shatter";

export type GamePhase =
  | "ready"
  | "playing"
  | "paused"
  | "draft"
  | "bossIntro"
  | "bossFight"
  | "gameover";

export type InputState = {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  fire: boolean;
  pointerX: number | null;
  pointerY: number | null;
};

export type ThemeColors = {
  primary: string;
  primaryHover: string;
  background: string;
  foreground: string;
  surface: string;
};

export type StarLayer = {
  x: number;
  y: number;
  z: number;
  s: number;
  layer: number;
  hue: number;
};

export type TrailPoint = { x: number; y: number; life: number };

export type RunStats = {
  kills: number;
  timeSurvived: number;
  bestCombo: number;
  nearMissStreak: number;
  bestNearMissStreak: number;
  picks: string[];
  bossesDefeated: number;
};
