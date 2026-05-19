const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 5;

type Bucket = { timestamps: number[] };

const globalStore = globalThis as typeof globalThis & {
  __contactRateLimit?: Map<string, Bucket>;
};

function getStore() {
  if (!globalStore.__contactRateLimit) {
    globalStore.__contactRateLimit = new Map();
  }
  return globalStore.__contactRateLimit;
}

export function checkContactRateLimit(key: string): { allowed: boolean; retryAfterSec?: number } {
  const now = Date.now();
  const store = getStore();
  const bucket = store.get(key) ?? { timestamps: [] };

  const recent = bucket.timestamps.filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) {
    const oldest = recent[0]!;
    const retryAfterSec = Math.ceil((WINDOW_MS - (now - oldest)) / 1000);
    return { allowed: false, retryAfterSec };
  }

  recent.push(now);
  store.set(key, { timestamps: recent });
  return { allowed: true };
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "unknown";
}
