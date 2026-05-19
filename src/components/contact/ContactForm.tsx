"use client";

import { CheckCircle2, Loader2, Mail, MessageSquare, Send, User } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useId, useRef, useState } from "react";

type ContactFormProps = {
  formToken: string | null;
  turnstileSiteKey?: string;
};

type FormStatus = "idle" | "submitting" | "success" | "error";

const MESSAGE_MIN = 20;
const MESSAGE_MAX = 2000;

export function ContactForm({ formToken, turnstileSiteKey }: ContactFormProps) {
  const t = useTranslations("contact.form");
  const locale = useLocale();
  const startedAtRef = useRef(Date.now());
  const turnstileRef = useRef<HTMLDivElement>(null);
  const turnstileWidgetId = useRef<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [messageLen, setMessageLen] = useState(0);
  const formId = useId();

  const configured = Boolean(formToken);

  useEffect(() => {
    if (!turnstileSiteKey || !turnstileRef.current) return;

    const renderWidget = () => {
      const ts = window.turnstile;
      if (!ts || !turnstileRef.current || turnstileWidgetId.current) return;
      turnstileWidgetId.current = ts.render(turnstileRef.current, {
        sitekey: turnstileSiteKey,
        theme: "auto",
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
      if (turnstileWidgetId.current && window.turnstile) {
        window.turnstile.remove(turnstileWidgetId.current);
        turnstileWidgetId.current = null;
      }
    };
  }, [turnstileSiteKey]);

  const resetTurnstile = useCallback(() => {
    if (turnstileWidgetId.current && window.turnstile) {
      window.turnstile.reset(turnstileWidgetId.current);
      setTurnstileToken(null);
    }
  }, []);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!configured || status === "submitting") return;

    if (turnstileSiteKey && !turnstileToken) {
      setErrorCode("TURNSTILE_REQUIRED");
      setStatus("error");
      return;
    }

    const form = e.currentTarget;
    const fd = new FormData(form);
    const message = String(fd.get("message") ?? "").trim();

    if (message.length < MESSAGE_MIN) {
      setErrorCode("MESSAGE_TOO_SHORT");
      setStatus("error");
      return;
    }

    setStatus("submitting");
    setErrorCode(null);

    const payload = {
      name: String(fd.get("name") ?? ""),
      email: String(fd.get("email") ?? ""),
      subject: String(fd.get("subject") ?? ""),
      message,
      company: String(fd.get("company") ?? ""),
      formToken,
      startedAt: startedAtRef.current,
      locale,
      turnstileToken: turnstileToken ?? undefined,
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };

      if (!res.ok || !data.ok) {
        setErrorCode(data.error ?? "UNKNOWN");
        setStatus("error");
        resetTurnstile();
        return;
      }

      setStatus("success");
      form.reset();
      setMessageLen(0);
      startedAtRef.current = Date.now();
      resetTurnstile();
    } catch {
      setErrorCode("NETWORK");
      setStatus("error");
      resetTurnstile();
    }
  };

  if (!configured) {
    return (
      <div className="rounded-xl border border-dashed border-amber-500/40 bg-amber-500/5 px-4 py-3 text-sm text-secondary">
        {t("notConfigured")}
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="h-8 w-8" aria-hidden />
        </div>
        <h3 className="mt-5 font-display text-xl font-semibold text-foreground">{t("successTitle")}</h3>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-secondary">{t("successBody")}</p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-6 text-sm font-semibold text-primary hover:text-primary-hover"
        >
          {t("sendAnother")}
        </button>
      </div>
    );
  }

  const inputClass =
    "peer w-full rounded-xl border border-border bg-background/80 px-4 pb-2.5 pt-6 text-sm text-foreground outline-none transition placeholder:text-transparent focus:border-primary focus:ring-2 focus:ring-primary/20";

  const labelClass =
    "pointer-events-none absolute left-4 top-4 z-10 origin-[0] -translate-y-3 scale-75 text-xs font-medium text-secondary transition-all peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-3 peer-focus:scale-75 peer-focus:text-primary";

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <p className="text-sm leading-relaxed text-secondary">{t("intro")}</p>

      {status === "error" && errorCode && (
        <div
          role="alert"
          className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300"
        >
          {t(`errors.${errorCode}`, { default: t("errors.UNKNOWN") })}
        </div>
      )}

      {/* Honeypot — hidden from users */}
      <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden>
        <label htmlFor={`${formId}-company`}>Company</label>
        <input
          id={`${formId}-company`}
          name="company"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="relative">
          <User
            className="pointer-events-none absolute right-4 top-4 z-10 h-4 w-4 text-secondary/60"
            aria-hidden
          />
          <input
            id={`${formId}-name`}
            name="name"
            type="text"
            required
            autoComplete="name"
            placeholder=" "
            className={inputClass}
          />
          <label htmlFor={`${formId}-name`} className={labelClass}>
            {t("name")}
          </label>
        </div>
        <div className="relative">
          <Mail
            className="pointer-events-none absolute right-4 top-4 z-10 h-4 w-4 text-secondary/60"
            aria-hidden
          />
          <input
            id={`${formId}-email`}
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder=" "
            className={inputClass}
          />
          <label htmlFor={`${formId}-email`} className={labelClass}>
            {t("email")}
          </label>
        </div>
      </div>

      <div className="relative">
        <MessageSquare
          className="pointer-events-none absolute right-4 top-4 z-10 h-4 w-4 text-secondary/60"
          aria-hidden
        />
        <input
          id={`${formId}-subject`}
          name="subject"
          type="text"
          required
          placeholder=" "
          className={inputClass}
        />
        <label htmlFor={`${formId}-subject`} className={labelClass}>
          {t("subject")}
        </label>
      </div>

      <div className="relative">
        <textarea
          id={`${formId}-message`}
          name="message"
          required
          rows={5}
          minLength={MESSAGE_MIN}
          maxLength={MESSAGE_MAX}
          placeholder=" "
          className={`${inputClass} resize-y min-h-[140px] ${messageLen > 0 && messageLen < MESSAGE_MIN ? "border-amber-500/60 focus:border-amber-500 focus:ring-amber-500/20" : ""}`}
          onChange={(e) => setMessageLen(e.target.value.length)}
          aria-invalid={messageLen > 0 && messageLen < MESSAGE_MIN}
          aria-describedby={`${formId}-message-hint`}
        />
        <label htmlFor={`${formId}-message`} className={labelClass}>
          {t("message")}
        </label>
        <p
          id={`${formId}-message-hint`}
          className={`mt-1 flex justify-between gap-2 text-[11px] ${messageLen > 0 && messageLen < MESSAGE_MIN ? "text-amber-600 dark:text-amber-400" : "text-secondary/70"}`}
          aria-live="polite"
        >
          <span>{t("messageMinHint")}</span>
          <span>
            {messageLen}/{MESSAGE_MAX}
          </span>
        </p>
      </div>

      {turnstileSiteKey && (
        <div className="flex justify-center">
          <div ref={turnstileRef} />
        </div>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="group flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-white shadow-md shadow-primary/25 transition hover:bg-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-70"
      >
        {status === "submitting" ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            {t("sending")}
          </>
        ) : (
          <>
            <Send className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden />
            {t("submit")}
          </>
        )}
      </button>

      <p className="text-center text-[11px] leading-relaxed text-secondary/80">{t("privacy")}</p>
    </form>
  );
}

declare global {
  interface Window {
    turnstile?: {
      render: (
        el: HTMLElement,
        opts: Record<string, unknown>,
      ) => string;
      reset: (id: string) => void;
      remove: (id: string) => void;
    };
  }
}
