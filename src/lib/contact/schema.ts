import { z } from "zod";

const MAX_URLS = 3;

export const SCRIPT_PATTERN =
  /<script|<\/script>|javascript:|onerror\s*=|onload\s*=|<iframe|data:text\/html/i;

export function containsScriptPattern(value: string) {
  return SCRIPT_PATTERN.test(value);
}

function noScriptContent(value: string) {
  return !containsScriptPattern(value);
}

const scriptSafeString = (min: number, max: number, minCode: string, maxCode: string) =>
  z
    .string()
    .trim()
    .min(min, minCode)
    .max(max, maxCode)
    .refine(noScriptContent, "SCRIPT_NOT_ALLOWED");

export const contactBodySchema = z.object({
  name: scriptSafeString(2, 80, "NAME_TOO_SHORT", "NAME_TOO_LONG"),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("EMAIL_INVALID")
    .max(254, "EMAIL_TOO_LONG"),
  subject: scriptSafeString(2, 120, "SUBJECT_TOO_SHORT", "SUBJECT_TOO_LONG"),
  message: scriptSafeString(20, 2000, "MESSAGE_TOO_SHORT", "MESSAGE_TOO_LONG"),
  formToken: z.string().min(10, "TOKEN_INVALID"),
  startedAt: z.number().int().positive("TIMING_INVALID"),
  locale: z.enum(["en", "fi"]).optional(),
  /** Honeypot — must stay empty (bots often fill this) */
  company: z.string().optional(),
  /** Cloudflare Turnstile (optional when keys configured) */
  turnstileToken: z.string().optional(),
});

export type ContactBody = z.infer<typeof contactBodySchema>;

export function countUrls(text: string) {
  const matches = text.match(/https?:\/\/|www\./gi);
  return matches?.length ?? 0;
}

export function looksLikeSpam(text: string) {
  const lower = text.toLowerCase();
  const spamPatterns = [
    /\b(viagra|cialis|casino|crypto airdrop|seo services|guest post)\b/i,
    /\b(click here|act now|limited offer)\b.*\b(http|www\.)/i,
  ];
  return spamPatterns.some((p) => p.test(lower)) || countUrls(text) > MAX_URLS;
}
