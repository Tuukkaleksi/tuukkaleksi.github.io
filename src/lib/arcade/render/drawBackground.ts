import { gridPalette } from "@/lib/arcade/cosmetics";
import type { BgGradientCache } from "@/lib/arcade/render/bg-cache";
import type { GameWorld } from "@/lib/arcade/game/world";
import { glowAccentHue } from "@/lib/arcade/systems/ambience";

export function drawBackground(
  ctx: CanvasRenderingContext2D,
  world: GameWorld,
  pulse: number,
  playing: boolean,
  bgCache: BgGradientCache | null,
) {
  const bass = world.audio.getBassEnergy();
  const berserk = world.powers.isBerserk() ? 1 : 0;

  if (playing) {
    const pump = 1 + pulse * (0.014 + berserk * 0.01) + bass * (0.006 + berserk * 0.004);
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
  const accent = glowAccentHue(world);

  for (const s of world.stars) {
    const layerSpeed = (0.004 + s.layer * 0.006) * s.z;
    s.y += layerSpeed * (playing ? 1.4 : 0.25);
    if (s.y > 1) s.y = 0;
    const alpha = (0.025 + s.z * 0.05) * (0.6 + s.layer * 0.12);
    const starHue = playing ? (s.hue + accent * 0.15) % 360 : s.hue;
    ctx.fillStyle = `hsla(${starHue}, 40%, 75%, ${alpha})`;
    const px = s.x * world.w + parallaxX * world.w * (s.layer + 1) * 5;
    const py = s.y * world.h + parallaxY * world.h * (s.layer + 1) * 5;
    ctx.fillRect(px, py, s.s, s.s);
  }

  const flicker = 0.028 + pulse * 0.062 + bass * 0.02 * (1 + berserk * 0.5);
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
    ctx.globalAlpha = streak * (1 + berserk * 0.25);
    ctx.fillStyle = bgCache.streak;
    ctx.fillRect(0, 0, world.w, world.h);
    ctx.restore();
  }

  const grid = gridPalette(world.equipped.grid);
  const gridAlpha = (0.026 + pulse * 0.034 + bass * 0.012) * grid.alphaMul * (1 + berserk * 0.2);
  ctx.strokeStyle = `rgba(${grid.r}, ${grid.g}, ${grid.b}, ${gridAlpha})`;
  ctx.lineWidth = 1;
  const gridSize = 48;
  const off = (performance.now() * (0.02 + berserk * 0.012)) % gridSize;
  ctx.beginPath();
  for (let x = -off; x < world.w; x += gridSize) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, world.h);
  }
  for (let y = off; y < world.h; y += gridSize) {
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
  const mul = 18 * (world.powers.isBerserk() ? 1.35 : 1);
  return {
    x: (Math.random() - 0.5) * world.shake * mul,
    y: (Math.random() - 0.5) * world.shake * mul,
  };
}
