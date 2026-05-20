import type { useTranslations } from "next-intl";

type AuthT = ReturnType<typeof useTranslations<"arcade.auth.errors">>;

export function mapAuthError(t: AuthT, code: string | null | undefined): string {
  if (!code) return t("UNKNOWN");
  const known = [
    "AUTH_DISABLED",
    "RATE_LIMIT",
    "VALIDATION",
    "TURNSTILE_REQUIRED",
    "EMAIL_INVALID",
    "EMAIL_TAKEN",
    "CALLSIGN_TAKEN",
    "CALLSIGN_INVALID",
    "CALLSIGN_TOO_SHORT",
    "CALLSIGN_TOO_LONG",
    "PASSWORD_TOO_SHORT",
    "PASSWORD_MISMATCH",
    "PASSWORD_REQUIRED",
    "INVALID_CREDENTIALS",
    "EMAIL_NOT_VERIFIED",
    "SIGN_UP_FAILED",
    "SIGN_IN_FAILED",
    "RESET_FAILED",
    "TOKEN_INVALID",
    "SEND_FAILED",
  ] as const;

  if (known.includes(code as (typeof known)[number])) {
    return t(code as (typeof known)[number]);
  }
  return t("UNKNOWN");
}
