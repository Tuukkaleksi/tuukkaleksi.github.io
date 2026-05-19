import { createHmac, timingSafeEqual } from "crypto";

const MAX_TOKEN_AGE_MS = 45 * 60 * 1000;

function getSecret(): string | null {
  const secret =
    process.env.NEON_DRIFT_SECRET ??
    process.env.CONTACT_FORM_SECRET ??
    process.env.RESEND_API_KEY ??
    "";
  return secret.trim() || null;
}

export function isNeonDriftSigningConfigured(): boolean {
  return getSecret() !== null;
}

export function createRunToken(): { runToken: string; startedAt: number } | null {
  const secret = getSecret();
  if (!secret) return null;

  const startedAt = Date.now();
  const nonce = Math.random().toString(36).slice(2, 12);
  const payload = `${startedAt}.${nonce}`;
  const sig = createHmac("sha256", secret).update(payload).digest("hex");
  return { runToken: `${payload}.${sig}`, startedAt };
}

export function verifyRunToken(runToken: string, startedAt: number): boolean {
  const secret = getSecret();
  if (!secret) return false;

  const parts = runToken.split(".");
  if (parts.length !== 3) return false;

  const [issuedStr, nonce, sig] = parts;
  const issued = Number(issuedStr);
  if (!Number.isFinite(issued) || issued !== startedAt || !nonce || !sig) return false;

  const age = Date.now() - issued;
  if (age > MAX_TOKEN_AGE_MS) return false;

  const payload = `${issued}.${nonce}`;
  const expected = createHmac("sha256", secret).update(payload).digest("hex");

  try {
    const a = Buffer.from(sig, "hex");
    const b = Buffer.from(expected, "hex");
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

/** Wall clock may exceed game time (drafts, pause, boss intro); game time cannot exceed wall clock. */
export function verifyRunTiming(startedAt: number, timeSurvivedSec: number): boolean {
  const elapsedMs = Date.now() - startedAt;
  if (elapsedMs > MAX_TOKEN_AGE_MS) return false;

  const elapsedSec = elapsedMs / 1000;
  if (timeSurvivedSec > elapsedSec + 8) return false;
  if (timeSurvivedSec < 0) return false;

  return true;
}
