export type Vec2 = { x: number; y: number };

export type EnemyKind = "drifter" | "stalker" | "splitter";

export type ParticleKind = "spark" | "trail" | "glow" | "gem" | "explosion" | "shatter";

export type GamePhase = "ready" | "playing" | "paused" | "draft" | "gameover";

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
