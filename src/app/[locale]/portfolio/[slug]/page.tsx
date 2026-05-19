import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { ProjectGallery } from "@/components/portfolio/ProjectGallery";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { getMessagesForLocale } from "@/i18n/messages";
import type { Locale } from "@/i18n/routing";
import { getAllProjectSlugs, getProjectsFromMessages } from "@/lib/projects";

type PageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    getAllProjectSlugs().map((slug) => ({ locale, slug })),
  );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const messages = getMessagesForLocale(locale as Locale);
  const projects = getProjectsFromMessages(messages);
  const project = projects.find((p) => p.slug === slug);
  const t = await getTranslations({ locale, namespace: "projectPage" });

  if (!project) return { title: t("notFound") };

  return {
    title: project.title,
    description: project.description,
    openGraph: {
      title: project.title,
      description: project.description,
      images: [{ url: project.coverImage }],
    },
  };
}

export default async function ProjectPage({ params }: PageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const messages = getMessagesForLocale(locale as Locale);
  const projects = getProjectsFromMessages(messages);
  const project = projects.find((p) => p.slug === slug);

  if (!project) notFound();

  const t = await getTranslations("projectPage");

  return (
    <>
      <main className="section-padding mx-auto max-w-6xl">
        <Link
          href="/#portfolio"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-hover"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {t("back")}
        </Link>

        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          <ProjectGallery images={project.images} title={project.title} />

          <div className="space-y-8">
            <div>
              <p className="text-sm font-medium uppercase tracking-wide text-primary">
                {project.subtitle}
              </p>
              <h1 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
                {project.title}
              </h1>
            </div>

            <div className="section-card p-6">
              <h2 className="font-display text-lg font-semibold">{t("details")}</h2>
              <dl className="mt-4 space-y-3">
                {project.meta.map((row) => (
                  <div key={row.label} className="border-b border-border pb-3 last:border-0 last:pb-0">
                    <dt className="text-xs font-semibold uppercase tracking-wide text-secondary">
                      {row.label}
                    </dt>
                    <dd className="mt-1 text-sm text-foreground">
                      {row.href ? (
                        <a
                          href={row.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-medium text-primary hover:text-primary-hover"
                        >
                          {row.value}
                          <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                        </a>
                      ) : (
                        row.value
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="section-card p-6">
              <h2 className="font-display text-lg font-semibold">
                {project.descriptionTitle ?? t("description")}
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-secondary sm:text-base">
                {project.description}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          {project.images.slice(0, 4).map((src, i) => (
            <div
              key={src}
              className="relative h-20 w-28 overflow-hidden rounded-lg border border-border bg-surface-muted"
            >
              <Image
                src={src}
                alt=""
                fill
                className="object-cover"
                sizes="112px"
                aria-hidden={i > 0}
              />
            </div>
          ))}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
