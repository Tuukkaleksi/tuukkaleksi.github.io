import type { Enemy } from "@/lib/arcade/entities/entity-types";
import type { PowerUpId } from "@/lib/arcade/power-ups";
import type { GameWorld } from "@/lib/arcade/game/world";
import { rollPickupKind } from "@/lib/arcade/power-ups";
import { getEnemyScore, onEnemyKilledSplit, spawnEnemyAt } from "@/lib/arcade/systems/enemies";
import { spawnParticle } from "@/lib/arcade/systems/particles";
import { clamp, dist } from "@/lib/arcade/utils/math";

export type CombatHooks = {
  addScore: (n: number) => void;
  onKill: () => void;
  onBossDefeated: () => void;
  onPlayerHit: () => void;
  onNearMiss: (streak: number) => void;
  onPickup: (id: PowerUpId) => void;
};

export function damageEnemy(
  world: GameWorld,
  e: Enemy,
  index: number,
  dmg: number,
  hooks: CombatHooks,
) {
  e.hp -= dmg;
  spawnParticle(world, e.x, e.y, "spark", 0.55);
  if (e.hp > 0) return;
  world.enemies.splice(index, 1);
  spawnParticle(world, e.x, e.y, "shatter", 1.1);
  const mult = (1 + world.combo * 0.15) * world.powers.scoreMult();
  const pts = Math.floor(getEnemyScore(e) * mult);
  hooks.addScore(pts);
  world.combo += 1;
  world.comboTimer = 2.4;
  world.runStats.kills += 1;
  world.runStats.bestCombo = Math.max(world.runStats.bestCombo, world.combo);
  world.audio.enemyDeath();
  if (e.isBoss) {
    world.bossActive = false;
    world.runStats.bossesDefeated += 1;
    world.audio.bossDefeated();
    hooks.onBossDefeated();
  }
  world.shake = 0.08 + world.audio.getBassEnergy() * 0.08;
  hooks.onKill();
  if (Math.random() < 0.55) {
    world.gems.push({ x: e.x, y: e.y, vx: 0, vy: 0, magnet: false });
  }
  if (Math.random() < 0.04 + world.wave * 0.003) {
    world.gems.push({ x: e.x, y: e.y, vx: 0, vy: 0, magnet: false, risk: true });
  }
  onEnemyKilledSplit(world, e);
  if (Math.random() < 0.07 + world.wave * 0.004) {
    world.powerUps.push({
      x: e.x,
      y: e.y,
      vx: 0,
      vy: 0,
      kind: rollPickupKind(),
      spin: Math.random() * Math.PI * 2,
    });
  }
}

export function updateCombat(world: GameWorld, dt: number, hooks: CombatHooks) {
  for (let i = world.bullets.length - 1; i >= 0; i--) {
    const b = world.bullets[i]!;
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    b.life -= dt;
    if (b.life <= 0 || b.x < -30 || b.x > world.w + 30 || b.y < -30 || b.y > world.h + 30) {
      world.bullets.splice(i, 1);
      continue;
    }
    if (b.player) {
      let hit = false;
      for (let j = world.enemies.length - 1; j >= 0; j--) {
        const e = world.enemies[j]!;
        if (dist(b.x, b.y, e.x, e.y) < e.r + 6) {
          damageEnemy(world, e, j, 1, hooks);
          hit = true;
          b.pierceLeft -= 1;
          if (b.pierceLeft <= 0) break;
        }
      }
      if (hit && b.pierceLeft <= 0) world.bullets.splice(i, 1);
    } else if (world.powers.dashInvuln <= 0) {
      if (dist(b.x, b.y, world.player.x, world.player.y) < 18) {
        world.bullets.splice(i, 1);
        hooks.onPlayerHit();
      }
    }
  }
}

export function updateEntities(world: GameWorld, dt: number, hooks: CombatHooks) {
  if (world.powers.aura > 0) {
    for (let i = world.enemies.length - 1; i >= 0; i--) {
      const e = world.enemies[i]!;
      const d = dist(e.x, e.y, world.player.x, world.player.y);
      if (d < 72 && d > e.r + 8) {
        e.hp -= dt * 1.8;
        if (e.hp <= 0) damageEnemy(world, e, i, 0, hooks);
        if (Math.random() < 0.15) spawnParticle(world, e.x, e.y, "spark", 0.35);
      }
    }
  }

  for (let i = world.enemies.length - 1; i >= 0; i--) {
    const e = world.enemies[i]!;
    const d = dist(e.x, e.y, world.player.x, world.player.y);
    if (d > Math.max(world.w, world.h) * 1.4) {
      world.enemies.splice(i, 1);
      continue;
    }
    const nearBand = e.r + 38;
    if (!e.nearMissed && d < nearBand && d > e.r + 15) {
      e.nearMissed = true;
      world.nearMissStreak += 1;
      world.runStats.nearMissStreak = world.nearMissStreak;
      world.runStats.bestNearMissStreak = Math.max(
        world.runStats.bestNearMissStreak,
        world.nearMissStreak,
      );
      const bonus = Math.min(world.nearMissStreak, 12);
      hooks.addScore(2 + bonus);
      world.audio.nearMiss();
      hooks.onNearMiss(world.nearMissStreak);
    }
    if (d < e.r + 14 && world.powers.dashInvuln <= 0) {
      world.nearMissStreak = 0;
      hooks.onPlayerHit();
      if (!e.isBoss) world.enemies.splice(i, 1);
    }
  }

  const magnetR = world.powers.hasMagnet() ? 200 : 100;
  for (let i = world.gems.length - 1; i >= 0; i--) {
    const g = world.gems[i]!;
    const d = dist(g.x, g.y, world.player.x, world.player.y);
    if (d < magnetR) g.magnet = true;
    if (g.magnet) {
      const pull = clamp(320 / Math.max(d, 20), 0.6, 10);
      g.x += ((world.player.x - g.x) / d) * pull * 70 * dt;
      g.y += ((world.player.y - g.y) / d) * pull * 70 * dt;
    }
    if (d < 22) {
      world.gems.splice(i, 1);
      let pts = 8 + world.combo * 2;
      if (g.risk) {
        pts *= 2;
        const elite = spawnEnemyAt(world, world.player.x, world.player.y - 120, "stalker", world.wave);
        if (elite) elite.speed *= 1.2;
      }
      hooks.addScore(Math.floor(pts * world.powers.scoreMult()));
      world.comboTimer = Math.max(world.comboTimer, 1.5);
      world.audio.gem();
      spawnParticle(world, g.x, g.y, "gem", 0.4);
    }
  }

  for (let i = world.powerUps.length - 1; i >= 0; i--) {
    const pu = world.powerUps[i]!;
    const d = dist(pu.x, pu.y, world.player.x, world.player.y);
    if (d < magnetR) {
      const pull = clamp(280 / Math.max(d, 16), 0.5, 9);
      pu.x += ((world.player.x - pu.x) / d) * pull * 55 * dt;
      pu.y += ((world.player.y - pu.y) / d) * pull * 55 * dt;
    }
    if (d < 28) {
      world.powerUps.splice(i, 1);
      hooks.onPickup(pu.kind);
    }
  }
}
