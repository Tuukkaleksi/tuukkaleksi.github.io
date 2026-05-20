"use client";

import { Eye, EyeOff } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useId, useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import { PasswordStrength } from "@/components/arcade/auth/PasswordStrength";
import { PilotAuthField } from "@/components/arcade/auth/PilotAuthField";
import { PilotAuthLayout } from "@/components/arcade/auth/PilotAuthLayout";
import { PilotAuthSubmit } from "@/components/arcade/auth/PilotAuthSubmit";
import { mapAuthError } from "@/components/arcade/auth/auth-errors";
import { pilotRegisterSchema } from "@/lib/auth/schema";

type FormStatus = "idle" | "submitting" | "success" | "error";

export function PilotRegisterForm({ turnstileSiteKey }: { turnstileSiteKey?: string }) {
  const t = useTranslations("arcade.auth.register");
  const tErrors = useTranslations("arcade.auth.errors");
  const locale = useLocale();
  const turnstileRef = useRef<HTMLDivElement>(null);
  const turnstileWidgetId = useRef<string | null>(null);

  const [callsign, setCallsign] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [status, setStatus] = useState<FormStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const formId = useId();

  const turnstileEnabled = Boolean(turnstileSiteKey);

  useEffect(() => {
    if (!turnstileSiteKey || !turnstileRef.current) return;

    const renderWidget = () => {
      const ts = window.turnstile;
      if (!ts || !turnstileRef.current || turnstileWidgetId.current) return;
      turnstileWidgetId.current = ts.render(turnstileRef.current, {
        sitekey: turnstileSiteKey,
        theme: "dark",
        callback: (token: string) => setTurnstileToken(token),
        "expired-callback": () => setTurnstileToken(null),
        "error-callback": () => setTurnstileToken(null),
      });
    };

    if (window.turnstile) {
      renderWidget();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.onload = renderWidget;
    document.head.appendChild(script);

    return () => {
      script.onload = null;
      script.remove();
      if (turnstileWidgetId.current && window.turnstile) {
        window.turnstile.remove(turnstileWidgetId.current);
        turnstileWidgetId.current = null;
      }
    };
  }, [turnstileSiteKey]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "submitting") return;

    const parsed = pilotRegisterSchema.safeParse({
      callsign,
      email,
      password,
      confirmPassword,
      turnstileToken: turnstileToken ?? undefined,
    });

    if (!parsed.success) {
      setError(mapAuthError(tErrors, parsed.error.issues[0]?.message));
      setStatus("error");
      return;
    }

    if (turnstileEnabled && !turnstileToken) {
      setError(mapAuthError(tErrors, "TURNSTILE_REQUIRED"));
      setStatus("error");
      return;
    }

    setStatus("submitting");
    setError(null);

    try {
      const res = await fetch("/api/neon-drift/pilot/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...parsed.data,
          locale,
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };

      if (!res.ok || !data.ok) {
        setError(mapAuthError(tErrors, data.error ?? "SIGN_UP_FAILED"));
        setStatus("error");
        return;
      }

      setStatus("success");
    } catch {
      setError(mapAuthError(tErrors, "SIGN_UP_FAILED"));
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <PilotAuthLayout
        eyebrow={t("heroEyebrow")}
        title={t("heroTitle")}
        subtitle={t("heroSubtitle")}
        features={[t("feature1"), t("feature2"), t("feature3")]}
      >
        <div className="space-y-4 text-center sm:text-left">
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-emerald-400/80">
            {t("successEyebrow")}
          </p>
          <h2 className="font-display text-2xl font-bold text-white">{t("successTitle")}</h2>
          <p className="text-sm leading-relaxed text-white/45">{t("successBody", { email })}</p>
          <Link
            href="/neon-drift/signin"
            className="inline-flex rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-white/80 transition hover:bg-white/[0.08]"
          >
            {t("successCta")}
          </Link>
        </div>
      </PilotAuthLayout>
    );
  }

  return (
    <PilotAuthLayout
      eyebrow={t("heroEyebrow")}
      title={t("heroTitle")}
      subtitle={t("heroSubtitle")}
      features={[t("feature1"), t("feature2"), t("feature3")]}
    >
      <form id={formId} onSubmit={onSubmit} className="space-y-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-sky-400/70">
            {t("eyebrow")}
          </p>
          <h2 className="mt-2 font-display text-2xl font-bold text-white">{t("title")}</h2>
          <p className="mt-2 text-sm text-white/45">{t("subtitle")}</p>
        </div>

        <PilotAuthField
          label={t("callsign")}
          name="callsign"
          autoComplete="username"
          value={callsign}
          onChange={setCallsign}
          hint={t("callsignHint")}
          disabled={status === "submitting"}
        />
        <PilotAuthField
          label={t("email")}
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={setEmail}
          disabled={status === "submitting"}
        />
        <PilotAuthField
          label={t("password")}
          name="password"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          value={password}
          onChange={setPassword}
          disabled={status === "submitting"}
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
          disabled={status === "submitting"}
        />

        {turnstileEnabled ? <div ref={turnstileRef} className="flex justify-center sm:justify-start" /> : null}

        {error ? (
          <p role="alert" className="rounded-lg border border-rose-400/25 bg-rose-400/10 px-3 py-2 text-xs text-rose-200">
            {error}
          </p>
        ) : null}

        <p className="text-xs text-white/35">{t("terms")}</p>

        <PilotAuthSubmit label={t("submit")} loading={status === "submitting"} />

        <p className="text-center text-xs text-white/40">
          {t("hasAccount")}{" "}
          <Link href="/neon-drift/signin" className="font-medium text-sky-300/90 hover:text-sky-200">
            {t("signInLink")}
          </Link>
        </p>
      </form>
    </PilotAuthLayout>
  );
}
