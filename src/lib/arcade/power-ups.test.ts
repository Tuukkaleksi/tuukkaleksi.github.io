import { afterEach, describe, expect, it, vi } from "vitest";
import {
  ALL_POWER_UPS,
  DRAFT_POOL,
  PowerUpState,
  rollDraftChoices,
  type PowerUpId,
} from "@/lib/arcade/power-ups";

describe("PowerUpState", () => {
  it("resets all fields", () => {
    const p = new PowerUpState();
    p.pierce = true;
    p.overclock = 5;
    p.drones = 2;
    p.shield = 3;
    p.hudId = "berserk";
    p.reset();
    expect(p.pierce).toBe(false);
    expect(p.overclock).toBe(0);
    expect(p.drones).toBe(0);
    expect(p.shield).toBe(0);
    expect(p.hudId).toBeNull();
    expect(p.droneList).toHaveLength(0);
  });

  it("applies score and enemy modifiers when buffs are active", () => {
    const p = new PowerUpState();
    expect(p.scoreMult()).toBe(1);
    expect(p.enemyTimeScale()).toBe(1);
    p.multiplier = 1;
    p.overclock = 1;
    expect(p.scoreMult()).toBe(2);
    expect(p.enemyTimeScale()).toBe(0.42);
    expect(p.isBerserk()).toBe(false);
    p.berserk = 0.5;
    expect(p.isBerserk()).toBe(true);
  });

  it("prefers timed HUD label over passive flags", () => {
    const p = new PowerUpState();
    p.shield = 5;
    p.showHud("dash", 2);
    expect(p.getHudDisplayId()).toBe("dash");
    p.tickHud(3);
    expect(p.getHudDisplayId()).toBe("shield");
  });
});

describe("rollDraftChoices", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns three unique picks from the draft pool", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    const picks = rollDraftChoices(1);
    expect(picks).toHaveLength(3);
    expect(new Set(picks).size).toBe(3);
    for (const id of picks) {
      expect(DRAFT_POOL).toContain(id);
    }
  });

  it("can include timeBomb at tier 2+", () => {
    const seen = new Set<PowerUpId>();
    for (let i = 0; i < 40; i++) {
      rollDraftChoices(2).forEach((id) => seen.add(id));
    }
    expect(seen.has("timeBomb")).toBe(true);
  });

  it("never includes timeBomb at tier 1", () => {
    for (let i = 0; i < 30; i++) {
      const picks = rollDraftChoices(1);
      expect(picks).not.toContain("timeBomb");
    }
  });
});

describe("ALL_POWER_UPS", () => {
  it("lists every power-up id exactly once", () => {
    expect(new Set(ALL_POWER_UPS).size).toBe(ALL_POWER_UPS.length);
    expect(ALL_POWER_UPS.length).toBeGreaterThanOrEqual(DRAFT_POOL.length);
  });
});
