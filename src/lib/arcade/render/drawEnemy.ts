import { BOSS_DEFS, ENEMY_DEFS } from "@/lib/arcade/config/enemies";
import type { Enemy } from "@/lib/arcade/entities/entity-types";

export function drawEnemy(ctx: CanvasRenderingContext2D, e: Enemy, playerY: number, playerX: number) {
  ctx.save();
  ctx.translate(e.x, e.y);
  const face = Math.atan2(playerY - e.y, playerX - e.x);
  ctx.rotate(face + Math.sin(e.wobble) * 0.1);

  if (e.isBoss && e.bossId) {
    const def = BOSS_DEFS[e.bossId];
    ctx.fillStyle = def.color;
    ctx.strokeStyle = "rgba(232, 121, 249, 0.45)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const rr = e.r * (i % 2 ? 0.85 : 1);
      const px = Math.cos(a) * rr;
      const py = Math.sin(a) * rr;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.fill();
    const hpPct = e.hp / e.maxHp;
    ctx.fillStyle = "rgba(0,0,0,0.4)";
    ctx.fillRect(-e.r, e.r + 8, e.r * 2, 6);
    ctx.fillStyle = "#f0abfc";
    ctx.fillRect(-e.r, e.r + 8, e.r * 2 * hpPct, 6);
    ctx.restore();
    return;
  }

  const def = ENEMY_DEFS[e.kind];
  ctx.fillStyle = def.color;
  if (e.kind === "splitter") {
    ctx.beginPath();
    ctx.moveTo(e.r, 0);
    ctx.lineTo(-e.r * 0.6, e.r * 0.55);
    ctx.lineTo(-e.r * 0.6, -e.r * 0.55);
    ctx.closePath();
  } else if (e.kind === "stalker" || e.kind === "sniper") {
    ctx.beginPath();
    ctx.rect(-e.r * 0.7, -e.r * 0.7, e.r * 1.4, e.r * 1.4);
  } else if (e.kind === "tank") {
    ctx.beginPath();
    ctx.roundRect(-e.r * 0.8, -e.r * 0.8, e.r * 1.6, e.r * 1.6, 4);
  } else if (e.kind === "swarmer") {
    ctx.beginPath();
    ctx.moveTo(e.r, 0);
    ctx.lineTo(-e.r * 0.5, e.r * 0.5);
    ctx.lineTo(-e.r * 0.5, -e.r * 0.5);
    ctx.closePath();
  } else if (e.kind === "orbiter") {
    ctx.beginPath();
    ctx.arc(0, 0, e.r, 0, Math.PI * 2);
    ctx.strokeStyle = def.color;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.globalAlpha = 0.5;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.restore();
    return;
  } else {
    ctx.beginPath();
    ctx.arc(0, 0, e.r, 0, Math.PI * 2);
  }
  ctx.fill();
  ctx.restore();
}
