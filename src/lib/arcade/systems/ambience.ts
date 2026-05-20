import type { GameWorld } from "@/lib/arcade/game/world";

const GLOW_CYCLE = [200, 240, 280, 320, 200] as const;

/** Slow cyberpunk hue drift on glow layers; faster during berserk. */
export function updateAmbience(world: GameWorld, dt: number) {
  const berserk = world.powers.isBerserk();
  const speed = berserk ? 52 : 9;
  world.glowHueOffset = (world.glowHueOffset + dt * speed) % 360;

  const targetIdx = Math.floor((world.playTime * 0.08) % GLOW_CYCLE.length);
  const target = GLOW_CYCLE[targetIdx]!;
  world.glowHue = world.glowHue + (target - world.glowHue) * Math.min(1, dt * 0.35);

  if (world.berserkFlash > 0) {
    world.berserkFlash = Math.max(0, world.berserkFlash - dt * 1.4);
  }
}

export function glowAccentHue(world: GameWorld) {
  return (world.bgHue + world.glowHue + world.glowHueOffset * 0.35) % 360;
}
