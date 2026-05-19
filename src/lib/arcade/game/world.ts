import type { ArcadeAudio } from "@/lib/arcade/audio";
import type { BeatClock } from "@/lib/arcade/beat";
import type {
  Bullet,
  Enemy,
  Gem,
  Particle,
  PowerUpPickup,
} from "@/lib/arcade/entities/entity-types";
import { PowerUpState, type PowerUpId } from "@/lib/arcade/power-ups";
import type {
  BossId,
  GamePhase,
  InputState,
  StarLayer,
  ThemeColors,
  TrailPoint,
  Vec2,
  RunStats,
} from "@/lib/arcade/types";

export function emptyRunStats(): RunStats {
  return {
    kills: 0,
    timeSurvived: 0,
    bestCombo: 0,
    nearMissStreak: 0,
    bestNearMissStreak: 0,
    picks: [],
    bossesDefeated: 0,
  };
}

export class GameWorld {
  bullets: Bullet[] = [];
  enemies: Enemy[] = [];
  particles: Particle[] = [];
  gems: Gem[] = [];
  powerUps: PowerUpPickup[] = [];

  input: InputState = {
    left: false,
    right: false,
    up: false,
    down: false,
    fire: false,
    pointerX: null,
    pointerY: null,
  };

  w = 0;
  h = 0;
  phase: GamePhase = "ready";
  score = 0;
  combo = 0;
  comboTimer = 0;
  wave = 1;
  round = 1;
  lives = 3;
  powers = new PowerUpState();
  draftChoices: PowerUpId[] = [];
  fireCd = 0;
  dashQueued = false;
  spawnCd = 0;
  waveTimer = 0;
  shake = 0;
  player: Vec2 = { x: 0, y: 0 };
  playerAngle = -Math.PI / 2;
  moveVx = 0;
  moveVy = 0;
  stars: StarLayer[] = [];
  trails: TrailPoint[] = [];
  chroma = 0;
  deathFlash = 0;
  playTime = 0;
  overloadTier = 0;
  overloadFlash = 0;
  hitSlowTimer = 0;
  bgHue = 220;
  bossActive = false;
  bossIntroTimer = 0;
  pendingBossId: BossId | null = null;
  bossTelegraph: BossId | null = null;
  /** Wave number we already started a boss for (prevents re-trigger). */
  bossWaveTriggered = 0;
  nearMissStreak = 0;
  runStats = emptyRunStats();
  dailySeed = 0;

  colors: ThemeColors;
  audio: ArcadeAudio;
  beat: BeatClock;

  constructor(colors: ThemeColors, audio: ArcadeAudio, beat: BeatClock) {
    this.colors = colors;
    this.audio = audio;
    this.beat = beat;
  }

  clearEntities() {
    this.bullets.length = 0;
    this.enemies.length = 0;
    this.particles.length = 0;
    this.gems.length = 0;
    this.powerUps.length = 0;
    this.trails.length = 0;
    this.chroma = 0;
    this.deathFlash = 0;
    this.playTime = 0;
    this.overloadTier = 0;
    this.overloadFlash = 0;
    this.hitSlowTimer = 0;
    this.bgHue = 220;
    this.bossActive = false;
    this.bossIntroTimer = 0;
    this.pendingBossId = null;
    this.bossTelegraph = null;
    this.bossWaveTriggered = 0;
    this.nearMissStreak = 0;
  }
}
