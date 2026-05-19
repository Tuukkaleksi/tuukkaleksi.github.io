import type { PowerUpState } from "@/lib/arcade/power-ups";

const SYNERGY_RULES: { id: string; test: (p: PowerUpState) => boolean }[] = [
  { id: "laserWall", test: (p) => p.pierce && (p.triple || p.isBerserk()) },
  { id: "bulletStorm", test: (p) => p.isBerserk() && p.triple },
  { id: "greedLoop", test: (p) => p.hasMagnet() && p.multiplier > 0 },
  { id: "fortress", test: (p) => p.shield > 0 && p.dashUnlocked },
  { id: "orbitKing", test: (p) => p.drones >= 2 && p.pierce },
];

export function activeSynergies(powers: PowerUpState): string[] {
  return SYNERGY_RULES.filter((r) => r.test(powers)).map((r) => r.id);
}
