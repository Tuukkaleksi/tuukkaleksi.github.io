import type { MetadataRoute } from "next";
import { getAllProjectSlugs } from "@/content/projects";
import { siteConfig } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url;
  const projectRoutes = getAllProjectSlugs().map((slug) => ({
    url: `${base}/portfolio/${slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [
    { url: base, changeFrequency: "weekly", priority: 1 },
    ...projectRoutes,
  ];
}
