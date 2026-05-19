import { describe, expect, it } from "vitest";
import { MIN_SUBMIT_SCORE, scoreSubmitSchema } from "@/lib/neon-drift/schema";

const validBody = {
  initials: "abc",
  score: 1200,
  wave: 4,
  round: 1,
  timeSurvivedSec: 60,
  kills: 40,
  bestCombo: 10,
  bossesDefeated: 0,
  runToken: "1234567890.sig",
  startedAt: 1_700_000_000_000,
};

describe("scoreSubmitSchema", () => {
  it("normalizes initials to uppercase", () => {
    const parsed = scoreSubmitSchema.safeParse({ ...validBody, initials: "dev" });
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data.initials).toBe("DEV");
  });

  it("rejects score below minimum", () => {
    const parsed = scoreSubmitSchema.safeParse({
      ...validBody,
      score: MIN_SUBMIT_SCORE - 1,
    });
    expect(parsed.success).toBe(false);
  });

  it("rejects invalid initials", () => {
    expect(scoreSubmitSchema.safeParse({ ...validBody, initials: "A" }).success).toBe(false);
    expect(scoreSubmitSchema.safeParse({ ...validBody, initials: "ABCD1" }).success).toBe(false);
  });
});
