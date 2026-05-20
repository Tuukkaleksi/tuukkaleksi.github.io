/** Mulberry32 — fast seeded PRNG for daily runs. */
export function mulberry32(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function combineSeed(dailySeed: number, runNonce: number) {
  return (dailySeed ^ Math.imul(runNonce, 0x9e3779b9)) >>> 0;
}
