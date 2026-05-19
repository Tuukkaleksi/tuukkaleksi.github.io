"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { projects } from "@/content/projects";
import type { ProjectCategory } from "@/types";

const filters: { id: "all" | ProjectCategory; label: string }[] = [
  { id: "all", label: "Kaikki" },
  { id: "projects", label: "Projektit" },
  { id: "react", label: "React" },
];

export function Portfolio() {
  const [activeFilter, setActiveFilter] = useState<"all" | ProjectCategory>("all");

  const filtered = useMemo(() => {
    if (activeFilter === "all") return projects;
    return projects.filter((p) => p.category === activeFilter);
  }, [activeFilter]);

  return (
    <section id="portfolio" className="section-padding scroll-mt-20 bg-surface-muted/50">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          title="Portfolio"
          description="Valitse kategoria tai avaa projektin sivu nähdäksesi lisätiedot ja kuvat."
        />
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
                    Lue lisää
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
