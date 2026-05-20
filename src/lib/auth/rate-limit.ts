const WINDOW_MS = 15 * 60 * 1000;
const MAX_SIGN_IN = 10;
const MAX_SIGN_UP = 5;
const MAX_FORGOT = 5;

type Bucket = { timestamps: number[] };

const globalStore = globalThis as typeof globalThis & {
  __pilotAuthRateLimit?: Map<string, Bucket>;
};

function getStore() {
  if (!globalStore.__pilotAuthRateLimit) {
    globalStore.__pilotAuthRateLimit = new Map();
  }
  return globalStore.__pilotAuthRateLimit;
}

export type AuthRateLimitAction = "sign-in" | "sign-up" | "forgot-password";

function maxForAction(action: AuthRateLimitAction) {
  switch (action) {
    case "sign-in":
      return MAX_SIGN_IN;
    case "sign-up":
      return MAX_SIGN_UP;
    case "forgot-password":
      return MAX_FORGOT;
  }
}

export function checkAuthRateLimit(
  ip: string,
  action: AuthRateLimitAction,
): { allowed: boolean; retryAfterSec?: number } {
  const now = Date.now();
  const key = `${action}:${ip}`;
  const store = getStore();
  const bucket = store.get(key) ?? { timestamps: [] };
  const max = maxForAction(action);

  const recent = bucket.timestamps.filter((t) => now - t < WINDOW_MS);
  if (recent.length >= max) {
    const oldest = recent[0]!;
    const retryAfterSec = Math.ceil((WINDOW_MS - (now - oldest)) / 1000);
    return { allowed: false, retryAfterSec };
  }

  recent.push(now);
  store.set(key, { timestamps: recent });
  return { allowed: true };
}

export { getClientIp } from "@/lib/neon-drift/rate-limit";
