import { createHmac, timingSafeEqual } from "crypto";

const MIN_SUBMIT_MS = 3_000;
const MAX_TOKEN_AGE_MS = 30 * 60 * 1000;

function getSecret() {
  const secret = process.env.CONTACT_FORM_SECRET?.trim();
  if (!secret) return null;
  return secret;
}

export function createContactFormToken(): string | null {
  const secret = getSecret();
  if (!secret) return null;

  const issued = Date.now();
  const nonce = Math.random().toString(36).slice(2, 12);
  const payload = `${issued}.${nonce}`;
  const sig = createHmac("sha256", secret).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

export function verifyContactFormToken(token: string): boolean {
  const secret = getSecret();
  if (!secret) return false;

  const parts = token.split(".");
  if (parts.length !== 3) return false;

  const [issuedStr, nonce, sig] = parts;
  const issued = Number(issuedStr);
  if (!Number.isFinite(issued) || !nonce || !sig) return false;

  const age = Date.now() - issued;
  if (age < MIN_SUBMIT_MS || age > MAX_TOKEN_AGE_MS) return false;

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

export function verifySubmitTiming(startedAt: number): boolean {
  const elapsed = Date.now() - startedAt;
  return elapsed >= MIN_SUBMIT_MS && elapsed <= MAX_TOKEN_AGE_MS;
}
