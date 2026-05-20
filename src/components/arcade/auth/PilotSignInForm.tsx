"use client";

import { Eye, EyeOff } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { PilotAuthField } from "@/components/arcade/auth/PilotAuthField";
import { PilotAuthLayout } from "@/components/arcade/auth/PilotAuthLayout";
import { PilotAuthSubmit } from "@/components/arcade/auth/PilotAuthSubmit";
import { mapAuthError } from "@/components/arcade/auth/auth-errors";
import { signIn } from "@/lib/auth/client";

export function PilotSignInForm() {
  const t = useTranslations("arcade.auth.signIn");
  const tErrors = useTranslations("arcade.auth.errors");
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/neon-drift/shop";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await signIn.email({
      email: email.trim().toLowerCase(),
      password,
      rememberMe,
      callbackURL: next,
    });

    setLoading(false);

    if (result.error) {
      const code =
        result.error.status === 403
          ? "EMAIL_NOT_VERIFIED"
          : result.error.message?.toUpperCase().includes("CREDENTIAL")
            ? "INVALID_CREDENTIALS"
            : "SIGN_IN_FAILED";
      setError(mapAuthError(tErrors, code));
      return;
    }

    router.push(next);
    router.refresh();
  };

  return (
    <PilotAuthLayout
      eyebrow={t("heroEyebrow")}
      title={t("heroTitle")}
      subtitle={t("heroSubtitle")}
      features={[t("feature1"), t("feature2"), t("feature3")]}
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-sky-400/70">
            {t("eyebrow")}
          </p>
          <h2 className="mt-2 font-display text-2xl font-bold text-white">{t("title")}</h2>
          <p className="mt-2 text-sm text-white/45">{t("subtitle")}</p>
        </div>

        <PilotAuthField
          label={t("email")}
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={setEmail}
          disabled={loading}
        />
        <PilotAuthField
          label={t("password")}
          name="password"
          type={showPassword ? "text" : "password"}
          autoComplete="current-password"
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

        <label className="flex items-center gap-2 text-xs text-white/50">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="rounded border-white/20 bg-white/5 text-sky-500 focus:ring-sky-400/30"
          />
          {t("rememberMe")}
        </label>

        {error ? (
          <p role="alert" className="rounded-lg border border-rose-400/25 bg-rose-400/10 px-3 py-2 text-xs text-rose-200">
            {error}
          </p>
        ) : null}

        <PilotAuthSubmit label={t("submit")} loading={loading} />

        <p className="text-center text-xs text-white/40">
          {t("noAccount")}{" "}
          <Link href="/neon-drift/register" className="font-medium text-sky-300/90 hover:text-sky-200">
            {t("registerLink")}
          </Link>
        </p>
        <p className="text-center text-xs">
          <Link
            href="/neon-drift/forgot-password"
            className="text-white/45 underline-offset-2 transition hover:text-white/75 hover:underline"
          >
            {t("forgotLink")}
          </Link>
        </p>
      </form>
    </PilotAuthLayout>
  );
}
