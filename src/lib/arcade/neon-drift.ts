import { ArcadeAudio } from "@/lib/arcade/audio";
import { BeatClock } from "@/lib/arcade/beat";
import {
  drawPowerUpIcon,
  PowerUpState,
  rollDraftChoices,
  rollPickupKind,
  type PowerUpId,
} from "@/lib/arcade/power-ups";
import type {
  EnemyKind,
  GamePhase,
  InputState,
  ParticleKind,
  StarLayer,
  ThemeColors,
  TrailPoint,
  Vec2,
} from "@/lib/arcade/types";

const HIGH_SCORE_KEY = "neon-drift-high";
const MAX_PARTICLES = 100;
const MAX_ENEMIES = 42;

type Bullet = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  player: boolean;
  pierceLeft: number;
};
type Enemy = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  hp: number;
  kind: EnemyKind;
  r: number;
  wobble: number;
  speed: number;
  nearMissed: boolean;
};
type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  kind: ParticleKind;
  size: number;
};
type Gem = { x: number; y: number; vx: number; vy: number; magnet: boolean };
type PowerUp = { x: number; y: number; vx: number; vy: number; kind: PowerUpId; spin: number };

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function dist(ax: number, ay: number, bx: number, by: number) {
  return Math.hypot(bx - ax, by - ay);
}

function norm(dx: number, dy: number) {
  const len = Math.hypot(dx, dy) || 1;
  return { x: dx / len, y: dy / len };
}

export type GameStats = {
  score: number;
  combo: number;
  wave: number;
  lives: number;
  highScore: number;
  phase: GamePhase;
  overloadTier: number;
};

export type NeonDriftCallbacks = {
  onStats: (stats: GameStats) => void;
  onPhase: (phase: GamePhase) => void;
  onScorePop?: () => void;
  onOverload?: () => void;
  onDraft?: (choices: PowerUpId[]) => void;
};

export class NeonDriftGame {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private colors: ThemeColors;
  private audio: ArcadeAudio;
  private cb: NeonDriftCallbacks;

  private bullets: Bullet[] = [];
  private enemies: Enemy[] = [];
  private particles: Particle[] = [];
  private gems: Gem[] = [];
  private powerUps: PowerUp[] = [];

  private input: InputState = {
    left: false,
    right: false,
    up: false,
    down: false,
    fire: false,
    pointerX: null,
    pointerY: null,
  };

  private w = 0;
  private h = 0;
  private dpr = 1;
  private raf = 0;
  private last = 0;
  private acc = 0;
  private readonly step = 1 / 60;

  private phase: GamePhase = "ready";
  private score = 0;
  private combo = 0;
  private comboTimer = 0;
  private wave = 1;
  private lives = 3;
  private highScore = 0;
  private powers = new PowerUpState();
  private draftChoices: PowerUpId[] = [];
  private fireCd = 0;
  private dashQueued = false;
  private spawnCd = 0;
  private waveTimer = 0;
  private shake = 0;
  private player: Vec2 = { x: 0, y: 0 };
  private playerAngle = -Math.PI / 2;
  private moveVx = 0;
  private moveVy = 0;
  private stars: StarLayer[] = [];
  private trails: TrailPoint[] = [];
  private chroma = 0;
  private deathFlash = 0;
  private beat: BeatClock;
  private playTime = 0;
  private overloadTier = 0;
  private overloadFlash = 0;
  private hitSlowTimer = 0;
  private bgHue = 220;

  constructor(
    canvas: HTMLCanvasElement,
    colors: ThemeColors,
    audio: ArcadeAudio,
    callbacks: NeonDriftCallbacks,
  ) {
    this.canvas = canvas;
    const ctx = canvas.getContext("2d", { alpha: false, desynchronized: true });
    if (!ctx) throw new Error("Canvas 2D unavailable");
    this.ctx = ctx;
    this.colors = colors;
    this.audio = audio;
    this.cb = callbacks;
    this.highScore = Number(localStorage.getItem(HIGH_SCORE_KEY) ?? 0) || 0;
    this.beat = new BeatClock(128, () => audio.getMusicTime());
    this.initStars();
    this.resize();
    this.resetWorld();
  }

  getStats(): GameStats {
    return {
      score: this.score,
      combo: this.combo,
      wave: this.wave,
      lives: this.lives,
      highScore: this.highScore,
      phase: this.phase,
      overloadTier: this.overloadTier,
    };
  }

  getOverloadFlash() {
    return this.overloadFlash;
  }

  getHudPowerId(): PowerUpId | null {
    return this.powers.getHudDisplayId();
  }

  getDraftChoices(): PowerUpId[] {
    return this.draftChoices;
  }

  pickDraft(index: number) {
    if (this.phase !== "draft" || index < 0 || index >= this.draftChoices.length) return;
    this.applyPower(this.draftChoices[index]!);
    this.draftChoices = [];
    this.overloadFlash = 1.8;
    this.phase = "playing";
    this.last = performance.now();
    this.cb.onOverload?.();
    this.emit();
  }

