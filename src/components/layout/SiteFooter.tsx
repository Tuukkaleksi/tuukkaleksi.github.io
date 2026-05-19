import Link from "next/link";
import { SocialLinks } from "@/components/ui/SocialLinks";
import { socialLinks } from "@/content/site-data";
import { siteConfig } from "@/lib/site";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-surface">
      <div className="section-padding mx-auto flex max-w-6xl flex-col items-center gap-6 text-center">
        <SocialLinks links={socialLinks} />
        <p className="text-sm text-secondary">
          &copy; {year}{" "}
          <Link
            href="https://github.com/Tuukkaleksi/tuukkaleksi.github.io"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-foreground hover:text-primary"
          >
            {siteConfig.name}
          </Link>
          . Kaikki oikeudet pidätetään.
        </p>
      </div>
    </footer>
  );
}
