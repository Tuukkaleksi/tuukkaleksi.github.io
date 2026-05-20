import { NextRequest, NextResponse } from "next/server";
import { toNextJsHandler } from "better-auth/next-js";
import { getAuth, isAuthConfigured } from "@/lib/auth";
import { checkAuthRateLimit, getClientIp, type AuthRateLimitAction } from "@/lib/auth/rate-limit";

export const runtime = "nodejs";

function rateLimitAction(pathname: string): AuthRateLimitAction | null {
  if (pathname.includes("sign-in")) return "sign-in";
  if (pathname.includes("sign-up")) return "sign-up";
  if (pathname.includes("request-password-reset")) return "forgot-password";
  return null;
}

async function withRateLimit(req: NextRequest, handler: (req: NextRequest) => Promise<Response>) {
  if (!isAuthConfigured()) {
    return NextResponse.json({ error: "AUTH_DISABLED" }, { status: 503 });
  }

  const action = rateLimitAction(new URL(req.url).pathname);
  if (action) {
    const ip = getClientIp(req);
    const limit = checkAuthRateLimit(ip, action);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "RATE_LIMIT", retryAfterSec: limit.retryAfterSec },
        {
          status: 429,
          headers: limit.retryAfterSec ? { "Retry-After": String(limit.retryAfterSec) } : undefined,
        },
      );
    }
  }

  return handler(req);
}

export async function GET(req: NextRequest) {
  const auth = getAuth();
  if (!auth) {
    return NextResponse.json({ error: "AUTH_DISABLED" }, { status: 503 });
  }
  const { GET: handleGet } = toNextJsHandler(auth);
  return withRateLimit(req, handleGet);
}

export async function POST(req: NextRequest) {
  const auth = getAuth();
  if (!auth) {
    return NextResponse.json({ error: "AUTH_DISABLED" }, { status: 503 });
  }
  const { POST: handlePost } = toNextJsHandler(auth);
  return withRateLimit(req, handlePost);
}
