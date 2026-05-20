"use client";

import { Eye, EyeOff } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { PasswordStrength } from "@/components/arcade/auth/PasswordStrength";
import { PilotAuthField } from "@/components/arcade/auth/PilotAuthField";
import { PilotAuthLayout } from "@/components/arcade/auth/PilotAuthLayout";
import { PilotAuthSubmit } from "@/components/arcade/auth/PilotAuthSubmit";
import { mapAuthError } from "@/components/arcade/auth/auth-errors";
import { resetPassword } from "@/lib/auth/client";
import { pilotResetPasswordSchema } from "@/lib/auth/schema";

export function PilotResetPasswordForm() {
  const t = useTranslations("arcade.auth.reset");
  const tErrors = useTranslations("arcade.auth.errors");
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const invalidToken = !token || searchParams.get("error") === "INVALID_TOKEN";

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = pilotResetPasswordSchema.safeParse({ token, password, confirmPassword });
    if (!parsed.success) {
      setError(mapAuthError(tErrors, parsed.error.issues[0]?.message));
      return;
    }

    setLoading(true);
    setError(null);

    const result = await resetPassword({
      newPassword: parsed.data.password,
      token: parsed.data.token,
    });

    setLoading(false);

    if (result.error) {
      setError(mapAuthError(tErrors, "TOKEN_INVALID"));
      return;
    }

    setDone(true);
    setTimeout(() => router.push("/neon-drift/signin"), 2000);
  };

  return (
    <PilotAuthLayout
      eyebrow={t("heroEyebrow")}
      title={t("heroTitle")}
      subtitle={t("heroSubtitle")}
      features={[t("feature1")]}
    >
      {invalidToken ? (
        <div className="space-y-4">
          <h2 className="font-display text-2xl font-bold text-white">{t("invalidTitle")}</h2>
          <p className="text-sm text-white/45">{t("invalidBody")}</p>
          <Link href="/neon-drift/forgot-password" className="text-sm font-medium text-sky-300/90 hover:text-sky-200">
            {t("requestAgain")}
          </Link>
        </div>
      ) : done ? (
        <div className="space-y-4">
          <h2 className="font-display text-2xl font-bold text-white">{t("doneTitle")}</h2>
          <p className="text-sm text-white/45">{t("doneBody")}</p>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-sky-400/70">
              {t("eyebrow")}
            </p>
            <h2 className="mt-2 font-display text-2xl font-bold text-white">{t("title")}</h2>
            <p className="mt-2 text-sm text-white/45">{t("subtitle")}</p>
          </div>
          <PilotAuthField
            label={t("password")}
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            value={password}
            onChange={setPassword}
            disabled={loading}
            endAdornment={
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="rounded-lg p-2 text-white/40 transition hover:text-white/80"
                aria-label={showPassword ? t("hidePassword") : t("showPassword")}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
          />
          <PasswordStrength password={password} />
          <PilotAuthField
            label={t("confirmPassword")}
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            disabled={loading}
          />
          {error ? (
            <p role="alert" className="rounded-lg border border-rose-400/25 bg-rose-400/10 px-3 py-2 text-xs text-rose-200">
              {error}
            </p>
          ) : null}
          <PilotAuthSubmit label={t("submit")} loading={loading} />
        </form>
      )}
    </PilotAuthLayout>
  );
}
