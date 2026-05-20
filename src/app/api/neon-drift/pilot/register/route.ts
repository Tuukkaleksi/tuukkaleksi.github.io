import { NextResponse } from "next/server";
import { getAuth, isAuthConfigured } from "@/lib/auth";
import { getAuthBaseUrl } from "@/lib/auth/urls";
import { pilotRegisterSchema } from "@/lib/auth/schema";
import { checkAuthRateLimit, getClientIp } from "@/lib/auth/rate-limit";
import { isTurnstileEnabled, verifyTurnstileToken } from "@/lib/contact/turnstile";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isAuthConfigured()) {
    return NextResponse.json({ ok: false, error: "AUTH_DISABLED" }, { status: 503 });
  }

  const ip = getClientIp(request);
  const rate = checkAuthRateLimit(ip, "sign-up");
  if (!rate.allowed) {
    return NextResponse.json(
      { ok: false, error: "RATE_LIMIT", retryAfterSec: rate.retryAfterSec },
      {
        status: 429,
        headers: rate.retryAfterSec ? { "Retry-After": String(rate.retryAfterSec) } : undefined,
      },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "VALIDATION" }, { status: 400 });
  }

  const parsed = pilotRegisterSchema.safeParse(body);
  if (!parsed.success) {
    const code = parsed.error.issues[0]?.message ?? "VALIDATION";
    return NextResponse.json({ ok: false, error: code }, { status: 400 });
  }

  const data = parsed.data;

  if (isTurnstileEnabled()) {
    const valid = await verifyTurnstileToken(data.turnstileToken ?? "", ip);
    if (!valid) {
      return NextResponse.json({ ok: false, error: "TURNSTILE_REQUIRED" }, { status: 400 });
    }
  }

  const auth = getAuth();
  if (!auth) {
    return NextResponse.json({ ok: false, error: "AUTH_DISABLED" }, { status: 503 });
  }

  const baseURL = getAuthBaseUrl();
  const callbackURL = `${baseURL}/neon-drift/verify-email?verified=1`;

  try {
    await auth.api.signUpEmail({
      body: {
        name: data.callsign,
        email: data.email,
        password: data.password,
        callsign: data.callsign,
        callbackURL,
      } as {
        name: string;
        email: string;
        password: string;
        callsign: string;
        callbackURL: string;
      },
      headers: request.headers,
    });
    return NextResponse.json({ ok: true as const });
  } catch (err) {
    console.error("[pilot/register]", err);
    const message = err instanceof Error ? err.message : "SIGN_UP_FAILED";
    if (message.toLowerCase().includes("unique") || message.toLowerCase().includes("callsign")) {
      return NextResponse.json({ ok: false, error: "CALLSIGN_TAKEN" }, { status: 409 });
    }
    if (message.toLowerCase().includes("email")) {
      return NextResponse.json({ ok: false, error: "EMAIL_TAKEN" }, { status: 409 });
    }
    return NextResponse.json({ ok: false, error: "SIGN_UP_FAILED" }, { status: 500 });
  }
}
