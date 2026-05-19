import { projectBases, projectMetaLinks } from "@/content/projects-base";
import type { ProjectMeta } from "@/types";

type ProjectTranslation = {
  title: string;
  subtitle: string;
  description: string;
  descriptionTitle?: string;
  meta: { label: string; value: string }[];
};

export function getProjectsFromMessages(
  messages: { projects: { items: Record<string, ProjectTranslation> } },
): ProjectMeta[] {
  return projectBases.map((base) => {
    const translation = messages.projects.items[base.slug];
    const links = projectMetaLinks[base.slug] ?? [];

    const meta = translation.meta.map((row, index) => ({
      label: row.label,
      value: links[index]?.value ?? row.value,
      href: links[index]?.href,
    }));

    return {
      slug: base.slug,
      category: base.category,
      coverImage: base.coverImage,
      images: base.images,
      title: translation.title,
      subtitle: translation.subtitle,
      description: translation.description,
      descriptionTitle: translation.descriptionTitle,
      meta,
    };
  });
}

export function getAllProjectSlugs(): string[] {
  return projectBases.map((p) => p.slug);
}
