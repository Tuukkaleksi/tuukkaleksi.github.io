import type { GameWorld } from "@/lib/arcade/game/world";
import type { PowerUpId } from "@/lib/arcade/power-ups";
import { rollDraftChoices } from "@/lib/arcade/power-ups";
import { DRAFT_INTERVAL_SEC } from "@/lib/arcade/config/waves";
import { spawnParticle } from "@/lib/arcade/systems/particles";
import { clamp, dist } from "@/lib/arcade/utils/math";

export function checkDraft(world: GameWorld, onDraft: (c: PowerUpId[]) => void) {
  const tier = Math.floor(world.playTime / DRAFT_INTERVAL_SEC);
  if (tier <= world.overloadTier) return;
  if (world.phase === "bossIntro" || world.phase === "bossFight") return;
  world.overloadTier = tier;
  world.bgHue = 220 + tier * 14;
  world.audio.setMusicIntensity(tier);
  world.draftChoices = rollDraftChoices(tier);
  world.phase = "draft";
  onDraft(world.draftChoices);
}

export function applyPower(world: GameWorld, id: PowerUpId, addScore: (n: number) => void) {
  const p = world.powers;
  p.showHud(id, 5);
  world.runStats.picks.push(id);
  switch (id) {
    case "overclock":
      p.overclock = 8;
      world.audio.setOverclock(true);
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
      triggerPulse(world);
      break;
    case "drone":
      p.drones = Math.min(2, p.drones + 1);
      p.droneList.push({ angle: p.drones * Math.PI, fireCd: 0 });
      break;
    case "berserk":
      p.berserk = 7;
      world.runStats.berserkActivations += 1;
      world.berserkFlash = 1.4;
      world.shake = Math.max(world.shake, 0.28);
      world.chroma = Math.max(world.chroma, 0.75);
      world.audio.berserkStart();
      break;
    case "shield":
      p.shield = 10;
      break;
    case "triple":
      p.triple = true;
      break;
    case "timeBomb":
      triggerTimeBomb(world, addScore);
      break;
  }
  world.audio.powerUp();
  spawnParticle(world, world.player.x, world.player.y, "gem", 0.8);
}

export function triggerPulse(world: GameWorld) {
  world.powers.pulseWave = 0.55;
  for (const e of world.enemies) {
    const dx = e.x - world.player.x;
    const dy = e.y - world.player.y;
    const d = Math.hypot(dx, dy) || 1;
    if (d < 220) {
      e.x += (dx / d) * 90;
      e.y += (dy / d) * 90;
    }
  }
  world.shake = 0.15;
}

export function triggerTimeBomb(world: GameWorld, addScore: (n: number) => void) {
  const r = 200;
  for (let i = world.enemies.length - 1; i >= 0; i--) {
    const e = world.enemies[i]!;
    if (dist(e.x, e.y, world.player.x, world.player.y) < r) {
      spawnParticle(world, e.x, e.y, "shatter", 0.9);
      world.enemies.splice(i, 1);
      addScore(Math.floor(15 * world.powers.scoreMult()));
    }
  }
  world.shake = 0.25;
  world.deathFlash = 0.15;
}

export function tickPowerTimers(world: GameWorld, dt: number) {
  world.powers.tickHud(dt);
  if (world.powers.dashCd > 0) world.powers.dashCd -= dt;
  if (world.powers.overclock > 0) world.powers.overclock -= dt;
  else world.audio.setOverclock(false);
  if (world.powers.magnet > 0) world.powers.magnet -= dt;
  if (world.powers.aura > 0) world.powers.aura -= dt;
  if (world.powers.multiplier > 0) world.powers.multiplier -= dt;
  if (world.powers.berserk > 0) world.powers.berserk -= dt;
  if (world.powers.shield > 0) world.powers.shield -= dt;
  if (world.powers.pulseWave > 0) world.powers.pulseWave -= dt;
  if (world.powers.pulseUnlocked) {
    world.powers.pulseCd -= dt;
    if (world.powers.pulseCd <= 0) {
      world.powers.pulseCd = 2.6;
      triggerPulse(world);
    }
  }
}

export function tryDash(world: GameWorld) {
  const p = world.powers;
  if (!p.dashUnlocked || p.dashCd > 0 || p.dashInvuln > 0) return;
  let dx = world.moveVx;
  let dy = world.moveVy;
  if (Math.hypot(dx, dy) < 8) {
    dx = Math.cos(world.playerAngle);
    dy = Math.sin(world.playerAngle);
  }
  const len = Math.hypot(dx, dy) || 1;
  const distDash = 110;
  world.player.x = clamp(world.player.x + (dx / len) * distDash, 32, world.w - 32);
  world.player.y = clamp(world.player.y + (dy / len) * distDash, 32, world.h - 32);
  p.dashInvuln = 0.22;
  p.dashCd = 2.2;
  p.showHud("dash", 1.2);
  spawnParticle(world, world.player.x, world.player.y, "glow", 0.7);
}
