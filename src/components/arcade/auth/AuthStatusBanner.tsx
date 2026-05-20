"use client";

import { MailWarning } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

type AuthStatusBannerProps = {
  email?: string | null;
  onResend?: () => void;
  resendLoading?: boolean;
};

export function AuthStatusBanner({ email, onResend, resendLoading }: AuthStatusBannerProps) {
  const t = useTranslations("arcade.auth.banner");

  return (
    <div
      role="status"
      className="flex flex-col gap-3 rounded-xl border border-amber-400/25 bg-amber-400/[0.06] px-4 py-3 text-sm text-amber-100/90 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-start gap-2">
        <MailWarning className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" aria-hidden />
        <p>
          {t("unverified")}
          {email ? (
            <span className="mt-1 block text-xs text-amber-100/60">{email}</span>
          ) : null}
        </p>
      </div>
      <div className="flex shrink-0 gap-2">
        {onResend ? (
          <button
            type="button"
            onClick={onResend}
            disabled={resendLoading}
            className="rounded-lg border border-amber-300/30 px-3 py-1.5 text-xs font-medium text-amber-50 transition hover:bg-amber-400/10 disabled:opacity-50"
          >
            {resendLoading ? t("resending") : t("resend")}
          </button>
        ) : null}
        <Link
          href="/neon-drift/verify-email"
          className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-white/80 transition hover:bg-white/[0.06]"
        >
          {t("verifyLink")}
        </Link>
      </div>
    </div>
  );
}
