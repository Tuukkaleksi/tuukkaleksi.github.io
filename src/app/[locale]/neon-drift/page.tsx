import { setRequestLocale } from "next-intl/server";
import { NeonDriftPlayClient } from "@/app/[locale]/neon-drift/NeonDriftPlayClient";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function NeonDriftPlayPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <NeonDriftPlayClient />;
}
