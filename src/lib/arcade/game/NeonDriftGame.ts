import { ArcadeAudio } from "@/lib/arcade/audio";
import { BeatClock } from "@/lib/arcade/beat";
import { HIGH_SCORE_KEY, SIM_STEP } from "@/lib/arcade/config/balance";
import type { GameStats, NeonDriftCallbacks } from "@/lib/arcade/game/types";
import { emptyRunStats, GameWorld } from "@/lib/arcade/game/world";
import { checkAchievements } from "@/lib/arcade/meta/achievements";
import { activeSynergies } from "@/lib/arcade/meta/synergies";
import { rollDraftChoices, type PowerUpId } from "@/lib/arcade/power-ups";
import {
  resolveVisualQuality,
  saveVisualQuality,
  type VisualQuality,
} from "@/lib/arcade/config/visual";
import { Renderer } from "@/lib/arcade/render/Renderer";
import { advanceWave, tickBossFlow } from "@/lib/arcade/systems/boss";
import type { CombatHooks } from "@/lib/arcade/systems/combat";
import { updateCombat, updateEntities } from "@/lib/arcade/systems/combat";
import { updateEnemies } from "@/lib/arcade/systems/enemies";
import { tickParticles, spawnParticle } from "@/lib/arcade/systems/particles";
import {
  applyPower,
  checkDraft,
  tickPowerTimers,
} from "@/lib/arcade/systems/powers";
import { updateDrones, updatePlayer } from "@/lib/arcade/systems/player";
import { updateSpawner } from "@/lib/arcade/systems/spawner";
import type { GamePhase, InputState, StarLayer, ThemeColors } from "@/lib/arcade/types";

export type { GameStats, NeonDriftCallbacks } from "@/lib/arcade/game/types";

