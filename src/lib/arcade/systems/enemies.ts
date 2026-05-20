import { BOSS_DEFS, ENEMY_DEFS, pickEnemyKind } from "@/lib/arcade/config/enemies";
import { MAX_ENEMIES, MAX_ENEMY_BULLETS } from "@/lib/arcade/config/balance";
import type { Enemy } from "@/lib/arcade/entities/entity-types";
import type { GameWorld } from "@/lib/arcade/game/world";
import type { BossId, EnemyKind } from "@/lib/arcade/types";
import { clamp, dist } from "@/lib/arcade/utils/math";

export function spawnEnemyAt(
  world: GameWorld,
  x: number,
  y: number,
  kind: EnemyKind,
  wave: number,
): Enemy | null {
  if (world.enemies.length >= MAX_ENEMIES) return null;
  const def = ENEMY_DEFS[kind];
  const speed = (75 + wave * 12 + world.overloadTier * 8 + world.roll() * 25) * def.speedMul;
  const e: Enemy = {
    x,
    y,
    vx: 0,
    vy: 0,
    hp: def.hp,
    maxHp: def.hp,
    kind,
    r: def.radius,
    wobble: world.roll() * Math.PI * 2,
    speed,
    nearMissed: false,
    isBoss: false,
    aimCd: 0.5 + world.roll(),
    orbitAngle: world.roll() * Math.PI * 2,
    patternCd: 0,
    phase: 0,
  };
  world.enemies.push(e);
  return e;
}

export function spawnBoss(world: GameWorld, bossId: BossId) {
  if (world.enemies.some((e) => e.isBoss)) return;
  const def = BOSS_DEFS[bossId];
  const e: Enemy = {
    x: world.w / 2,
    y: -def.radius - 20,
    vx: 0,
    vy: def.speed,
    hp: def.hp + world.round * 25,
    maxHp: def.hp + world.round * 25,
    kind: "tank",
    r: def.radius,
    wobble: 0,
    speed: def.speed,
    nearMissed: false,
    isBoss: true,
    bossId,
    aimCd: 0,
    orbitAngle: 0,
    patternCd: 1.2,
    phase: 0,
  };
  world.enemies.push(e);
  world.bossActive = true;
}

function fireEnemyBullet(world: GameWorld, x: number, y: number, angle: number, speed: number) {
  const enemyBullets = world.bullets.filter((b) => !b.player).length;
  if (enemyBullets >= MAX_ENEMY_BULLETS) return;
  world.bullets.push({
    x,
    y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    life: 2.5,
    player: false,
    pierceLeft: 1,
  });
}

function updateEnemyBehavior(world: GameWorld, e: Enemy, dt: number) {
  const escale = world.powers.enemyTimeScale();
  const dx = world.player.x - e.x;
  const dy = world.player.y - e.y;
  const d = Math.hypot(dx, dy) || 1;
  const n = { x: dx / d, y: dy / d };

  if (e.isBoss && e.bossId === "driftColossus") {
    e.patternCd -= dt;
    if (e.y < world.h * 0.22) {
      e.y += e.speed * dt;
    } else {
      e.x += Math.sin(world.playTime * 0.8) * 60 * dt;
      e.x = clamp(e.x, e.r + 20, world.w - e.r - 20);
    }
    const hpRatio = e.hp / e.maxHp;
    if (hpRatio < 0.66 && e.phase < 1) {
      e.phase = 1;
      world.shake = 0.2;
    }
    if (hpRatio < 0.33 && e.phase < 2) {
      e.phase = 2;
      world.shake = 0.28;
    }
    if (e.patternCd <= 0) {
      const bursts = e.phase >= 2 ? 12 : e.phase >= 1 ? 8 : 6;
      const spd = e.phase >= 2 ? 280 : 220;
      for (let i = 0; i < bursts; i++) {
        const a = (i / bursts) * Math.PI * 2 + world.playTime;
        fireEnemyBullet(world, e.x, e.y, a, spd);
      }
      e.patternCd = e.phase >= 2 ? 1.4 : e.phase >= 1 ? 1.8 : 2.2;
    }
    return;
  }

  switch (e.kind) {
    case "orbiter": {
      e.orbitAngle += dt * 1.8;
      const orbitR = 90 + e.r;
      const tx = world.player.x + Math.cos(e.orbitAngle) * orbitR;
      const ty = world.player.y + Math.sin(e.orbitAngle) * orbitR;
      const tdx = tx - e.x;
      const tdy = ty - e.y;
      const td = Math.hypot(tdx, tdy) || 1;
      e.x += (tdx / td) * e.speed * dt * escale;
      e.y += (tdy / td) * e.speed * dt * escale;
      break;
    }
    case "sniper": {
      if (d > 180) {
        e.x += n.x * e.speed * dt * escale;
        e.y += n.y * e.speed * dt * escale;
      }
      e.aimCd -= dt;
      if (e.aimCd <= 0 && d < 420) {
        e.aimCd = 1.4;
        fireEnemyBullet(world, e.x, e.y, Math.atan2(dy, dx), 340);
      }
      break;
    }
    case "swarmer": {
      const wobble = Math.sin(e.wobble) * 0.35;
      e.x += (n.x + -n.y * wobble) * e.speed * dt * escale;
      e.y += (n.y + n.x * wobble) * e.speed * dt * escale;
      e.wobble += dt * 8;
      break;
    }
    case "tank": {
      e.x += n.x * e.speed * dt * escale * 0.9;
      e.y += n.y * e.speed * dt * escale * 0.9;
      break;
    }
    default: {
      const wobble = Math.sin(e.wobble) * 0.22;
      const perpX = -n.y * wobble;
      const perpY = n.x * wobble;
      let speed = e.speed;
      if (e.kind === "stalker") speed *= 1.35;
      if (e.kind === "splitter") speed *= 0.92;
      e.vx = (n.x + perpX) * speed;
      e.vy = (n.y + perpY) * speed;
      e.x += e.vx * dt * escale;
      e.y += e.vy * dt * escale;
      e.wobble += dt * (e.kind === "stalker" ? 6 : 4);
    }
  }
}

export function updateEnemies(world: GameWorld, dt: number) {
  for (const e of world.enemies) {
    updateEnemyBehavior(world, e, dt);
  }
}

export function spawnFromEdge(world: GameWorld) {
  const pad = 36;
  const side = Math.floor(world.roll() * 4);
  let x = 0;
  let y = 0;
  if (side === 0) {
    x = pad + world.roll() * (world.w - pad * 2);
    y = -pad;
  } else if (side === 1) {
    x = world.w + pad;
    y = pad + world.roll() * (world.h - pad * 2);
  } else if (side === 2) {
    x = pad + world.roll() * (world.w - pad * 2);
    y = world.h + pad;
  } else {
    x = -pad;
    y = pad + world.roll() * (world.h - pad * 2);
  }
  const kind = pickEnemyKind(world.wave, world.round, () => world.roll());
  spawnEnemyAt(world, x, y, kind, world.wave);
}

export function onEnemyKilledSplit(world: GameWorld, e: Enemy) {
  if (e.kind === "splitter") {
    for (let k = 0; k < 2; k++) {
      const off = k ? 18 : -18;
      const child = spawnEnemyAt(world, e.x + off, e.y, "drifter", world.wave);
      if (child) {
        child.hp = 1;
        child.maxHp = 1;
        child.r = 14;
      }
    }
  }
}

export function getEnemyScore(e: Enemy): number {
  if (e.isBoss && e.bossId) return BOSS_DEFS[e.bossId].score;
  return ENEMY_DEFS[e.kind].score;
}
