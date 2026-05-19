export const DEATH_MESSAGE_KEYS = [
  "deathDriftFailed",
  "deathSignalLost",
  "deathOverheated",
  "deathTrajectoryBroken",
] as const;

export type DeathMessageKey = (typeof DEATH_MESSAGE_KEYS)[number];

export function pickDeathMessageKey(): DeathMessageKey {
  return DEATH_MESSAGE_KEYS[Math.floor(Math.random() * DEATH_MESSAGE_KEYS.length)]!;
}
