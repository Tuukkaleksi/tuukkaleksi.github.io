import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";

export const DEFAULT_OG_IMAGE = "/images/og-default.png";

function absoluteUrl(path: string) {
  return path.startsWith("http") ? path : `${siteConfig.url}${path}`;
}

export function buildSocialMetadata({
  title,
  description,
  images = [DEFAULT_OG_IMAGE],
}: {
  title: string;
  description: string;
  images?: string[];
}): Pick<Metadata, "openGraph" | "twitter"> {
  const ogImages = images.map((url) => ({ url: absoluteUrl(url) }));

  return {
    openGraph: {
      title,
      description,
      images: ogImages,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImages.map((img) => img.url),
    },
  };
}
