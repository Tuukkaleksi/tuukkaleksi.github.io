import { skinPalette } from "@/lib/arcade/cosmetics";
import type { GameWorld } from "@/lib/arcade/game/world";
import type { GamePhase } from "@/lib/arcade/types";

export function drawShip(
  ctx: CanvasRenderingContext2D,
  world: GameWorld,
  primary: string,
  fg: string,
  phase: GamePhase,
  visible: boolean,
) {
  if (!visible && phase === "ready") {
    ctx.save();
    ctx.translate(world.player.x, world.player.y);
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = primary;
    ctx.beginPath();
    ctx.arc(0, 0, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }
  if (!visible) return;

  const skin = skinPalette(world.equipped.skin, primary, fg);
  const { x, y } = world.player;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(world.playerAngle + Math.PI / 2);
  ctx.fillStyle = skin.hull;
  ctx.beginPath();
  ctx.moveTo(0, -22);
  ctx.lineTo(18, 16);
  ctx.lineTo(0, 10);
  ctx.lineTo(-18, 16);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = skin.accent;
  ctx.globalAlpha = 0.85;
  ctx.beginPath();
  ctx.arc(0, 2, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.restore();
}

export function drawChromaticShip(
  ctx: CanvasRenderingContext2D,
  world: GameWorld,
  primary: string,
  fg: string,
  visible: boolean,
) {
  const off = world.chroma * 7;
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  ctx.globalAlpha = 0.4 * world.chroma;
  ctx.translate(-off, 0);
  drawShip(ctx, world, "#ff6b9d", fg, world.phase, visible);
  ctx.translate(off * 2, 0);
  drawShip(ctx, world, "#5eead4", fg, world.phase, visible);
  ctx.restore();
  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = 1;
  drawShip(ctx, world, primary, fg, world.phase, visible);
}
