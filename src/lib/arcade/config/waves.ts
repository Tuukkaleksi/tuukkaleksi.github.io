import { DRAFT_INTERVAL_SEC, WAVES_PER_ROUND, WAVE_DURATION_SEC } from "@/lib/arcade/config/balance";

export { DRAFT_INTERVAL_SEC, WAVES_PER_ROUND, WAVE_DURATION_SEC };

export function spawnIntervalBase(wave: number, overloadTier: number, round: number) {
  return Math.max(0.12, 0.55 - wave * 0.032 - overloadTier * 0.04 - round * 0.01);
}
