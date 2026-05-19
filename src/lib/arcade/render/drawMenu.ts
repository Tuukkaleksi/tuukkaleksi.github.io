import type { BgGradientCache } from "@/lib/arcade/render/bg-cache";
import type { GameWorld } from "@/lib/arcade/game/world";
import { drawShip } from "@/lib/arcade/render/drawShip";
import { parseColor } from "@/lib/arcade/utils/color";

/** Cheap static backdrop for ready / gameover — no bloom, no animated grid. */
export function drawMenuScene(
  ctx: CanvasRenderingContext2D,
  world: GameWorld,
  bgCache: BgGradientCache | null,
) {
  const primary = parseColor(world.colors.primary, "#0563bb");
  const fg = parseColor(world.colors.foreground, "#e8eaed");

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = `hsl(${world.bgHue}, 22%, 7%)`;
  ctx.fillRect(0, 0, world.w, world.h);

  for (const s of world.stars) {
    const alpha = (0.02 + s.z * 0.04) * (0.6 + s.layer * 0.1);
    ctx.fillStyle = `hsla(${s.hue}, 35%, 70%, ${alpha})`;
    ctx.fillRect(s.x * world.w, s.y * world.h, s.s, s.s);
  }

  if (bgCache) {
    ctx.globalAlpha = 0.85;
    ctx.fillStyle = bgCache.vignette;
    ctx.fillRect(0, 0, world.w, world.h);
    ctx.globalAlpha = 1;
  }

  ctx.strokeStyle = "rgba(90, 140, 200, 0.04)";
  ctx.lineWidth = 1;
  const grid = 48;
  ctx.beginPath();
  for (let x = 0; x < world.w; x += grid) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, world.h);
  }
  for (let y = 0; y < world.h; y += grid) {
    ctx.moveTo(0, y);
    ctx.lineTo(world.w, y);
  }
  ctx.stroke();

  const showShip = world.phase === "ready" || world.phase === "gameover";
  drawShip(ctx, world, primary, fg, world.phase, showShip);
}
