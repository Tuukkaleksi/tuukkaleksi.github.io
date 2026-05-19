export type PowerUpId =
  | "overclock"
  | "magnet"
  | "dash"
  | "aura"
  | "pierce"
  | "multiplier"
  | "pulse"
  | "drone"
  | "berserk"
  | "shield"
  | "triple"
  | "timeBomb";

export const ALL_POWER_UPS: PowerUpId[] = [
  "overclock",
  "magnet",
  "dash",
  "aura",
  "pierce",
  "multiplier",
  "pulse",
  "drone",
  "berserk",
  "shield",
  "triple",
  "timeBomb",
];

export const DRAFT_POOL: PowerUpId[] = [
  "overclock",
  "pierce",
  "drone",
  "dash",
  "multiplier",
  "magnet",
  "aura",
  "pulse",
  "berserk",
  "triple",
  "shield",
];

export type Drone = { angle: number; fireCd: number };

export class PowerUpState {
  pierce = false;
  triple = false;
  dashUnlocked = false;
  drones = 0;

  overclock = 0;
  magnet = 0;
  aura = 0;
  multiplier = 0;
  berserk = 0;
  shield = 0;

  dashCd = 0;
  dashInvuln = 0;
  pulseWave = 0;
  pulseCd = 0;
  pulseUnlocked = false;

  /** Latest power-up name shown at bottom (i18n key suffix). */
  hudId: PowerUpId | null = null;
  hudTimer = 0;

  droneList: Drone[] = [];

  reset() {
    this.pierce = false;
    this.triple = false;
    this.dashUnlocked = false;
    this.drones = 0;
    this.overclock = 0;
    this.magnet = 0;
    this.aura = 0;
    this.multiplier = 0;
    this.berserk = 0;
    this.shield = 0;
    this.dashCd = 0;
    this.dashInvuln = 0;
    this.pulseWave = 0;
    this.pulseCd = 0;
    this.pulseUnlocked = false;
    this.hudId = null;
    this.hudTimer = 0;
    this.droneList = [];
  }

  showHud(id: PowerUpId, duration: number) {
    this.hudId = id;
    this.hudTimer = Math.max(this.hudTimer, duration);
  }

  tickHud(dt: number) {
    if (this.hudTimer > 0) this.hudTimer = Math.max(0, this.hudTimer - dt);
    else if (this.hudTimer <= 0) this.hudId = this.getActiveHudId();
  }

  private getActiveHudId(): PowerUpId | null {
    if (this.berserk > 0) return "berserk";
    if (this.overclock > 0) return "overclock";
    if (this.multiplier > 0) return "multiplier";
    if (this.aura > 0) return "aura";
    if (this.magnet > 0) return "magnet";
    if (this.shield > 0) return "shield";
    if (this.pierce) return "pierce";
    if (this.triple) return "triple";
    if (this.drones > 0) return "drone";
    if (this.dashUnlocked) return "dash";
    if (this.pulseCd > 0) return "pulse";
    return null;
  }

  getHudDisplayId(): PowerUpId | null {
    if (this.hudTimer > 0 && this.hudId) return this.hudId;
    return this.getActiveHudId();
  }

  enemyTimeScale(): number {
    if (this.overclock > 0) return 0.42;
    return 1;
  }

  scoreMult(): number {
    return this.multiplier > 0 ? 2 : 1;
  }

  isBerserk(): boolean {
    return this.berserk > 0;
  }

  hasMagnet(): boolean {
    return this.magnet > 0;
  }
}

export function rollDraftChoices(tier: number): PowerUpId[] {
  const pool = [...DRAFT_POOL];
  if (tier >= 2) pool.push("timeBomb");
  const picks: PowerUpId[] = [];
  while (picks.length < 3 && pool.length > 0) {
    const i = Math.floor(Math.random() * pool.length);
    picks.push(pool.splice(i, 1)[0]!);
  }
  return picks;
}

export function rollPickupKind(): PowerUpId {
  const pool: PowerUpId[] = ["shield", "magnet", "multiplier", "overclock", "aura", "triple"];
  return pool[Math.floor(Math.random() * pool.length)]!;
}

