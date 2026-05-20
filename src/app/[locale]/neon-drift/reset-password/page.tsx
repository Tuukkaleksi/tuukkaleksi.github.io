import { setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { ArcadeShell } from "@/components/arcade/ArcadeShell";
import { PilotAuthDisabled } from "@/components/arcade/auth/PilotAuthDisabled";
import { PilotResetPasswordForm } from "@/components/arcade/auth/PilotResetPasswordForm";
import { isAuthConfigured } from "@/lib/auth";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function NeonDriftResetPasswordPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  if (!isAuthConfigured()) {
    return (
      <ArcadeShell>
        <PilotAuthDisabled />
      </ArcadeShell>
    );
  }

  return (
    <ArcadeShell>
      <Suspense fallback={<div className="px-6 py-16 text-center text-sm text-white/40">…</div>}>
        <PilotResetPasswordForm />
      </Suspense>
    </ArcadeShell>
  );
}