  queueDash() {
    this.dashQueued = true;
  }

  setInput(partial: Partial<InputState>) {
    Object.assign(this.input, partial);
  }

  setColors(colors: ThemeColors) {
    this.colors = colors;
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.w = Math.max(320, rect.width);
    this.h = Math.max(480, rect.height);
    this.canvas.width = Math.floor(this.w * this.dpr);
    this.canvas.height = Math.floor(this.h * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    if (this.phase === "ready") {
      this.player.x = this.w / 2;
      this.player.y = this.h / 2;
    }
  }

  private clearEntities() {
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
  }

  resetWorld() {
    this.clearEntities();
    this.phase = "ready";
    this.score = 0;
    this.combo = 0;
    this.comboTimer = 0;
    this.wave = 1;
    this.lives = 3;
    this.powers.reset();
    this.draftChoices = [];
    this.fireCd = 0;
    this.dashQueued = false;
    this.spawnCd = 0;
    this.waveTimer = 0;
    this.shake = 0;
    this.moveVx = 0;
    this.moveVy = 0;
    this.player.x = this.w / 2;
    this.player.y = this.h / 2;
    this.playerAngle = -Math.PI / 2;
    this.acc = 0;
    this.emit();
  }

  start() {
    this.clearEntities();
    this.score = 0;
    this.combo = 0;
    this.comboTimer = 0;
    this.wave = 1;
    this.lives = 3;
    this.powers.reset();
    this.draftChoices = [];
    this.fireCd = 0;
    this.dashQueued = false;
    this.spawnCd = 0.5;
    this.waveTimer = 0;
    this.playTime = 0;
    this.overloadTier = 0;
    this.overloadFlash = 0;
    this.hitSlowTimer = 0;
    this.bgHue = 220;
    this.shake = 0;
    this.moveVx = 0;
    this.moveVy = 0;
    this.player.x = this.w / 2;
    this.player.y = this.h / 2;
    this.playerAngle = -Math.PI / 2;
    this.phase = "playing";
    this.audio.start();
    void this.audio.playMusic();
    this.emit();
  }

  pause() {
    if (this.phase === "playing") {
      this.phase = "paused";
      this.audio.pauseMusic();
      this.emit();
    }
  }

  resume() {
    if (this.phase === "paused") {
      this.phase = "playing";
      this.last = performance.now();
      void this.audio.playMusic();
      this.emit();
    }
  }

  togglePause() {
    if (this.phase === "playing") this.pause();
    else if (this.phase === "paused") this.resume();
  }

  restart() {
    this.start();
  }

  run() {
    this.last = performance.now();
    const loop = (now: number) => {
      this.raf = requestAnimationFrame(loop);
      let dt = (now - this.last) / 1000;
      this.last = now;
      dt = Math.min(dt, 0.05);
      if (this.phase === "playing") {
        const slow = this.hitSlowTimer > 0 ? 0.32 : 1;
        if (this.hitSlowTimer > 0) this.hitSlowTimer = Math.max(0, this.hitSlowTimer - dt);
        const simDt = dt * slow;
        this.audio.tick(simDt);
        this.acc += simDt;
        while (this.acc >= this.step) {
          this.tick(this.step);
          this.acc -= this.step;
        }
      }
      this.draw(dt);
    };
    this.raf = requestAnimationFrame(loop);
  }

  destroy() {
    cancelAnimationFrame(this.raf);
    this.resetWorld();
  }

  private emit() {
    this.cb.onStats(this.getStats());
    this.cb.onPhase(this.phase);
  }

  private initStars() {
    this.stars = Array.from({ length: 52 }, () => ({
      x: Math.random(),
      y: Math.random(),
      z: 0.2 + Math.random() * 0.8,
      s: 0.4 + Math.random() * 2.2,
      layer: Math.floor(Math.random() * 3),
      hue: Math.random() < 0.35 ? 200 + Math.random() * 60 : 280 + Math.random() * 40,
    }));
  }

  private pushTrail() {
    this.trails.push({
      x: this.player.x - Math.cos(this.playerAngle) * 16,
      y: this.player.y - Math.sin(this.playerAngle) * 16,
      life: 0.55,
    });
    if (this.trails.length > 16) this.trails.shift();
  }

  private checkDraft() {
    const tier = Math.floor(this.playTime / 30);
    if (tier <= this.overloadTier) return;
    this.overloadTier = tier;
    this.bgHue = 220 + tier * 14;
    this.audio.setMusicIntensity(tier);
    this.draftChoices = rollDraftChoices(tier);
    this.phase = "draft";
    this.cb.onDraft?.(this.draftChoices);
    this.emit();
  }

  private applyPower(id: PowerUpId) {
    const p = this.powers;
    p.showHud(id, 5);
    switch (id) {
      case "overclock":
        p.overclock = 8;
        this.audio.setOverclock(true);
        break;
      case "magnet":
        p.magnet = 12;
        break;
      case "dash":
        p.dashUnlocked = true;
        p.dashCd = 0;
        break;
      case "aura":
        p.aura = 9;
        break;
      case "pierce":
        p.pierce = true;
        break;
      case "multiplier":
        p.multiplier = 15;
        break;
      case "pulse":
        p.pulseUnlocked = true;
        p.pulseCd = 0;
        this.triggerPulse();
        break;
      case "drone":
        p.drones = Math.min(2, p.drones + 1);
        p.droneList.push({ angle: p.drones * Math.PI, fireCd: 0 });
        break;
      case "berserk":
        p.berserk = 7;
        break;
      case "shield":
        p.shield = 10;
        break;
      case "triple":
        p.triple = true;
        break;
      case "timeBomb":
        this.triggerTimeBomb();
        break;
    }
    this.audio.powerUp();
    this.spawnParticle(this.player.x, this.player.y, "gem", 0.8);
  }

  private triggerPulse() {
    this.powers.pulseWave = 0.55;
    for (const e of this.enemies) {
      const dx = e.x - this.player.x;
      const dy = e.y - this.player.y;
      const d = Math.hypot(dx, dy) || 1;
      if (d < 220) {
        e.x += (dx / d) * 90;
        e.y += (dy / d) * 90;
      }
    }
    this.shake = 0.15;
  }

  private triggerTimeBomb() {
    const r = 200;
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i]!;
      if (dist(e.x, e.y, this.player.x, this.player.y) < r) {
        this.spawnParticle(e.x, e.y, "shatter", 0.9);
        this.enemies.splice(i, 1);
        this.addScore(Math.floor(15 * this.powers.scoreMult()));
      }
    }
    this.shake = 0.25;
    this.deathFlash = 0.15;
  }

  private aimAngle(): number {
    if (this.input.pointerX != null && this.input.pointerY != null) {
      return Math.atan2(
        this.input.pointerY - this.player.y,
        this.input.pointerX - this.player.x,
      );
    }
    if (Math.hypot(this.moveVx, this.moveVy) > 8) {
      return Math.atan2(this.moveVy, this.moveVx);
    }
    return this.playerAngle;
  }

  private tick(dt: number) {
    this.playTime += dt;
    if (this.overloadFlash > 0) this.overloadFlash = Math.max(0, this.overloadFlash - dt);
    this.checkDraft();
    this.powers.tickHud(dt);
    if (this.powers.dashCd > 0) this.powers.dashCd -= dt;
    if (this.powers.overclock > 0) this.powers.overclock -= dt;
    else this.audio.setOverclock(false);
    if (this.powers.magnet > 0) this.powers.magnet -= dt;
    if (this.powers.aura > 0) this.powers.aura -= dt;
    if (this.powers.multiplier > 0) this.powers.multiplier -= dt;
    if (this.powers.berserk > 0) this.powers.berserk -= dt;
    if (this.powers.shield > 0) this.powers.shield -= dt;
    if (this.powers.pulseWave > 0) this.powers.pulseWave -= dt;
    if (this.powers.pulseUnlocked) {
      this.powers.pulseCd -= dt;
      if (this.powers.pulseCd <= 0) {
        this.powers.pulseCd = 2.6;
        this.triggerPulse();
      }
    }

    this.updatePlayer(dt);
    this.updateDrones(dt);
    this.updateCombat(dt);
    this.updateEntities(dt);
    this.updateSpawner(dt);
    if (this.comboTimer > 0) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) this.combo = 0;
    }
    this.waveTimer += dt;
    if (this.waveTimer > 14) {
      this.waveTimer = 0;
      this.wave += 1;
    }
  }

  private tryDash() {
    const p = this.powers;
    if (!p.dashUnlocked || p.dashCd > 0 || p.dashInvuln > 0) return;
    let dx = this.moveVx;
    let dy = this.moveVy;
    if (Math.hypot(dx, dy) < 8) {
      dx = Math.cos(this.playerAngle);
      dy = Math.sin(this.playerAngle);
    }
    const n = norm(dx, dy);
    const dist = 110;
    this.player.x = clamp(this.player.x + n.x * dist, 32, this.w - 32);
    this.player.y = clamp(this.player.y + n.y * dist, 32, this.h - 32);
    p.dashInvuln = 0.22;
    p.dashCd = 2.2;
    p.showHud("dash", 1.2);
    this.spawnParticle(this.player.x, this.player.y, "glow", 0.7);
  }

  private updatePlayer(dt: number) {
    if (this.dashQueued) {
      this.dashQueued = false;
      this.tryDash();
    }

    const margin = 32;
    let moveSpeed = 340;
    if (this.powers.isBerserk()) moveSpeed *= 1.28;
    let ax = 0;
    let ay = 0;

    if (this.input.left) ax -= 1;
    if (this.input.right) ax += 1;
    if (this.input.up) ay -= 1;
    if (this.input.down) ay += 1;

    if (ax !== 0 || ay !== 0) {
      const n = norm(ax, ay);
      this.player.x += n.x * moveSpeed * dt;
      this.player.y += n.y * moveSpeed * dt;
      this.moveVx = n.x * moveSpeed;
      this.moveVy = n.y * moveSpeed;
    } else {
      this.moveVx *= 0.88;
      this.moveVy *= 0.88;
    }

    this.player.x = clamp(this.player.x, margin, this.w - margin);
    this.player.y = clamp(this.player.y, margin, this.h - margin);

    this.playerAngle = this.aimAngle();

    if (this.powers.dashInvuln > 0) this.powers.dashInvuln -= dt;

    let rate = 0.11;
    if (this.powers.isBerserk()) rate = 0.055;
    else if (this.powers.triple) rate = 0.09;
    this.fireCd -= dt;
    if (this.fireCd <= 0) {
      this.fireCd = rate;
      this.fireBullet();
    }

    if (this.phase === "playing") {
      this.pushTrail();
      const bass = this.audio.getBassEnergy();
      if (Math.hypot(this.moveVx, this.moveVy) > 40 && Math.random() < 0.25 + bass * 0.35) {
        this.spawnParticle(
          this.player.x - Math.cos(this.playerAngle) * 14,
          this.player.y - Math.sin(this.playerAngle) * 14,
          "glow",
          0.4,
        );
      }
    }
  }

  private fireBullet() {
    const angle = this.playerAngle;
    const spread = this.powers.triple || this.powers.isBerserk() ? 0.14 : 0;
    const angles =
      this.powers.triple || this.powers.isBerserk() ? [-spread, 0, spread] : [0];
    const speed = this.powers.isBerserk() ? 760 : 680;
    const pierceLeft = this.powers.pierce ? 5 : 1;
    for (const a of angles) {
      const dir = angle + a;
      this.bullets.push({
        x: this.player.x + Math.cos(dir) * 20,
        y: this.player.y + Math.sin(dir) * 20,
        vx: Math.cos(dir) * speed,
        vy: Math.sin(dir) * speed,
        life: 1.1,
        player: true,
        pierceLeft,
      });
    }
    this.audio.shoot();
  }

  private updateDrones(dt: number) {
    for (const d of this.powers.droneList) {
      d.angle += dt * 2.2;
      d.fireCd -= dt;
      if (d.fireCd > 0) continue;
      d.fireCd = 0.35;
      const x = this.player.x + Math.cos(d.angle) * 42;
      const y = this.player.y + Math.sin(d.angle) * 42;
      let nearest: Enemy | null = null;
      let best = Infinity;
      for (const e of this.enemies) {
        const dd = dist(x, y, e.x, e.y);
        if (dd < best) {
          best = dd;
          nearest = e;
        }
      }
      if (!nearest) continue;
      const a = Math.atan2(nearest.y - y, nearest.x - x);
      const sp = 520;
      this.bullets.push({
        x,
        y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        life: 0.9,
        player: true,
        pierceLeft: 1,
      });
    }
  }

  private homeEnemy(e: Enemy, dt: number) {
    const dx = this.player.x - e.x;
    const dy = this.player.y - e.y;
    const d = Math.hypot(dx, dy) || 1;
    const n = { x: dx / d, y: dy / d };
    const wobble = Math.sin(e.wobble) * 0.22;
    const perpX = -n.y * wobble;
    const perpY = n.x * wobble;

    let speed = e.speed;
    if (e.kind === "stalker") speed *= 1.35;
    if (e.kind === "splitter") speed *= 0.92;

    e.vx = (n.x + perpX) * speed;
    e.vy = (n.y + perpY) * speed;
    const escale = this.powers.enemyTimeScale();
    e.x += e.vx * dt * escale;
    e.y += e.vy * dt * escale;
    e.wobble += dt * (e.kind === "stalker" ? 6 : 4);
  }

  private updateCombat(dt: number) {
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i]!;
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.life -= dt;
      if (b.life <= 0 || b.x < -30 || b.x > this.w + 30 || b.y < -30 || b.y > this.h + 30) {
        this.bullets.splice(i, 1);
        continue;
      }
      if (!b.player) continue;
      let hit = false;
      for (let j = this.enemies.length - 1; j >= 0; j--) {
        const e = this.enemies[j]!;
        if (dist(b.x, b.y, e.x, e.y) < e.r + 6) {
          this.damageEnemy(e, j, 1);
          hit = true;
          b.pierceLeft -= 1;
          if (b.pierceLeft <= 0) break;
        }
      }
      if (hit && b.pierceLeft <= 0) this.bullets.splice(i, 1);
    }
  }

  private damageEnemy(e: Enemy, index: number, dmg: number) {
    e.hp -= dmg;
    this.spawnParticle(e.x, e.y, "spark", 0.55);
    if (e.hp > 0) return;
    this.enemies.splice(index, 1);
    this.spawnParticle(e.x, e.y, "shatter", 1.1);
    const mult = (1 + this.combo * 0.15) * this.powers.scoreMult();
    const pts = Math.floor((e.kind === "splitter" ? 35 : e.kind === "stalker" ? 22 : 12) * mult);
    this.addScore(pts);
    this.combo += 1;
    this.comboTimer = 2.4;
    this.audio.enemyDeath();
    this.shake = 0.08 + this.audio.getBassEnergy() * 0.08;
    if (Math.random() < 0.55) {
      this.gems.push({ x: e.x, y: e.y, vx: 0, vy: 0, magnet: false });
    }
    if (e.kind === "splitter") {
      for (let k = 0; k < 2; k++) {
        const off = k ? 18 : -18;
        const child = this.spawnEnemyAt(e.x + off, e.y, "drifter", this.wave);
        if (child) {
          child.hp = 1;
          child.r = 14;
        }
      }
    }
    if (Math.random() < 0.07 + this.wave * 0.004) {
      this.powerUps.push({
        x: e.x,
        y: e.y,
        vx: 0,
        vy: 0,
        kind: rollPickupKind(),
        spin: Math.random() * Math.PI * 2,
      });
    }
  }

  private addScore(n: number) {
    this.score += n;
    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem(HIGH_SCORE_KEY, String(this.highScore));
    }
    this.cb.onStats(this.getStats());
    this.cb.onScorePop?.();
  }

  private updateEntities(dt: number) {
    if (this.powers.aura > 0) {
      for (let i = this.enemies.length - 1; i >= 0; i--) {
        const e = this.enemies[i]!;
        const d = dist(e.x, e.y, this.player.x, this.player.y);
        if (d < 72 && d > e.r + 8) {
          e.hp -= dt * 1.8;
          if (e.hp <= 0) this.damageEnemy(e, i, 0);
          if (Math.random() < 0.15) this.spawnParticle(e.x, e.y, "spark", 0.35);
        }
      }
    }

    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i]!;
      this.homeEnemy(e, dt);
      const d = dist(e.x, e.y, this.player.x, this.player.y);
      if (d > Math.max(this.w, this.h) * 1.4) {
        this.enemies.splice(i, 1);
        continue;
      }
      const nearBand = e.r + 38;
      if (!e.nearMissed && d < nearBand && d > e.r + 15) {
        e.nearMissed = true;
        this.audio.nearMiss();
      }
      if (d < e.r + 14 && this.powers.dashInvuln <= 0) {
        this.playerHit();
        this.enemies.splice(i, 1);
      }
    }

    const magnetR = this.powers.hasMagnet() ? 200 : 100;
    for (let i = this.gems.length - 1; i >= 0; i--) {
      const g = this.gems[i]!;
      const d = dist(g.x, g.y, this.player.x, this.player.y);
      if (d < magnetR) g.magnet = true;
      if (g.magnet) {
        const pull = clamp(320 / Math.max(d, 20), 0.6, 10);
        g.x += ((this.player.x - g.x) / d) * pull * 70 * dt;
        g.y += ((this.player.y - g.y) / d) * pull * 70 * dt;
      }
      if (d < 22) {
        this.gems.splice(i, 1);
        this.addScore(Math.floor((8 + this.combo * 2) * this.powers.scoreMult()));
        this.comboTimer = Math.max(this.comboTimer, 1.5);
        this.audio.gem();
        this.spawnParticle(g.x, g.y, "gem", 0.4);
      }
    }

    for (let i = this.powerUps.length - 1; i >= 0; i--) {
      const pu = this.powerUps[i]!;
      const d = dist(pu.x, pu.y, this.player.x, this.player.y);
      if (d < magnetR) {
        const pull = clamp(280 / Math.max(d, 16), 0.5, 9);
        pu.x += ((this.player.x - pu.x) / d) * pull * 55 * dt;
        pu.y += ((this.player.y - pu.y) / d) * pull * 55 * dt;
      }
      if (d < 28) {
        this.powerUps.splice(i, 1);
        this.applyPower(pu.kind);
      }
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i]!;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      p.vx *= 0.96;
      p.vy *= 0.96;
      if (p.life <= 0) this.particles.splice(i, 1);
    }

    for (let i = this.trails.length - 1; i >= 0; i--) {
      const tr = this.trails[i]!;
      tr.life -= dt;
      if (tr.life <= 0) this.trails.splice(i, 1);
    }

    if (this.chroma > 0) this.chroma = Math.max(0, this.chroma - dt * 1.2);
    if (this.deathFlash > 0) this.deathFlash = Math.max(0, this.deathFlash - dt * 2.5);
  }

  private playerHit() {
    if (this.powers.dashInvuln > 0) return;
    if (this.powers.shield > 0) {
      this.powers.shield = 0;
      this.shake = 0.2;
      this.audio.hit();
      this.spawnParticle(this.player.x, this.player.y, "explosion", 0.7);
      return;
    }
    this.lives -= 1;
    this.combo = 0;
    this.comboTimer = 0;
    this.hitSlowTimer = 0.22;
    this.shake = 0.35;
    this.chroma = Math.max(this.chroma, 0.55);
    this.audio.damage();
    this.spawnParticle(this.player.x, this.player.y, "explosion", 1);
    this.cb.onStats(this.getStats());
    if (this.lives <= 0) {
      this.hitSlowTimer = 0.4;
      this.phase = "gameover";
      this.chroma = 1;
      this.deathFlash = 1;
      this.audio.gameOver();
      this.emit();
    }
  }

  private spawnEnemyAt(x: number, y: number, kind: EnemyKind, wave: number): Enemy | null {
    if (this.enemies.length >= MAX_ENEMIES) return null;
    const speed = 75 + wave * 12 + this.overloadTier * 8 + Math.random() * 25;
    const e: Enemy = {
      x,
      y,
      vx: 0,
      vy: 0,
      hp: kind === "splitter" ? 2 : kind === "stalker" ? 2 : 1,
      kind,
      r: kind === "splitter" ? 22 : kind === "stalker" ? 18 : 16,
      wobble: Math.random() * Math.PI * 2,
      speed,
      nearMissed: false,
    };
    this.enemies.push(e);
    return e;
  }

  private spawnFromEdge(): void {
    const pad = 36;
    const side = Math.floor(Math.random() * 4);
    let x = 0;
    let y = 0;
    if (side === 0) {
      x = pad + Math.random() * (this.w - pad * 2);
      y = -pad;
    } else if (side === 1) {
      x = this.w + pad;
      y = pad + Math.random() * (this.h - pad * 2);
    } else if (side === 2) {
      x = pad + Math.random() * (this.w - pad * 2);
      y = this.h + pad;
    } else {
      x = -pad;
      y = pad + Math.random() * (this.h - pad * 2);
    }

    const roll = Math.random();
    let kind: EnemyKind = "drifter";
    if (roll > 0.62 && this.wave >= 2) kind = "stalker";
    if (roll > 0.86 && this.wave >= 3) kind = "splitter";

    this.spawnEnemyAt(x, y, kind, this.wave);
  }

  private updateSpawner(dt: number) {
    this.spawnCd -= dt;
    if (this.spawnCd > 0) return;
    if (!this.beat.onBeat(0.84)) {
      this.spawnCd = 0.03;
      return;
    }

    const base = Math.max(0.14, 0.55 - this.wave * 0.035 - this.overloadTier * 0.04);
    this.spawnCd = base * (0.55 + Math.random() * 0.5);

    let count = 1;
    if (this.overloadTier >= 1 && Math.random() < 0.4 + this.overloadTier * 0.12) count += 1;
    if (this.overloadTier >= 2 && Math.random() < 0.25) count += 1;
    for (let i = 0; i < count; i++) this.spawnFromEdge();
  }

  private spawnParticle(x: number, y: number, kind: ParticleKind, intensity: number) {
    const bass = this.audio.getBassEnergy();
    const bassBoost = 1 + bass * 0.5;
    let count =
      kind === "explosion"
        ? 12
        : kind === "shatter"
          ? Math.floor(14 * bassBoost)
          : kind === "spark"
            ? 5
            : kind === "glow"
              ? 2
              : 2;
    if (this.particles.length >= MAX_PARTICLES) return;
    count = Math.min(count, MAX_PARTICLES - this.particles.length);
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = (kind === "shatter" ? 120 : 80 + Math.random() * 160) * intensity;
      this.particles.push({
        x,
        y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        life: 0.15 + Math.random() * (kind === "shatter" ? 0.55 : 0.5) * intensity,
        maxLife: kind === "glow" ? 0.45 : 0.75,
        kind,
        size: kind === "shatter" ? 2 + Math.random() * 5 : 2 + Math.random() * 3,
      });
    }
  }

  private draw(dt: number) {
    const ctx = this.ctx;
    const shakeX = this.shake > 0 ? (Math.random() - 0.5) * this.shake * 18 : 0;
    const shakeY = this.shake > 0 ? (Math.random() - 0.5) * this.shake * 18 : 0;
    if (this.shake > 0) this.shake = Math.max(0, this.shake - dt * 1.8);

    ctx.save();
    ctx.translate(shakeX, shakeY);

    const primary = this.parseColor(this.colors.primary, "#0563bb");
    const fg = this.parseColor(this.colors.foreground, "#e8eaed");

    const pulse = this.beat.pulse();
    const bass = this.audio.getBassEnergy();
    const playing = this.phase === "playing";

    if (playing) {
      const pump = 1 + pulse * 0.014 + bass * 0.006;
      const cx = this.w / 2;
      const cy = this.h / 2;
      ctx.translate(cx, cy);
      ctx.scale(pump, pump);
      ctx.translate(-cx, -cy);
    }

    const bgTint = `hsl(${this.bgHue}, 22%, ${7 + this.overloadTier * 1.2}%)`;
    ctx.fillStyle = bgTint;
    ctx.fillRect(0, 0, this.w, this.h);

    const parallaxX = playing ? this.moveVx * 0.00005 : 0;
    const parallaxY = playing ? this.moveVy * 0.00005 : 0;

    for (const s of this.stars) {
      const layerSpeed = (0.004 + s.layer * 0.006) * s.z;
      s.y += layerSpeed * (playing ? 1.4 : 0.25);
      if (s.y > 1) s.y = 0;
      const alpha = (0.025 + s.z * 0.05) * (0.6 + s.layer * 0.12);
      ctx.fillStyle = `hsla(${s.hue}, 40%, 75%, ${alpha})`;
      const px = s.x * this.w + parallaxX * this.w * (s.layer + 1) * 5;
      const py = s.y * this.h + parallaxY * this.h * (s.layer + 1) * 5;
      ctx.fillRect(px, py, s.s, s.s);
    }

    const flicker = 0.028 + pulse * 0.062;
    const vignette = ctx.createRadialGradient(
      this.w / 2,
      this.h / 2,
      this.w * 0.12,
      this.w / 2,
      this.h / 2,
      this.w * 0.75,
    );
    vignette.addColorStop(0, `rgba(59, 158, 255, ${flicker})`);
    vignette.addColorStop(1, "rgba(0,0,0,0.35)");
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, this.w, this.h);

    const gridAlpha = 0.026 + pulse * 0.034;
    ctx.strokeStyle = `rgba(90, 140, 200, ${gridAlpha})`;
    ctx.lineWidth = 1;
    const grid = 48;
    const off = (performance.now() * 0.02) % grid;
    ctx.beginPath();
    for (let x = -off; x < this.w; x += grid) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.h);
    }
    for (let y = off; y < this.h; y += grid) {
      ctx.moveTo(0, y);
      ctx.lineTo(this.w, y);
    }
    ctx.stroke();

    const showWorld = this.phase === "playing" || this.phase === "paused" || this.phase === "gameover";

    if (this.powers.pulseWave > 0) {
      const pr = this.powers.pulseWave / 0.55;
      ctx.strokeStyle = `rgba(56, 189, 248, ${(1 - pr) * 0.35})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(this.player.x, this.player.y, 40 + (1 - pr) * 160, 0, Math.PI * 2);
      ctx.stroke();
    }

    if (showWorld && this.trails.length > 1) {
      const trailGlow = 0.28 + bass * 0.22 + (this.powers.isBerserk() ? 0.2 : 0);
      for (let i = 1; i < this.trails.length; i++) {
        const a = this.trails[i - 1]!;
        const b = this.trails[i]!;
        const t = b.life / 0.55;
        ctx.strokeStyle = `rgba(59, 158, 255, ${t * trailGlow})`;
        ctx.lineWidth = 2 + t * 8;
        ctx.lineCap = "round";
        ctx.shadowColor = "rgba(59, 158, 255, 0.65)";
        ctx.shadowBlur = 10 * t;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
    }

    if (showWorld) {
      for (const g of this.gems) {
        ctx.beginPath();
        ctx.fillStyle = primary;
        ctx.globalAlpha = 0.9;
        ctx.moveTo(g.x, g.y - 8);
        ctx.lineTo(g.x + 7, g.y);
        ctx.lineTo(g.x, g.y + 8);
        ctx.lineTo(g.x - 7, g.y);
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      const now = performance.now() / 1000;
      for (const pu of this.powerUps) {
        pu.spin += 0.02;
        drawPowerUpIcon(ctx, pu.kind, pu.x, pu.y, now + pu.spin);
      }

      for (const b of this.bullets) {
        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.rotate(Math.atan2(b.vy, b.vx));
        ctx.fillStyle = primary;
        ctx.fillRect(-2, -6, 4, 12);
        ctx.restore();
      }

      for (const e of this.enemies) {
        ctx.save();
        ctx.translate(e.x, e.y);
        const face = Math.atan2(this.player.y - e.y, this.player.x - e.x);
        ctx.rotate(face + Math.sin(e.wobble) * 0.1);
        if (e.kind === "splitter") {
          ctx.fillStyle = "#a78bfa";
          ctx.beginPath();
          ctx.moveTo(e.r, 0);
          ctx.lineTo(-e.r * 0.6, e.r * 0.55);
          ctx.lineTo(-e.r * 0.6, -e.r * 0.55);
          ctx.closePath();
        } else if (e.kind === "stalker") {
          ctx.fillStyle = "#fb7185";
          ctx.beginPath();
          ctx.rect(-e.r * 0.7, -e.r * 0.7, e.r * 1.4, e.r * 1.4);
        } else {
          ctx.fillStyle = "#94a3b8";
          ctx.beginPath();
          ctx.arc(0, 0, e.r, 0, Math.PI * 2);
        }
        ctx.fill();
        ctx.restore();
      }

      for (const p of this.particles) {
        const t = p.life / p.maxLife;
        ctx.globalAlpha = clamp(t, 0, 1);
        if (p.kind === "gem" || p.kind === "glow") ctx.fillStyle = primary;
        else if (p.kind === "explosion") ctx.fillStyle = "#f97316";
        else if (p.kind === "shatter") ctx.fillStyle = p.size > 4 ? "#c084fc" : "#fb7185";
        else ctx.fillStyle = fg;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * t, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }

    if (this.chroma > 0.05 && showWorld) {
      this.drawChromaticPass(primary, fg, showWorld);
    } else {
      this.drawShip(primary, fg, showWorld);
    }

    if (this.deathFlash > 0) {
      ctx.fillStyle = `rgba(255, 80, 120, ${this.deathFlash * 0.12})`;
      ctx.fillRect(0, 0, this.w, this.h);
    }

    if (showWorld && this.powers.shield > 0) {
      ctx.strokeStyle = `rgba(94, 234, 212, ${0.35 + Math.sin(performance.now() * 0.01) * 0.2})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(this.player.x, this.player.y, 28, 0, Math.PI * 2);
      ctx.stroke();
    }

    if (showWorld && this.powers.aura > 0) {
      ctx.strokeStyle = `rgba(244, 114, 182, ${0.25 + Math.sin(performance.now() * 0.008) * 0.12})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(this.player.x, this.player.y, 70, 0, Math.PI * 2);
      ctx.stroke();
    }

    if (showWorld && this.powers.overclock > 0) {
      ctx.fillStyle = "rgba(59, 130, 246, 0.08)";
      ctx.fillRect(0, 0, this.w, this.h);
    }

    if (showWorld) {
      for (const d of this.powers.droneList) {
        const dx = this.player.x + Math.cos(d.angle) * 42;
        const dy = this.player.y + Math.sin(d.angle) * 42;
        ctx.fillStyle = "#a5b4fc";
        ctx.beginPath();
        ctx.arc(dx, dy, 5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    if (this.overloadFlash > 0 && playing) {
      const a = clamp(this.overloadFlash / 2.4, 0, 1);
      ctx.save();
      ctx.globalAlpha = a * 0.5;
      ctx.font = "700 26px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillStyle = "#f0abfc";
      ctx.fillText("DRIFT OVERLOAD", this.w / 2, this.h * 0.2);
      ctx.restore();
    }

    ctx.restore();
  }

  private drawChromaticPass(primary: string, fg: string, visible: boolean) {
    const ctx = this.ctx;
    const off = this.chroma * 7;
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.globalAlpha = 0.4 * this.chroma;
    ctx.translate(-off, 0);
    this.drawShip("#ff6b9d", fg, visible);
    ctx.translate(off * 2, 0);
    this.drawShip("#5eead4", fg, visible);
    ctx.restore();
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
    this.drawShip(primary, fg, visible);
  }

  private drawShip(primary: string, fg: string, visible: boolean) {
    if (!visible && this.phase === "ready") {
      const ctx = this.ctx;
      ctx.save();
      ctx.translate(this.player.x, this.player.y);
      ctx.globalAlpha = 0.35;
      ctx.fillStyle = primary;
      ctx.beginPath();
      ctx.arc(0, 0, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      return;
    }
    if (!visible) return;

    const ctx = this.ctx;
    const { x, y } = this.player;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(this.playerAngle + Math.PI / 2);

    ctx.fillStyle = primary;
    ctx.beginPath();
    ctx.moveTo(0, -22);
    ctx.lineTo(18, 16);
    ctx.lineTo(0, 10);
    ctx.lineTo(-18, 16);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = fg;
    ctx.globalAlpha = 0.85;
    ctx.beginPath();
    ctx.arc(0, 2, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  private parseColor(css: string, fallback: string) {
    if (!css || css.startsWith("var(")) return fallback;
    return css;
  }

  /** Updates aim direction only — does not move the player. */
  pointerAim(clientX: number, clientY: number, canvasRect: DOMRect) {
    this.input.pointerX = clientX - canvasRect.left;
    this.input.pointerY = clientY - canvasRect.top;
  }

  clearPointerAim() {
    this.input.pointerX = null;
    this.input.pointerY = null;
  }
}
