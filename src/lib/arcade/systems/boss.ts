import { BOSS_INTRO_SEC } from "@/lib/arcade/config/balance";
import { WAVES_PER_ROUND } from "@/lib/arcade/config/waves";
import type { GameWorld } from "@/lib/arcade/game/world";
import type { BossId } from "@/lib/arcade/types";
import { spawnBoss } from "@/lib/arcade/systems/enemies";

export function tickBossFlow(
  world: GameWorld,
  dt: number,
  onTelegraph: (id: BossId) => void,
): boolean {
  if (world.phase === "bossIntro") {
    world.bossIntroTimer -= dt;
    if (world.bossIntroTimer <= 0 && world.pendingBossId) {
      spawnBoss(world, world.pendingBossId);
      world.pendingBossId = null;
      world.phase = "bossFight";
      return true;
    }
    return false;
  }

  const bossGate =
    world.wave > 0 &&
    world.wave % WAVES_PER_ROUND === 0 &&
    world.wave !== world.bossWaveTriggered &&
    !world.bossActive &&
    world.phase === "playing";

  if (bossGate) {
    world.bossWaveTriggered = world.wave;
    world.pendingBossId = "driftColossus";
    world.bossTelegraph = world.pendingBossId;
    world.bossIntroTimer = BOSS_INTRO_SEC;
    world.phase = "bossIntro";
    onTelegraph(world.pendingBossId);
    return true;
  }

  return false;
}

export function advanceWave(world: GameWorld, dt: number) {
  world.waveTimer += dt;
  if (world.waveTimer > 14) {
    world.waveTimer = 0;
    world.wave += 1;
    if (world.wave > 0 && world.wave % WAVES_PER_ROUND === 0) {
      world.round += 1;
    }
  }
}
