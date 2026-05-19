import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { getAllProjectSlugs } from "@/lib/projects";
import { siteConfig } from "@/lib/site";

function localePath(locale: string, path: string): string {
  const prefix = locale === routing.defaultLocale ? "" : `/${locale}`;
  return `${siteConfig.url}${prefix}${path}`;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const slugs = getAllProjectSlugs();
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of routing.locales) {
    entries.push({
      url: localePath(locale, ""),
      changeFrequency: "weekly",
      priority: 1,
      alternates: {
        languages: Object.fromEntries(
          routing.locales.map((loc) => [loc, localePath(loc, "")]),
        ),
      },
    });

    for (const slug of slugs) {
      entries.push({
        url: localePath(locale, `/portfolio/${slug}`),
        changeFrequency: "monthly",
        priority: 0.7,
        alternates: {
          languages: Object.fromEntries(
            routing.locales.map((loc) => [loc, localePath(loc, `/portfolio/${slug}`)]),
          ),
        },
      });
    }
  }

  return entries;
}
