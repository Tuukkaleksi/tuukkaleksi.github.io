import { z } from "zod";

const CALLSIGN_REGEX = /^[A-Za-z0-9_]{3,16}$/;

export const callsignSchema = z
  .string()
  .trim()
  .min(3, "CALLSIGN_TOO_SHORT")
  .max(16, "CALLSIGN_TOO_LONG")
  .regex(CALLSIGN_REGEX, "CALLSIGN_INVALID");

export const pilotRegisterSchema = z
  .object({
    callsign: callsignSchema,
    email: z.string().trim().toLowerCase().email("EMAIL_INVALID").max(254, "EMAIL_TOO_LONG"),
    password: z.string().min(10, "PASSWORD_TOO_SHORT").max(128, "PASSWORD_TOO_LONG"),
    confirmPassword: z.string().min(10, "PASSWORD_TOO_SHORT").max(128, "PASSWORD_TOO_LONG"),
    turnstileToken: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "PASSWORD_MISMATCH",
    path: ["confirmPassword"],
  });

export const pilotSignInSchema = z.object({
  email: z.string().trim().toLowerCase().email("EMAIL_INVALID"),
  password: z.string().min(1, "PASSWORD_REQUIRED"),
  rememberMe: z.boolean().optional(),
});

export const pilotForgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email("EMAIL_INVALID"),
});

export const pilotResetPasswordSchema = z
  .object({
    token: z.string().min(1, "TOKEN_INVALID"),
    password: z.string().min(10, "PASSWORD_TOO_SHORT").max(128, "PASSWORD_TOO_LONG"),
    confirmPassword: z.string().min(10, "PASSWORD_TOO_SHORT").max(128, "PASSWORD_TOO_LONG"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "PASSWORD_MISMATCH",
    path: ["confirmPassword"],
  });

export type PilotRegisterInput = z.infer<typeof pilotRegisterSchema>;
export type PilotSignInInput = z.infer<typeof pilotSignInSchema>;

export function scorePasswordStrength(password: string): 0 | 1 | 2 | 3 | 4 {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 10) score += 1;
  if (password.length >= 14) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  if (score <= 1) return 1;
  if (score === 2) return 2;
  if (score === 3) return 3;
  return 4;
}
