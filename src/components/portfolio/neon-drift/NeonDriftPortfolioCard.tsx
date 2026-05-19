"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { NeonDriftArt } from "@/components/portfolio/neon-drift/NeonDriftArt";
import type { ProjectMeta } from "@/types";

type NeonDriftPortfolioCardProps = {
  project: ProjectMeta;
};

export function NeonDriftPortfolioCard({ project }: NeonDriftPortfolioCardProps) {
  const t = useTranslations("projects.items.neon-drift");
  const tPortfolio = useTranslations("portfolio");

  return (
    <article className="neon-drift-card group relative overflow-hidden rounded-2xl border border-primary/20 bg-[#0a0b0f] shadow-sm transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_12px_40px_-12px_rgba(59,158,255,0.25)]">
      <span className="absolute right-3 top-3 z-10 rounded-full border border-sky-400/25 bg-black/50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-sky-300/90">
        {t("badge")}
      </span>
      <div className="relative aspect-[4/3] overflow-hidden">
        <NeonDriftArt variant="card" />
      </div>
      <div className="relative border-t border-primary/10 p-5">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-sky-400/70">
          {project.subtitle}
        </p>
        <h3 className="mt-1 font-display text-lg font-semibold text-white">{project.title}</h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-white/55">{t("teaser")}</p>
        <Link
          href={`/portfolio/${project.slug}`}
          className="mt-4 inline-flex items-center text-sm font-semibold text-sky-300 transition hover:text-sky-200"
        >
          {t("cardCta")}
          <span className="ml-1 transition group-hover:translate-x-0.5" aria-hidden>
            →
          </span>
        </Link>
        <p className="mt-3 text-[10px] text-white/30">
          {tPortfolio("neonDriftHint")}
        </p>
      </div>
    </article>
  );
}
