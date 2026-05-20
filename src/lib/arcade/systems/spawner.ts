import type { GameWorld } from "@/lib/arcade/game/world";
import { spawnFromEdge } from "@/lib/arcade/systems/enemies";
import { spawnIntervalBase } from "@/lib/arcade/config/waves";

export function updateSpawner(world: GameWorld, dt: number) {
  if (world.bossActive || world.phase === "bossIntro") return;
  world.spawnCd -= dt;
  if (world.spawnCd > 0) return;
  if (!world.beat.onBeat(0.84)) {
    world.spawnCd = 0.03;
    return;
  }

  const base = spawnIntervalBase(world.wave, world.overloadTier, world.round);
  world.spawnCd = base * (0.55 + world.roll() * 0.5);

  let count = 1;
  if (world.overloadTier >= 1 && world.roll() < 0.4 + world.overloadTier * 0.12) count += 1;
  if (world.overloadTier >= 2 && world.roll() < 0.25) count += 1;
  for (let i = 0; i < count; i++) spawnFromEdge(world);
}
