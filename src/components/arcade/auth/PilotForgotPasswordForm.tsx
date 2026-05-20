"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { PilotAuthField } from "@/components/arcade/auth/PilotAuthField";
import { PilotAuthLayout } from "@/components/arcade/auth/PilotAuthLayout";
import { PilotAuthSubmit } from "@/components/arcade/auth/PilotAuthSubmit";
import { mapAuthError } from "@/components/arcade/auth/auth-errors";
import { getAuthBaseUrl } from "@/lib/auth/urls";
import { requestPasswordReset } from "@/lib/auth/client";
import { pilotForgotPasswordSchema } from "@/lib/auth/schema";

export function PilotForgotPasswordForm() {
  const t = useTranslations("arcade.auth.forgot");
  const tErrors = useTranslations("arcade.auth.errors");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = pilotForgotPasswordSchema.safeParse({ email });
    if (!parsed.success) {
      setError(mapAuthError(tErrors, parsed.error.issues[0]?.message));
      return;
    }

    setLoading(true);
    setError(null);

    const base = typeof window !== "undefined" ? window.location.origin : getAuthBaseUrl();
    const result = await requestPasswordReset({
      email: parsed.data.email,
      redirectTo: `${base}/neon-drift/reset-password`,
    });

    setLoading(false);

    if (result.error) {
      setError(mapAuthError(tErrors, "RESET_FAILED"));
      return;
    }

    setSent(true);
  };

  return (
    <PilotAuthLayout
      eyebrow={t("heroEyebrow")}
      title={t("heroTitle")}
      subtitle={t("heroSubtitle")}
      features={[t("feature1"), t("feature2")]}
    >
      {sent ? (
        <div className="space-y-4">
          <h2 className="font-display text-2xl font-bold text-white">{t("sentTitle")}</h2>
          <p className="text-sm text-white/45">{t("sentBody", { email })}</p>
          <Link
            href="/neon-drift/signin"
            className="inline-flex text-sm font-medium text-sky-300/90 hover:text-sky-200"
          >
            {t("backSignIn")}
          </Link>
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
            label={t("email")}
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={setEmail}
            disabled={loading}
          />
          {error ? (
            <p role="alert" className="rounded-lg border border-rose-400/25 bg-rose-400/10 px-3 py-2 text-xs text-rose-200">
              {error}
            </p>
          ) : null}
          <PilotAuthSubmit label={t("submit")} loading={loading} />
          <p className="text-center text-xs">
            <Link href="/neon-drift/signin" className="text-white/45 hover:text-white/75 hover:underline">
              {t("backSignIn")}
            </Link>
          </p>
        </form>
      )}
    </PilotAuthLayout>
  );
}
