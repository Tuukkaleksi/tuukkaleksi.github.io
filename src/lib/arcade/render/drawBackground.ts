import type { BgGradientCache } from "@/lib/arcade/render/bg-cache";
import type { GameWorld } from "@/lib/arcade/game/world";

export function drawBackground(
  ctx: CanvasRenderingContext2D,
  world: GameWorld,
  pulse: number,
  playing: boolean,
  bgCache: BgGradientCache | null,
) {
  if (playing) {
    const bass = world.audio.getBassEnergy();
    const pump = 1 + pulse * 0.014 + bass * 0.006;
    const cx = world.w / 2;
    const cy = world.h / 2;
    ctx.translate(cx, cy);
    ctx.scale(pump, pump);
    ctx.translate(-cx, -cy);
  }

  const bgTint = `hsl(${world.bgHue}, 22%, ${7 + world.overloadTier * 1.2}%)`;
  ctx.fillStyle = bgTint;
  ctx.fillRect(0, 0, world.w, world.h);

  const parallaxX = playing ? world.moveVx * 0.00005 : 0;
  const parallaxY = playing ? world.moveVy * 0.00005 : 0;

  for (const s of world.stars) {
    const layerSpeed = (0.004 + s.layer * 0.006) * s.z;
    s.y += layerSpeed * (playing ? 1.4 : 0.25);
    if (s.y > 1) s.y = 0;
    const alpha = (0.025 + s.z * 0.05) * (0.6 + s.layer * 0.12);
    ctx.fillStyle = `hsla(${s.hue}, 40%, 75%, ${alpha})`;
    const px = s.x * world.w + parallaxX * world.w * (s.layer + 1) * 5;
    const py = s.y * world.h + parallaxY * world.h * (s.layer + 1) * 5;
    ctx.fillRect(px, py, s.s, s.s);
  }

  const flicker = 0.028 + pulse * 0.062;
  if (bgCache) {
    ctx.save();
    ctx.globalAlpha = flicker / 0.05;
    ctx.fillStyle = bgCache.vignette;
    ctx.fillRect(0, 0, world.w, world.h);
    ctx.restore();
  }

  if (pulse > 0.88 && playing && bgCache) {
    const streak = (pulse - 0.88) / 0.12;
    ctx.save();
    ctx.globalAlpha = streak;
    ctx.fillStyle = bgCache.streak;
    ctx.fillRect(0, 0, world.w, world.h);
    ctx.restore();
  }

  const gridAlpha = 0.026 + pulse * 0.034;
  ctx.strokeStyle = `rgba(90, 140, 200, ${gridAlpha})`;
  ctx.lineWidth = 1;
  const grid = 48;
  const off = (performance.now() * 0.02) % grid;
  ctx.beginPath();
  for (let x = -off; x < world.w; x += grid) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, world.h);
  }
  for (let y = off; y < world.h; y += grid) {
    ctx.moveTo(0, y);
    ctx.lineTo(world.w, y);
  }
  ctx.stroke();
}

export function decayShake(world: GameWorld, dt: number) {
  if (world.shake > 0) world.shake = Math.max(0, world.shake - dt * 1.8);
}

export function getShakeOffset(world: GameWorld) {
  if (world.shake <= 0) return { x: 0, y: 0 };
  return {
    x: (Math.random() - 0.5) * world.shake * 18,
    y: (Math.random() - 0.5) * world.shake * 18,
  };
}
