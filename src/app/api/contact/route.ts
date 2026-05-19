import { NextResponse } from "next/server";
import { sendContactEmail } from "@/lib/contact/email";
import { checkContactRateLimit, getClientIp } from "@/lib/contact/rate-limit";
import { contactBodySchema, looksLikeSpam } from "@/lib/contact/schema";
import { verifyContactFormToken, verifySubmitTiming } from "@/lib/contact/token";
import { isTurnstileEnabled, verifyTurnstileToken } from "@/lib/contact/turnstile";

export const runtime = "nodejs";

const ERROR_STATUS: Record<string, number> = {
  RATE_LIMIT: 429,
  BOT_DETECTED: 400,
  TOKEN_INVALID: 403,
  TIMING_INVALID: 403,
  SPAM_DETECTED: 400,
  TURNSTILE_FAILED: 403,
  EMAIL_NOT_CONFIGURED: 503,
  SEND_FAILED: 502,
  VALIDATION: 400,
};

function jsonError(code: string, status?: number) {
  return NextResponse.json(
    { ok: false as const, error: code },
    { status: status ?? ERROR_STATUS[code] ?? 400 },
  );
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rate = checkContactRateLimit(ip);
  if (!rate.allowed) {
    return NextResponse.json(
      { ok: false as const, error: "RATE_LIMIT", retryAfterSec: rate.retryAfterSec },
      {
        status: 429,
        headers: rate.retryAfterSec
          ? { "Retry-After": String(rate.retryAfterSec) }
          : undefined,
      },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("VALIDATION");
  }

  const parsed = contactBodySchema.safeParse(body);
  if (!parsed.success) {
    const code = parsed.error.issues[0]?.message ?? "VALIDATION";
    return NextResponse.json({ ok: false as const, error: code }, { status: 400 });
  }

  const data = parsed.data;

  if (data.company?.trim()) {
    return jsonError("BOT_DETECTED");
  }

  if (!verifyContactFormToken(data.formToken)) {
    return jsonError("TOKEN_INVALID");
  }

  if (!verifySubmitTiming(data.startedAt)) {
    return jsonError("TIMING_INVALID");
  }

  if (looksLikeSpam(`${data.subject} ${data.message}`)) {
    return jsonError("SPAM_DETECTED");
  }

  if (isTurnstileEnabled()) {
    const ok = await verifyTurnstileToken(data.turnstileToken ?? "", ip);
    if (!ok) return jsonError("TURNSTILE_FAILED");
  }

  try {
    await sendContactEmail(data);
  } catch (e) {
    const code = e instanceof Error ? e.message : "SEND_FAILED";
    if (code === "EMAIL_NOT_CONFIGURED" || code === "SEND_FAILED") {
      return jsonError(code);
    }
    return jsonError("SEND_FAILED");
  }

  return NextResponse.json({ ok: true as const });
}
