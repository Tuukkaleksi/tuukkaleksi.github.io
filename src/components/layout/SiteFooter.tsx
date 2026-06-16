import { getTranslations } from "next-intl/server";
import { SocialLinks } from "@/components/ui/SocialLinks";
import { socialLinks } from "@/content/social-links";

export async function SiteFooter() {
  const t = await getTranslations("footer");
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-surface">
      <div className="section-padding mx-auto flex max-w-6xl flex-col items-center gap-6 text-center">
        <SocialLinks links={socialLinks} />
        <p className="text-sm text-secondary">
          &copy; {year}{" "}
          <a
            href="https://github.com/Tuukkaleksi"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-foreground hover:text-primary"
          >
            {t("handle")}
          </a>
          . {t("rights")}
        </p>
      </div>
    </footer>
  );
}
