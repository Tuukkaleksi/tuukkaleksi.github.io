import { afterEach, describe, expect, it } from "vitest";
import { isGlobalLeaderboardSubmitEnabled } from "@/lib/neon-drift/feature-flags";

describe("isGlobalLeaderboardSubmitEnabled", () => {
  const env = process.env;

  afterEach(() => {
    process.env = env;
  });

  it("is off unless explicitly enabled", () => {
    delete process.env.NEXT_PUBLIC_NEON_DRIFT_GLOBAL_SUBMIT;
    expect(isGlobalLeaderboardSubmitEnabled()).toBe(false);
    process.env.NEXT_PUBLIC_NEON_DRIFT_GLOBAL_SUBMIT = "true";
    expect(isGlobalLeaderboardSubmitEnabled()).toBe(true);
  });
});
