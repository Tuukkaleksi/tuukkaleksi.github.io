import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createRunToken,
  isNeonDriftSigningConfigured,
  verifyRunTiming,
  verifyRunToken,
} from "@/lib/neon-drift/token";

describe("neon-drift token", () => {
  const env = process.env;

  beforeEach(() => {
    process.env = { ...env, NEON_DRIFT_SECRET: "test-secret-for-vitest" };
  });

  afterEach(() => {
    process.env = env;
    vi.useRealTimers();
  });

  it("creates and verifies a run token", () => {
    expect(isNeonDriftSigningConfigured()).toBe(true);
    const session = createRunToken();
    expect(session).not.toBeNull();
    expect(verifyRunToken(session!.runToken, session!.startedAt)).toBe(true);
    expect(verifyRunToken(session!.runToken, session!.startedAt + 1)).toBe(false);
  });

  it("rejects game time ahead of wall clock", () => {
    vi.useFakeTimers();
    const startedAt = Date.now();
    vi.advanceTimersByTime(10_000);
    expect(verifyRunTiming(startedAt, 30)).toBe(false);
    expect(verifyRunTiming(startedAt, 8)).toBe(true);
  });
});
