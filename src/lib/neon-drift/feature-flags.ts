/**
 * Global leaderboard submit stays off until sign-in/register ships.
 * Set NEXT_PUBLIC_NEON_DRIFT_GLOBAL_SUBMIT=true to re-enable.
 */
export function isGlobalLeaderboardSubmitEnabled(): boolean {
  return process.env.NEXT_PUBLIC_NEON_DRIFT_GLOBAL_SUBMIT === "true";
}