function dailySeedFromDate() {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

export class NeonDriftGame {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private world: GameWorld;
  private renderer: Renderer;
  private cb: NeonDriftCallbacks;
  private highScore = 0;
  private raf = 0;
  private idleTimer = 0;
  private last = 0;
  private acc = 0;
  /** Skip redraw while draft/pause overlay is up (canvas frozen). */
  private overlayFrozen = false;
  private renderDirty = true;
  private alive = false;

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
    this.cb = callbacks;
    const beat = new BeatClock(128, () => audio.getMusicTime());
    this.world = new GameWorld(colors, audio, beat);
    this.renderer = new Renderer();
    this.highScore = Number(localStorage.getItem(HIGH_SCORE_KEY) ?? 0) || 0;
    this.initStars();
    this.resize();
    this.resetWorld();
  }

  private initStars() {
    this.world.stars = Array.from({ length: 52 }, () => ({
      x: Math.random(),
      y: Math.random(),
      z: 0.2 + Math.random() * 0.8,
      s: 0.4 + Math.random() * 2.2,
      layer: Math.floor(Math.random() * 3),
      hue: Math.random() < 0.35 ? 200 + Math.random() * 60 : 280 + Math.random() * 40,
    })) as StarLayer[];
  }

  private combatHooks(): CombatHooks {
    return {
      addScore: (n) => this.addScore(n),
      onKill: () => this.checkAchievementsNow(),
      onBossDefeated: () => {
        this.world.bossTelegraph = null;
        this.checkAchievementsNow();
      },
      onPlayerHit: () => this.playerHit(),
      onNearMiss: () => this.checkAchievementsNow(),
      onPickup: (id) => this.applyPower(id),
    };
  }

  getStats(): GameStats {
    return {
      score: this.world.score,
      combo: this.world.combo,
      wave: this.world.wave,
      round: this.world.round,
      lives: this.world.lives,
      highScore: this.highScore,
      phase: this.world.phase,
      overloadTier: this.world.overloadTier,
      bossTelegraph: this.world.bossTelegraph,
      runStats: { ...this.world.runStats },
      nearMissStreak: this.world.nearMissStreak,
      activeSynergies: activeSynergies(this.world.powers),
    };
  }

  getOverloadFlash() {
    return this.world.overloadFlash;
  }

  getHudPowerId(): PowerUpId | null {
    return this.world.powers.getHudDisplayId();
  }

  getDraftChoices(): PowerUpId[] {
    return this.world.draftChoices;
  }

  pickDraft(index: number) {
    if (this.world.phase !== "draft" || index < 0 || index >= this.world.draftChoices.length)
      return;
    this.applyPower(this.world.draftChoices[index]!);
    this.world.draftChoices = [];
    this.world.overloadFlash = 1.8;
    this.world.phase = "playing";
    this.last = performance.now();
    this.cb.onOverload?.();
    this.emit();
  }

  queueDash() {
    this.world.dashQueued = true;
  }

  setInput(partial: Partial<InputState>) {
    Object.assign(this.world.input, partial);
  }

  setColors(colors: ThemeColors) {
    this.world.colors = colors;
  }

  setVisualQuality(quality: VisualQuality) {
    saveVisualQuality(quality);
    this.renderer.setQuality(quality);
    this.resize();
  }

  getVisualQuality() {
    return this.renderer.getQuality();
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    this.world.w = Math.max(320, rect.width);
    this.world.h = Math.max(480, rect.height);
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resolved = resolveVisualQuality(
      this.renderer.getQuality(),
      this.world.w,
      this.world.h,
      dpr,
    );
    if (resolved === "low") dpr = Math.min(dpr, 1.25);
    else if (resolved === "medium") dpr = Math.min(dpr, 1.5);
    this.canvas.width = Math.floor(this.world.w * dpr);
    this.canvas.height = Math.floor(this.world.h * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.renderDirty = true;
    this.renderer.resize(this.world, dpr);
    if (this.world.phase === "ready") {
      this.world.player.x = this.world.w / 2;
      this.world.player.y = this.world.h / 2;
    }
  }

  resetWorld() {
    this.world.clearEntities();
    this.world.phase = "ready";
    this.world.score = 0;
    this.world.combo = 0;
    this.world.comboTimer = 0;
    this.world.wave = 1;
    this.world.round = 1;
    this.world.lives = 3;
    this.world.powers.reset();
    this.world.draftChoices = [];
    this.world.fireCd = 0;
    this.world.dashQueued = false;
    this.world.spawnCd = 0;
    this.world.waveTimer = 0;
    this.world.shake = 0;
    this.world.moveVx = 0;
    this.world.moveVy = 0;
    this.world.player.x = this.world.w / 2;
    this.world.player.y = this.world.h / 2;
    this.world.playerAngle = -Math.PI / 2;
    this.world.runStats = emptyRunStats();
    this.world.nearMissStreak = 0;
    this.acc = 0;
    this.emit();
  }

  start() {
    this.world.clearEntities();
    this.world.score = 0;
    this.world.combo = 0;
    this.world.wave = 1;
    this.world.round = 1;
    this.world.lives = 3;
    this.world.powers.reset();
    this.world.draftChoices = [];
    this.world.fireCd = 0;
    this.world.spawnCd = 0.5;
    this.world.waveTimer = 0;
    this.world.playTime = 0;
    this.world.overloadTier = 0;
    this.world.overloadFlash = 0;
    this.world.hitSlowTimer = 0;
    this.world.bgHue = 220;
    this.world.bossActive = false;
    this.world.bossTelegraph = null;
    this.world.bossWaveTriggered = 0;
    this.world.runStats = emptyRunStats();
    this.world.dailySeed = dailySeedFromDate();
    this.world.player.x = this.world.w / 2;
    this.world.player.y = this.world.h / 2;
    this.world.phase = "playing";
    this.world.audio.start();
    void this.world.audio.playMusic();
    this.emit();
  }

  pause() {
    if (this.world.phase === "playing" || this.world.phase === "bossFight") {
      this.world.phase = "paused";
      this.world.audio.pauseMusic();
      this.emit();
    }
  }

  resume() {
    if (this.world.phase === "paused") {
      this.world.phase = this.world.bossActive ? "bossFight" : "playing";
      this.last = performance.now();
      void this.world.audio.playMusic();
      this.emit();
    }
  }

  togglePause() {
    if (this.world.phase === "playing" || this.world.phase === "bossFight") this.pause();
    else if (this.world.phase === "paused") this.resume();
  }

  restart() {
    this.start();
  }

  private scheduleLoop() {
    if (!this.alive) return;
    const profile = this.renderer.getProfile(this.world.phase);
    const idle = (profile === "menu" || profile === "snapshot") && !this.renderDirty;
    if (idle) {
      this.idleTimer = window.setTimeout(() => this.loopFrame(performance.now()), 400);
    } else {
      this.raf = requestAnimationFrame(() => this.loopFrame(performance.now()));
    }
  }

  private loopFrame(now: number) {
    if (!this.alive) return;
    let dt = (now - this.last) / 1000;
    this.last = now;
    dt = Math.min(dt, 0.05);
    const simulating =
      this.world.phase === "playing" ||
      this.world.phase === "bossFight" ||
      this.world.phase === "bossIntro";
    if (simulating && this.world.phase !== "bossIntro") {
      const slow = this.world.hitSlowTimer > 0 ? 0.32 : 1;
      if (this.world.hitSlowTimer > 0)
        this.world.hitSlowTimer = Math.max(0, this.world.hitSlowTimer - dt);
      const simDt = dt * slow;
      this.world.audio.tick(simDt);
      this.acc += simDt;
      while (this.acc >= SIM_STEP) {
        this.simTick(SIM_STEP);
        this.acc -= SIM_STEP;
      }
    } else if (this.world.phase === "bossIntro") {
      this.world.audio.tick(dt);
      this.simTick(dt);
    }
    this.paintFrame(dt);
    this.scheduleLoop();
  }

  run() {
    this.alive = true;
    this.last = performance.now();
    this.scheduleLoop();
  }

  destroy() {
    this.alive = false;
    cancelAnimationFrame(this.raf);
    this.raf = 0;
    if (this.idleTimer) window.clearTimeout(this.idleTimer);
    this.idleTimer = 0;
    this.world.audio.pauseMusic();
    this.renderer.destroy();
  }

  pointerAim(clientX: number, clientY: number, canvasRect: DOMRect) {
    this.world.input.pointerX = clientX - canvasRect.left;
    this.world.input.pointerY = clientY - canvasRect.top;
  }

  clearPointerAim() {
    this.world.input.pointerX = null;
    this.world.input.pointerY = null;
  }

  private lastEmittedPhase: GamePhase | null = null;

  private emit() {
    const wasFrozen = this.overlayFrozen;
    const profile = this.renderer.getProfile(this.world.phase);
    this.overlayFrozen = profile === "snapshot";
    if (profile === "snapshot" && !wasFrozen) this.renderDirty = true;
    if (profile === "menu" || profile === "full") this.renderDirty = true;
    this.cb.onStats(this.getStats());
    if (this.world.phase !== this.lastEmittedPhase) {
      this.lastEmittedPhase = this.world.phase;
      this.cb.onPhase(this.world.phase);
    }
  }

  private paintFrame(dt: number) {
    const profile = this.renderer.getProfile(this.world.phase);

    if (profile === "snapshot") {
      if (this.renderDirty) {
        this.renderer.draw(this.world, dt, this.ctx, "full");
        this.renderDirty = false;
      }
      return;
    }

    this.overlayFrozen = false;

    if (profile === "menu") {
      if (this.renderDirty) {
        this.renderer.draw(this.world, dt, this.ctx, "menu");
        this.renderDirty = false;
      }
      return;
    }

    this.renderDirty = true;
    this.renderer.draw(this.world, dt, this.ctx, "full");
  }

  private addScore(n: number) {
    this.world.score += n;
    if (this.world.score > this.highScore) {
      this.highScore = this.world.score;
      localStorage.setItem(HIGH_SCORE_KEY, String(this.highScore));
    }
    this.cb.onStats(this.getStats());
    this.cb.onScorePop?.();
  }

  private checkAchievementsNow() {
    const ids = checkAchievements({
      score: this.world.score,
      combo: this.world.combo,
      nearMissStreak: this.world.nearMissStreak,
      timeSurvived: this.world.runStats.timeSurvived,
      bossesDefeated: this.world.runStats.bossesDefeated,
    });
    for (const id of ids) this.cb.onAchievement?.(id);
  }

  private applyPower(id: PowerUpId) {
    applyPower(this.world, id, (n) => this.addScore(n));
    this.checkAchievementsNow();
    this.emit();
  }

  private playerHit() {
    if (this.world.powers.dashInvuln > 0) return;
    if (this.world.powers.shield > 0) {
      this.world.powers.shield = 0;
      this.world.shake = 0.2;
      this.world.audio.hit();
      spawnParticle(this.world, this.world.player.x, this.world.player.y, "explosion", 0.7);
      return;
    }
    this.world.lives -= 1;
    this.world.combo = 0;
    this.world.comboTimer = 0;
    this.world.nearMissStreak = 0;
    this.world.hitSlowTimer = 0.22;
    this.world.shake = 0.35;
    this.world.chroma = Math.max(this.world.chroma, 0.55);
    this.world.audio.damage();
    spawnParticle(this.world, this.world.player.x, this.world.player.y, "explosion", 1);
    if (this.world.lives <= 0) {
      this.world.hitSlowTimer = 0.4;
      this.world.phase = "gameover";
      this.world.chroma = 1;
      this.world.deathFlash = 1;
      this.world.audio.gameOver();
      this.checkAchievementsNow();
      this.emit();
    }
  }

  private simTick(dt: number) {
    const w = this.world;
    w.playTime += dt;
    w.runStats.timeSurvived = w.playTime;
    if (w.overloadFlash > 0) w.overloadFlash = Math.max(0, w.overloadFlash - dt);

    if (w.phase === "bossIntro") {
      if (
        tickBossFlow(w, dt, (id) => {
          this.cb.onBossTelegraph?.(id);
          this.emit();
        })
      ) {
        this.emit();
      }
      tickParticles(w, dt);
      return;
    }

    if (w.phase === "playing" || w.phase === "bossFight") {
      checkDraft(w, (choices) => {
        this.cb.onDraft?.(choices);
        this.emit();
      });
      tickPowerTimers(w, dt);
      updatePlayer(w, dt);
      updateDrones(w, dt);
      updateEnemies(w, dt);
      const hooks = this.combatHooks();
      updateCombat(w, dt, hooks);
      updateEntities(w, dt, hooks);
      if (w.phase === "playing") updateSpawner(w, dt);
      tickParticles(w, dt);
      if (w.comboTimer > 0) {
        w.comboTimer -= dt;
        if (w.comboTimer <= 0) w.combo = 0;
      }
      advanceWave(w, dt);
      if (
        tickBossFlow(w, dt, (id) => {
          this.cb.onBossTelegraph?.(id);
          this.emit();
        })
      ) {
        this.emit();
      }
      if (w.phase === "bossFight" && !w.bossActive && w.enemies.every((e) => !e.isBoss)) {
        w.phase = "playing";
        w.bossTelegraph = null;
        this.emit();
      }
    }
  }
}
