"use client";

import { useTranslations } from "next-intl";
import { scorePasswordStrength } from "@/lib/auth/schema";

type PasswordStrengthProps = {
  password: string;
};

const SEGMENT_COLORS = [
  "bg-white/10",
  "bg-rose-400/80",
  "bg-amber-400/80",
  "bg-sky-400/80",
  "bg-emerald-400/80",
] as const;

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const t = useTranslations("arcade.auth.passwordStrength");
  const score = scorePasswordStrength(password);
  const labels = [t("empty"), t("weak"), t("fair"), t("good"), t("strong")] as const;

  if (!password) return null;

  return (
    <div className="space-y-2" aria-live="polite">
      <div className="flex gap-1.5">
        {[1, 2, 3, 4].map((segment) => (
          <div
            key={segment}
            className={`h-1 flex-1 rounded-full transition-colors ${SEGMENT_COLORS[score >= segment ? score : 0]}`}
          />
        ))}
      </div>
      <p className="text-[11px] text-white/40">{labels[score]}</p>
    </div>
  );
}
