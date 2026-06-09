import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { ProjectCaseStudyAnimated } from "@/components/portfolio/ProjectCaseStudyAnimated";
import { ProjectGallery } from "@/components/portfolio/ProjectGallery";
import { ProjectPageMotion } from "@/components/portfolio/ProjectPageMotion";
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
  const tCaseStudy = await getTranslations("projectPage.caseStudy");

  return (
    <>
      <main className="section-padding mx-auto max-w-6xl">
        <ProjectPageMotion
          backLabel={t("back")}
          detailsLabel={t("details")}
          descriptionLabel={t("description")}
          subtitle={project.subtitle}
          title={project.title}
          description={project.description}
          descriptionTitle={project.descriptionTitle}
          meta={project.meta}
          thumbnails={project.images.slice(0, 4)}
        >
          <ProjectGallery images={project.images} title={project.title} />
        </ProjectPageMotion>

        {project.caseStudy ? (
          <ProjectCaseStudyAnimated
            caseStudy={project.caseStudy}
            labels={{
              role: tCaseStudy("role"),
              problem: tCaseStudy("problem"),
              approach: tCaseStudy("approach"),
              outcome: tCaseStudy("outcome"),
              learnings: tCaseStudy("learnings"),
            }}
          />
        ) : null}
      </main>
      <SiteFooter />
    </>
  );
}
