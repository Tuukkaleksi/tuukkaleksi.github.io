import { MAX_PARTICLES } from "@/lib/arcade/config/balance";
import type { GameWorld } from "@/lib/arcade/game/world";
import type { ParticleKind } from "@/lib/arcade/types";

export function spawnParticle(
  world: GameWorld,
  x: number,
  y: number,
  kind: ParticleKind,
  intensity: number,
) {
  const bass = world.audio.getBassEnergy();
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
  if (world.particles.length >= MAX_PARTICLES) return;
  count = Math.min(count, MAX_PARTICLES - world.particles.length);
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2;
    const sp = (kind === "shatter" ? 120 : 80 + Math.random() * 160) * intensity;
    world.particles.push({
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

export function tickParticles(world: GameWorld, dt: number) {
  for (let i = world.particles.length - 1; i >= 0; i--) {
    const p = world.particles[i]!;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.life -= dt;
    p.vx *= 0.96;
    p.vy *= 0.96;
    if (p.life <= 0) world.particles.splice(i, 1);
  }
  for (let i = world.trails.length - 1; i >= 0; i--) {
    const tr = world.trails[i]!;
    tr.life -= dt;
    if (tr.life <= 0) world.trails.splice(i, 1);
  }
  if (world.chroma > 0) world.chroma = Math.max(0, world.chroma - dt * 1.2);
  if (world.deathFlash > 0) world.deathFlash = Math.max(0, world.deathFlash - dt * 2.5);
}
