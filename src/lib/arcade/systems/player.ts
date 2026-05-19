import type { Enemy } from "@/lib/arcade/entities/entity-types";
import type { GameWorld } from "@/lib/arcade/game/world";
import { spawnParticle } from "@/lib/arcade/systems/particles";
import { tryDash } from "@/lib/arcade/systems/powers";
import { clamp, dist, norm } from "@/lib/arcade/utils/math";

export function aimAngle(world: GameWorld): number {
  if (world.input.pointerX != null && world.input.pointerY != null) {
    return Math.atan2(
      world.input.pointerY - world.player.y,
      world.input.pointerX - world.player.x,
    );
  }
  if (Math.hypot(world.moveVx, world.moveVy) > 8) {
    return Math.atan2(world.moveVy, world.moveVx);
  }
  return world.playerAngle;
}

function pushTrail(world: GameWorld) {
  world.trails.push({
    x: world.player.x - Math.cos(world.playerAngle) * 16,
    y: world.player.y - Math.sin(world.playerAngle) * 16,
    life: 0.55,
  });
  if (world.trails.length > 16) world.trails.shift();
}

function fireBullet(world: GameWorld) {
  const angle = world.playerAngle;
  const spread = world.powers.triple || world.powers.isBerserk() ? 0.14 : 0;
  const angles =
    world.powers.triple || world.powers.isBerserk() ? [-spread, 0, spread] : [0];
  const speed = world.powers.isBerserk() ? 760 : 680;
  const pierceLeft = world.powers.pierce ? 5 : 1;
  for (const a of angles) {
    const dir = angle + a;
    world.bullets.push({
      x: world.player.x + Math.cos(dir) * 20,
      y: world.player.y + Math.sin(dir) * 20,
      vx: Math.cos(dir) * speed,
      vy: Math.sin(dir) * speed,
      life: 1.1,
      player: true,
      pierceLeft,
    });
  }
  world.audio.shoot();
}

export function updatePlayer(world: GameWorld, dt: number) {
  if (world.dashQueued) {
    world.dashQueued = false;
    tryDash(world);
  }

  const margin = 32;
  let moveSpeed = 340;
  if (world.powers.isBerserk()) moveSpeed *= 1.28;
  let ax = 0;
  let ay = 0;
  if (world.input.left) ax -= 1;
  if (world.input.right) ax += 1;
  if (world.input.up) ay -= 1;
  if (world.input.down) ay += 1;

  if (ax !== 0 || ay !== 0) {
    const n = norm(ax, ay);
    world.player.x += n.x * moveSpeed * dt;
    world.player.y += n.y * moveSpeed * dt;
    world.moveVx = n.x * moveSpeed;
    world.moveVy = n.y * moveSpeed;
  } else {
    world.moveVx *= 0.88;
    world.moveVy *= 0.88;
  }

  world.player.x = clamp(world.player.x, margin, world.w - margin);
  world.player.y = clamp(world.player.y, margin, world.h - margin);
  world.playerAngle = aimAngle(world);

  if (world.powers.dashInvuln > 0) world.powers.dashInvuln -= dt;

  let rate = 0.11;
  if (world.powers.isBerserk()) rate = 0.055;
  else if (world.powers.triple) rate = 0.09;
  world.fireCd -= dt;
  if (world.fireCd <= 0) {
    world.fireCd = rate;
    fireBullet(world);
  }

  if (world.phase === "playing" || world.phase === "bossFight") {
    pushTrail(world);
    const bass = world.audio.getBassEnergy();
    if (Math.hypot(world.moveVx, world.moveVy) > 40 && Math.random() < 0.25 + bass * 0.35) {
      spawnParticle(
        world,
        world.player.x - Math.cos(world.playerAngle) * 14,
        world.player.y - Math.sin(world.playerAngle) * 14,
        "glow",
        0.4,
      );
    }
  }
}

export function updateDrones(world: GameWorld, dt: number) {
  for (const d of world.powers.droneList) {
    d.angle += dt * 2.2;
    d.fireCd -= dt;
    if (d.fireCd > 0) continue;
    d.fireCd = 0.35;
    const x = world.player.x + Math.cos(d.angle) * 42;
    const y = world.player.y + Math.sin(d.angle) * 42;
    let nearest: Enemy | null = null;
    let best = Infinity;
    for (const e of world.enemies) {
      const dd = dist(x, y, e.x, e.y);
      if (dd < best) {
        best = dd;
        nearest = e;
      }
    }
    if (!nearest) continue;
    const a = Math.atan2(nearest.y - y, nearest.x - x);
    world.bullets.push({
      x,
      y,
      vx: Math.cos(a) * 520,
      vy: Math.sin(a) * 520,
      life: 0.9,
      player: true,
      pierceLeft: 1,
    });
  }
}
