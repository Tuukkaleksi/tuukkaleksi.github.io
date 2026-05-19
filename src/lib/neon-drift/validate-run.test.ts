import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ScoreSubmitBody } from "@/lib/neon-drift/schema";
import { validateRunSubmission } from "@/lib/neon-drift/validate-run";
import { createRunToken } from "@/lib/neon-drift/token";

function plausibleBody(overrides: Partial<ScoreSubmitBody> = {}): ScoreSubmitBody {
  return {
    initials: "DEV",
    score: 5000,
    wave: 6,
    round: 1,
    timeSurvivedSec: 54,
    kills: 149,
    bestCombo: 85,
    bossesDefeated: 0,
    runToken: "placeholder",
    startedAt: 0,
    ...overrides,
  };
}

describe("validateRunSubmission", () => {
  const env = process.env;

  beforeEach(() => {
    process.env = { ...env, NEON_DRIFT_SECRET: "test-secret-for-vitest" };
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-19T12:00:00.000Z"));
  });

  afterEach(() => {
    process.env = env;
    vi.useRealTimers();
  });

  it("accepts a signed run within timing and plausibility bounds", () => {
    const session = createRunToken()!;
    vi.advanceTimersByTime(54_000);
    const data = plausibleBody({
      runToken: session.runToken,
      startedAt: session.startedAt,
      timeSurvivedSec: 54,
    });
    expect(validateRunSubmission(data)).toBeNull();
  });

  it("rejects scores above the anti-cheat ceiling (documents high-score edge case)", () => {
    const session = createRunToken()!;
    vi.advanceTimersByTime(54_000);
    const data = plausibleBody({
      runToken: session.runToken,
      startedAt: session.startedAt,
      score: 40_666,
      kills: 149,
      wave: 6,
      timeSurvivedSec: 54,
    });
    expect(validateRunSubmission(data)).toBe("RUN_IMPLAUSIBLE");
  });

  it("rejects invalid tokens", () => {
    const data = plausibleBody({ runToken: "bad", startedAt: Date.now() });
    expect(validateRunSubmission(data)).toBe("TOKEN_INVALID");
  });
});
