"use client";

import { CheckCircle2, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { PilotAuthLayout } from "@/components/arcade/auth/PilotAuthLayout";
import { mapAuthError } from "@/components/arcade/auth/auth-errors";
import { sendVerificationEmail, useSession } from "@/lib/auth/client";

export function PilotVerifyEmailClient() {
  const t = useTranslations("arcade.auth.verify");
  const tErrors = useTranslations("arcade.auth.errors");
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  const verified = searchParams.get("verified") === "1";
  const errorParam = searchParams.get("error");

  const [resendLoading, setResendLoading] = useState(false);
  const [resendMsg, setResendMsg] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = window.setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => window.clearInterval(id);
  }, [cooldown]);

  const onResend = async () => {
    const email = session?.user?.email;
    if (!email || resendLoading || cooldown > 0) return;
    setResendLoading(true);
    setResendMsg(null);
    const result = await sendVerificationEmail({
      email,
      callbackURL: `${window.location.origin}/neon-drift/verify-email?verified=1`,
    });
    setResendLoading(false);
    if (result.error) {
      setResendMsg(mapAuthError(tErrors, "SEND_FAILED"));
    } else {
      setResendMsg(t("resent"));
      setCooldown(60);
    }
  };

  const emailVerified = session?.user?.emailVerified;

  return (
    <PilotAuthLayout
      eyebrow={t("heroEyebrow")}
      title={t("heroTitle")}
      subtitle={t("heroSubtitle")}
      features={[t("feature1"), t("feature2")]}
    >
      <div className="space-y-5">
        {verified || emailVerified ? (
          <>
            <CheckCircle2 className="h-10 w-10 text-emerald-400" aria-hidden />
            <h2 className="font-display text-2xl font-bold text-white">{t("verifiedTitle")}</h2>
            <p className="text-sm text-white/45">{t("verifiedBody")}</p>
            <Link
              href="/neon-drift/shop"
              className="inline-flex rounded-xl bg-gradient-to-r from-sky-500 to-[#0563bb] px-4 py-2.5 text-sm font-semibold text-white"
            >
              {t("shopCta")}
            </Link>
          </>
        ) : errorParam ? (
          <>
            <h2 className="font-display text-2xl font-bold text-white">{t("errorTitle")}</h2>
            <p className="text-sm text-white/45">{t("errorBody")}</p>
            <button
              type="button"
              onClick={onResend}
              disabled={resendLoading || cooldown > 0 || !session?.user?.email}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm text-white/80 disabled:opacity-50"
            >
              {resendLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {cooldown > 0 ? t("resendCooldown", { seconds: cooldown }) : t("resend")}
            </button>
          </>
        ) : (
          <>
            <h2 className="font-display text-2xl font-bold text-white">{t("pendingTitle")}</h2>
            <p className="text-sm text-white/45">
              {session?.user?.email
                ? t("pendingBody", { email: session.user.email })
                : t("pendingBodyAnonymous")}
            </p>
            <button
              type="button"
              onClick={onResend}
              disabled={resendLoading || cooldown > 0 || !session?.user?.email}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm text-white/80 disabled:opacity-50"
            >
              {resendLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {cooldown > 0 ? t("resendCooldown", { seconds: cooldown }) : t("resend")}
            </button>
            {resendMsg ? <p className="text-xs text-white/50">{resendMsg}</p> : null}
            <Link href="/neon-drift/signin" className="block text-sm text-sky-300/90 hover:text-sky-200">
              {t("signInLink")}
            </Link>
          </>
        )}
      </div>
    </PilotAuthLayout>
  );
}
