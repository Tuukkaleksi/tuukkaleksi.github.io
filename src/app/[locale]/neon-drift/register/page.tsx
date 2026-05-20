import { setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { ArcadeShell } from "@/components/arcade/ArcadeShell";
import { PilotAuthDisabled } from "@/components/arcade/auth/PilotAuthDisabled";
import { PilotRegisterForm } from "@/components/arcade/auth/PilotRegisterForm";
import { isAuthConfigured } from "@/lib/auth";
import { getPilotSession } from "@/lib/auth/session";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function NeonDriftRegisterPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  if (!isAuthConfigured()) {
    return (
      <ArcadeShell>
        <PilotAuthDisabled />
      </ArcadeShell>
    );
  }

  const session = await getPilotSession();
  if (session) {
    redirect("/neon-drift/shop");
  }

  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  return (
    <ArcadeShell>
      <Suspense fallback={<div className="px-6 py-16 text-center text-sm text-white/40">…</div>}>
        <PilotRegisterForm turnstileSiteKey={turnstileSiteKey} />
      </Suspense>
    </ArcadeShell>
  );
}
