import { describe, expect, it } from "vitest";
import { combineSeed, mulberry32 } from "@/lib/arcade/rng";

describe("mulberry32", () => {
  it("is deterministic for the same seed", () => {
    const a = mulberry32(20260520);
    const b = mulberry32(20260520);
    const seqA = [a(), a(), a(), a(), a()];
    const seqB = [b(), b(), b(), b(), b()];
    expect(seqA).toEqual(seqB);
  });

  it("combineSeed changes sequence with run nonce", () => {
    const r1 = mulberry32(combineSeed(20260520, 1));
    const r2 = mulberry32(combineSeed(20260520, 2));
    expect(r1()).not.toBe(r2());
  });
});