/** Canvas icon for floating pickups (center x,y). */
export function drawPowerUpIcon(
  ctx: CanvasRenderingContext2D,
  id: PowerUpId,
  x: number,
  y: number,
  t: number,
) {
  const pulse = 0.85 + Math.sin(t * 4) * 0.15;
  const s = 14 * pulse;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(Math.sin(t * 2) * 0.08);

  const ring = (color: string) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, s + 4, 0, Math.PI * 2);
    ctx.stroke();
  };

  switch (id) {
    case "overclock":
      ring("#60a5fa");
      ctx.fillStyle = "#93c5fd";
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.55, 0, Math.PI * 1.6);
      ctx.lineTo(0, 0);
      ctx.fill();
      break;
    case "magnet":
      ring("#a78bfa");
      ctx.fillStyle = "#c4b5fd";
      ctx.fillRect(-s * 0.5, -s * 0.35, s, s * 0.7);
      ctx.fillStyle = "#1e1b4b";
      ctx.fillRect(-s * 0.25, -s * 0.15, s * 0.5, s * 0.3);
      break;
    case "dash":
      ring("#5eead4");
      ctx.fillStyle = "#99f6e4";
      ctx.beginPath();
      ctx.moveTo(s * 0.6, 0);
      ctx.lineTo(-s * 0.4, -s * 0.45);
      ctx.lineTo(-s * 0.15, 0);
      ctx.lineTo(-s * 0.4, s * 0.45);
      ctx.closePath();
      ctx.fill();
      break;
    case "aura":
      ring("#f472b6");
      ctx.strokeStyle = "#fb7185";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.75, 0, Math.PI * 2);
      ctx.stroke();
      break;
    case "pierce":
      ring("#fbbf24");
      ctx.fillStyle = "#fde047";
      for (let i = -1; i <= 1; i++) {
        ctx.fillRect(i * s * 0.35 - 2, -s * 0.7, 4, s * 1.4);
      }
      break;
    case "multiplier":
      ring("#facc15");
      ctx.fillStyle = "#fef08a";
      ctx.font = `bold ${s}px system-ui`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("×2", 0, 1);
      break;
    case "pulse":
      ring("#38bdf8");
      ctx.strokeStyle = "#7dd3fc";
      ctx.lineWidth = 2;
      for (let r = 0; r < 3; r++) {
        ctx.beginPath();
        ctx.arc(0, 0, s * (0.35 + r * 0.22), 0, Math.PI * 2);
        ctx.stroke();
      }
      break;
    case "drone":
      ring("#818cf8");
      ctx.fillStyle = "#a5b4fc";
      ctx.beginPath();
      ctx.arc(-s * 0.4, 0, 4, 0, Math.PI * 2);
      ctx.arc(s * 0.4, 0, 4, 0, Math.PI * 2);
      ctx.fill();
      break;
    case "berserk":
      ring("#ef4444");
      ctx.fillStyle = "#fca5a5";
      ctx.beginPath();
      ctx.moveTo(0, -s * 0.7);
      ctx.lineTo(s * 0.5, s * 0.6);
      ctx.lineTo(-s * 0.5, s * 0.6);
      ctx.closePath();
      ctx.fill();
      break;
    case "shield":
      ring("#5eead4");
      ctx.strokeStyle = "#99f6e4";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(0, -s * 0.75);
      ctx.quadraticCurveTo(s * 0.8, -s * 0.2, 0, s * 0.85);
      ctx.quadraticCurveTo(-s * 0.8, -s * 0.2, 0, -s * 0.75);
      ctx.stroke();
      break;
    case "triple":
      ring("#f97316");
      ctx.fillStyle = "#fdba74";
      for (let i = -1; i <= 1; i++) {
        ctx.beginPath();
        ctx.moveTo(i * s * 0.35, -s * 0.5);
        ctx.lineTo(i * s * 0.35 + 3, s * 0.6);
        ctx.lineTo(i * s * 0.35 - 3, s * 0.6);
        ctx.fill();
      }
      break;
    case "timeBomb":
      ring("#f43f5e");
      ctx.fillStyle = "#fda4af";
      ctx.beginPath();
      ctx.arc(0, 2, s * 0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.beginPath();
      ctx.moveTo(0, -s * 0.5);
      ctx.lineTo(0, -s * 0.9);
      ctx.stroke();
      break;
  }
  ctx.restore();
}
