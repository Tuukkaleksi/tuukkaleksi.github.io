import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { insertScore, isLeaderboardEnabled } from "@/lib/neon-drift/leaderboard";
import { checkNeonDriftRateLimit, getClientIp } from "@/lib/neon-drift/rate-limit";
import { scoreSubmitSchema } from "@/lib/neon-drift/schema";
import { validateRunSubmission } from "@/lib/neon-drift/validate-run";
import { isNeonDriftSigningConfigured } from "@/lib/neon-drift/token";

export const runtime = "nodejs";

const ERROR_STATUS: Record<string, number> = {
  LEADERBOARD_DISABLED: 503,
  RATE_LIMIT: 429,
  VALIDATION: 400,
  TOKEN_INVALID: 403,
  TIMING_INVALID: 403,
  RUN_IMPLAUSIBLE: 400,
  SUBMIT_FAILED: 502,
};

function jsonError(code: string, status?: number) {
  return NextResponse.json(
    { ok: false as const, error: code },
    { status: status ?? ERROR_STATUS[code] ?? 400 },
  );
}

export async function POST(request: Request) {
  if (!isLeaderboardEnabled() || !isNeonDriftSigningConfigured()) {
    return jsonError("LEADERBOARD_DISABLED");
  }

  const ip = getClientIp(request);
  const rate = checkNeonDriftRateLimit(ip);
  if (!rate.allowed) {
    return NextResponse.json(
      { ok: false as const, error: "RATE_LIMIT", retryAfterSec: rate.retryAfterSec },
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
    return jsonError("VALIDATION");
  }

  const parsed = scoreSubmitSchema.safeParse(body);
  if (!parsed.success) {
    const code = parsed.error.issues[0]?.message ?? "VALIDATION";
    return NextResponse.json({ ok: false as const, error: code }, { status: 400 });
  }

  const data = parsed.data;
  const runError = validateRunSubmission(data);
  if (runError) {
    return jsonError(runError);
  }

  try {
    const result = await insertScore(data);
    if (!result) {
      return jsonError("SUBMIT_FAILED");
    }

    revalidatePath("/", "layout");

    return NextResponse.json({
      ok: true as const,
      rank: result.rank,
    });
  } catch {
    return jsonError("SUBMIT_FAILED");
  }
}
