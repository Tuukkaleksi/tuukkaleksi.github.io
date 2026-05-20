import { describe, expect, it } from "vitest";
import { callsignSchema, pilotRegisterSchema, scorePasswordStrength } from "@/lib/auth/schema";

describe("callsignSchema", () => {
  it("accepts valid callsigns", () => {
    expect(callsignSchema.safeParse("ACE").success).toBe(true);
    expect(callsignSchema.safeParse("Pilot_42").success).toBe(true);
  });

  it("rejects invalid callsigns", () => {
    expect(callsignSchema.safeParse("ab").success).toBe(false);
    expect(callsignSchema.safeParse("bad-name").success).toBe(false);
    expect(callsignSchema.safeParse("way_too_long_callsign").success).toBe(false);
  });
});

describe("pilotRegisterSchema", () => {
  it("requires matching passwords", () => {
    const result = pilotRegisterSchema.safeParse({
      callsign: "NEON",
      email: "pilot@example.com",
      password: "password1234",
      confirmPassword: "different",
    });
    expect(result.success).toBe(false);
  });
});

describe("scorePasswordStrength", () => {
  it("scores stronger passwords higher", () => {
    expect(scorePasswordStrength("")).toBe(0);
    expect(scorePasswordStrength("short")).toBeLessThan(scorePasswordStrength("LongPass1!extra"));
  });
});
