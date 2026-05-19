import { MapPin, MessageSquareOff } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SocialLinks } from "@/components/ui/SocialLinks";
import { socialLinks } from "@/content/social-links";

export async function Contact() {
  const t = await getTranslations("contact");
  const tSite = await getTranslations("site");

  return (
    <section id="contact" className="section-padding scroll-mt-20">
      <div className="mx-auto max-w-6xl">
        <SectionHeading title={t("title")} />
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="section-card p-6 sm:p-8">
            <h3 className="font-display text-lg font-semibold">{t("detailsTitle")}</h3>
            <ul className="mt-6 space-y-5">
              <li className="flex gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <MapPin className="h-5 w-5" aria-hidden />
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">{t("locationLabel")}</p>
                  <p className="mt-1 text-sm text-secondary">{tSite("location")}</p>
                </div>
              </li>
            </ul>
            <p className="mt-8 text-sm text-secondary">{t("socialHint")}</p>
            <SocialLinks links={socialLinks} className="mt-6" />
          </div>

          <div className="section-card flex flex-col justify-center p-6 sm:p-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-muted text-secondary">
              <MessageSquareOff className="h-6 w-6" aria-hidden />
            </div>
            <h3 className="mt-4 font-display text-lg font-semibold">{t("formTitle")}</h3>
            <p className="mt-3 text-sm leading-relaxed text-secondary">{t("formDisabled")}</p>
            <p className="mt-4 rounded-lg border border-dashed border-border bg-surface-muted/60 px-4 py-3 text-xs text-secondary">
              {t("formStatus")}{" "}
              <span className="font-semibold text-foreground">{t("formStatusValue")}</span>{" "}
              {t("formStatusHint")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
