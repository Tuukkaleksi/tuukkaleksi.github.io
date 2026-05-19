"use client";

import { ArrowLeft, Radio } from "lucide-react";
import { useTranslations } from "next-intl";
import { NeonDriftArt } from "@/components/portfolio/neon-drift/NeonDriftArt";
import { Link } from "@/i18n/navigation";
import type { ProjectMeta } from "@/types";

type NeonDriftProjectPageProps = {
  project: ProjectMeta;
};

export function NeonDriftProjectPage({ project }: NeonDriftProjectPageProps) {
  const t = useTranslations("projects.items.neon-drift");
  const tPage = useTranslations("projectPage");

  const features = ["feature0", "feature1", "feature2", "feature3"] as const;

  return (
    <>
      <Link
        href="/#portfolio"
        className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-hover"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        {tPage("back")}
      </Link>

      <div className="overflow-hidden rounded-2xl border border-primary/15 bg-[#0a0b0f]">
        <NeonDriftArt variant="hero" />
        <div className="border-t border-primary/10 px-6 py-8 sm:px-10 sm:py-10">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-400/30 bg-sky-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-300">
              <Radio className="h-3 w-3" aria-hidden />
              {t("badge")}
            </span>
            <span className="text-xs text-white/40">{t("signalId")}</span>
          </div>
          <p className="mt-4 text-sm font-medium uppercase tracking-[0.2em] text-sky-400/80">
            {project.subtitle}
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {project.title}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/60 sm:text-base">
            {t("lede")}
          </p>
        </div>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
            <h2 className="font-display text-lg font-semibold text-foreground">{t("briefingTitle")}</h2>
            <div className="mt-4 space-y-4 text-sm leading-relaxed text-secondary sm:text-base">
              <p>{project.description}</p>
              <p className="text-secondary/90">{t("briefingExtra")}</p>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
            <h2 className="font-display text-lg font-semibold text-foreground">{t("capabilitiesTitle")}</h2>
            <ul className="mt-4 space-y-3">
              {features.map((key) => (
                <li
                  key={key}
                  className="flex gap-3 text-sm text-secondary before:mt-2 before:block before:h-1 before:w-1 before:shrink-0 before:rounded-full before:bg-primary before:content-['']"
                >
                  {t(key)}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="space-y-6">
          <div className="rounded-2xl border border-border bg-surface p-6">
            <h2 className="font-display text-lg font-semibold text-foreground">{tPage("details")}</h2>
            <dl className="mt-4 space-y-3">
              {project.meta.map((row) => (
                <div key={row.label} className="border-b border-border pb-3 last:border-0 last:pb-0">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-secondary">
                    {row.label}
                  </dt>
                  <dd className="mt-1 text-sm text-foreground">{row.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="rounded-2xl border border-primary/20 bg-[#0a0b0f] p-6 text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-sky-400/70">{t("accessLabel")}</p>
            <Link
              href="/neon-drift"
              className="mt-4 inline-block w-full rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-md shadow-primary/30 transition hover:bg-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              {t("launch")}
            </Link>
            <p className="mt-3 text-xs text-white/45">{t("launchHint")}</p>
          </div>
        </aside>
      </div>
    </>
  );
}
