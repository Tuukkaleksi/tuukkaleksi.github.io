import type { ScoreSubmitBody } from "@/lib/neon-drift/schema";
import { verifyRunTiming, verifyRunToken } from "@/lib/neon-drift/token";

export type RunValidationError =
  | "TOKEN_INVALID"
  | "TIMING_INVALID"
  | "RUN_IMPLAUSIBLE";

export function validateRunSubmission(data: ScoreSubmitBody): RunValidationError | null {
  if (!verifyRunToken(data.runToken, data.startedAt)) {
    return "TOKEN_INVALID";
  }

  if (!verifyRunTiming(data.startedAt, data.timeSurvivedSec)) {
    return "TIMING_INVALID";
  }

  if (!isRunPlausible(data)) {
    return "RUN_IMPLAUSIBLE";
  }

  return null;
}

function isRunPlausible(data: ScoreSubmitBody): boolean {
  const { score, kills, bossesDefeated, wave, timeSurvivedSec } = data;

  const maxScore =
    kills * 200 + bossesDefeated * 8_000 + wave * 400 + 500;
  if (score > maxScore) return false;

  if (score > 1_000 && timeSurvivedSec < 8) return false;

  if (timeSurvivedSec > 0 && kills > timeSurvivedSec * 25) return false;

  return true;
}
