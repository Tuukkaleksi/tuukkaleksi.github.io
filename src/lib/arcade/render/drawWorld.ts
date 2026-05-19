import { drawPowerUpIcon } from "@/lib/arcade/power-ups";
import type { GameWorld } from "@/lib/arcade/game/world";
import { drawEnemy } from "@/lib/arcade/render/drawEnemy";
import { clamp } from "@/lib/arcade/utils/math";

export function drawWorldLayer(
  ctx: CanvasRenderingContext2D,
  world: GameWorld,
  primary: string,
  fg: string,
  bass: number,
  showWorld: boolean,
) {
  if (!showWorld) return;

  if (world.powers.pulseWave > 0) {
    const pr = world.powers.pulseWave / 0.55;
    ctx.strokeStyle = `rgba(56, 189, 248, ${(1 - pr) * 0.35})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(world.player.x, world.player.y, 40 + (1 - pr) * 160, 0, Math.PI * 2);
    ctx.stroke();
  }

  if (world.trails.length > 1) {
    const trailGlow = 0.28 + bass * 0.22 + (world.powers.isBerserk() ? 0.2 : 0);
    for (let i = 1; i < world.trails.length; i++) {
      const a = world.trails[i - 1]!;
      const b = world.trails[i]!;
      const t = b.life / 0.55;
      ctx.strokeStyle = `rgba(59, 158, 255, ${t * trailGlow})`;
      ctx.lineWidth = 2 + t * 8;
      ctx.lineCap = "round";
      ctx.globalCompositeOperation = "lighter";
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
      ctx.globalCompositeOperation = "source-over";
    }
  }

  for (const g of world.gems) {
    ctx.beginPath();
    ctx.fillStyle = g.risk ? "#f87171" : primary;
    ctx.globalAlpha = 0.9;
    ctx.moveTo(g.x, g.y - 8);
    ctx.lineTo(g.x + 7, g.y);
    ctx.lineTo(g.x, g.y + 8);
    ctx.lineTo(g.x - 7, g.y);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  const now = performance.now() / 1000;
  for (const pu of world.powerUps) {
    pu.spin += 0.02;
    drawPowerUpIcon(ctx, pu.kind, pu.x, pu.y, now + pu.spin);
  }

  for (const b of world.bullets) {
    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.rotate(Math.atan2(b.vy, b.vx));
    const w = b.player ? 4 : 5;
    const h = b.player ? 12 : 10;
    ctx.fillStyle = b.player ? "rgba(59, 158, 255, 0.35)" : "rgba(244, 114, 182, 0.35)";
    ctx.fillRect(-w / 2 - 1, -h / 2 - 1, w + 2, h + 2);
    ctx.fillStyle = b.player ? primary : "#f472b6";
    ctx.fillRect(-w / 2, -h / 2, w, h);
    ctx.restore();
  }

  for (const e of world.enemies) {
    drawEnemy(ctx, e, world.player.y, world.player.x);
  }

  for (const p of world.particles) {
    const t = p.life / p.maxLife;
    ctx.globalAlpha = clamp(t, 0, 1);
    if (p.kind === "gem" || p.kind === "glow") ctx.fillStyle = primary;
    else if (p.kind === "explosion") ctx.fillStyle = "#f97316";
    else if (p.kind === "shatter") ctx.fillStyle = p.size > 4 ? "#c084fc" : "#fb7185";
    else ctx.fillStyle = fg;
    if (p.kind === "explosion" || p.kind === "glow") {
      ctx.globalCompositeOperation = "lighter";
    }
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * t, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
  }
}

export function drawOverlays(
  ctx: CanvasRenderingContext2D,
  world: GameWorld,
  primary: string,
  fg: string,
  showWorld: boolean,
  playing: boolean,
) {
  if (world.deathFlash > 0) {
    ctx.fillStyle = `rgba(255, 80, 120, ${world.deathFlash * 0.12})`;
    ctx.fillRect(0, 0, world.w, world.h);
  }

  if (showWorld && world.powers.shield > 0) {
    ctx.strokeStyle = `rgba(94, 234, 212, ${0.35 + Math.sin(performance.now() * 0.01) * 0.2})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(world.player.x, world.player.y, 28, 0, Math.PI * 2);
    ctx.stroke();
  }

  if (showWorld && world.powers.aura > 0) {
    ctx.strokeStyle = `rgba(244, 114, 182, ${0.25 + Math.sin(performance.now() * 0.008) * 0.12})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(world.player.x, world.player.y, 70, 0, Math.PI * 2);
    ctx.stroke();
  }

  if (showWorld && world.powers.overclock > 0) {
    ctx.fillStyle = "rgba(59, 130, 246, 0.08)";
    ctx.fillRect(0, 0, world.w, world.h);
  }

  if (showWorld) {
    for (const d of world.powers.droneList) {
      const dx = world.player.x + Math.cos(d.angle) * 42;
      const dy = world.player.y + Math.sin(d.angle) * 42;
      ctx.fillStyle = "#a5b4fc";
      ctx.beginPath();
      ctx.arc(dx, dy, 5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  if (world.overloadFlash > 0 && playing) {
    const a = clamp(world.overloadFlash / 2.4, 0, 1);
    ctx.save();
    ctx.globalAlpha = a * 0.5;
    ctx.font = "700 26px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillStyle = "#f0abfc";
    ctx.fillText("DRIFT OVERLOAD", world.w / 2, world.h * 0.2);
    ctx.restore();
  }
}
