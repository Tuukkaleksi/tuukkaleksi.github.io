import { z } from "zod";

const MAX_URLS = 3;

export const contactBodySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "NAME_TOO_SHORT")
    .max(80, "NAME_TOO_LONG"),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("EMAIL_INVALID")
    .max(254, "EMAIL_TOO_LONG"),
  subject: z
    .string()
    .trim()
    .min(2, "SUBJECT_TOO_SHORT")
    .max(120, "SUBJECT_TOO_LONG"),
  message: z
    .string()
    .trim()
    .min(20, "MESSAGE_TOO_SHORT")
    .max(2000, "MESSAGE_TOO_LONG"),
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
