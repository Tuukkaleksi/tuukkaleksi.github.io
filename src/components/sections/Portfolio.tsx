"use client";

import Image from "next/image";
import { useMessages, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Link } from "@/i18n/navigation";
import { getProjectsFromMessages } from "@/lib/projects";
import type { ProjectCategory } from "@/types";

export function Portfolio() {
  const t = useTranslations("portfolio");
  const messages = useMessages() as Parameters<typeof getProjectsFromMessages>[0];
  const projects = useMemo(() => getProjectsFromMessages(messages), [messages]);
  const [activeFilter, setActiveFilter] = useState<"all" | ProjectCategory>("all");

  const filters: { id: "all" | ProjectCategory; label: string }[] = [
    { id: "all", label: t("filters.all") },
    { id: "projects", label: t("filters.projects") },
    { id: "react", label: t("filters.react") },
  ];

  const filtered = useMemo(() => {
    if (activeFilter === "all") return projects;
    return projects.filter((p) => p.category === activeFilter);
  }, [activeFilter, projects]);

  return (
    <section id="portfolio" className="section-padding scroll-mt-20 bg-surface-muted/50">
      <div className="mx-auto max-w-6xl">
        <SectionHeading title={t("title")} description={t("description")} />
        <div className="mb-10 flex flex-wrap justify-center gap-2">
          {filters.map((filter) => (
            <button
              key={filter.id}
              type="button"
              onClick={() => setActiveFilter(filter.id)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                activeFilter === filter.id
                  ? "bg-primary text-white shadow-md shadow-primary/25"
                  : "border border-border bg-surface text-secondary hover:border-primary hover:text-primary"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((project) => (
            <li key={project.slug}>
              <article className="group overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                <div className="relative aspect-[4/3] overflow-hidden bg-surface-muted">
                  <Image
                    src={project.coverImage}
                    alt={project.title}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
                <div className="p-5">
                  <h3 className="font-display text-lg font-semibold text-foreground">
                    {project.title}
                  </h3>
                  <p className="mt-1 text-sm text-secondary">{project.subtitle}</p>
                  <Link
                    href={`/portfolio/${project.slug}`}
                    className="mt-4 inline-flex items-center text-sm font-semibold text-primary hover:text-primary-hover"
                  >
                    {t("readMore")}
                    <span className="ml-1 transition group-hover:translate-x-0.5" aria-hidden>
                      →
                    </span>
                  </Link>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
