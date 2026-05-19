import { z } from "zod";

export const MIN_SUBMIT_SCORE = 500;

const initialsSchema = z
  .string()
  .trim()
  .transform((s) => s.toUpperCase())
  .pipe(z.string().regex(/^[A-Z0-9]{2,4}$/, { message: "INITIALS_INVALID" }));

export const scoreSubmitSchema = z.object({
  initials: initialsSchema,
  score: z.number().int().min(MIN_SUBMIT_SCORE).max(9_999_999),
  wave: z.number().int().min(1).max(999),
  round: z.number().int().min(1).max(999),
  timeSurvivedSec: z.number().int().min(0).max(60 * 60),
  kills: z.number().int().min(0).max(99_999),
  bestCombo: z.number().int().min(0).max(999),
  bossesDefeated: z.number().int().min(0).max(99),
  runToken: z.string().min(10),
  startedAt: z.number().int().positive(),
});

export type ScoreSubmitBody = z.infer<typeof scoreSubmitSchema>;
