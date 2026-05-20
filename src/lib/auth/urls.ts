import { siteConfig } from "@/lib/site";

export function getAuthBaseUrl(): string {
  return (
    process.env.BETTER_AUTH_URL?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    siteConfig.url
  );
}
