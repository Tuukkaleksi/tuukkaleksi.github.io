import { MapPin } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { ContactForm } from "@/components/contact/ContactForm";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SocialLinks } from "@/components/ui/SocialLinks";
import { socialLinks } from "@/content/social-links";
import { createContactFormToken } from "@/lib/contact/token";

export async function Contact() {
  const t = await getTranslations("contact");
  const tSite = await getTranslations("site");
  const formToken = createContactFormToken();
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  return (
    <section id="contact" className="section-padding scroll-mt-20">
      <div className="mx-auto max-w-6xl">
        <SectionHeading title={t("title")} description={t("sectionDescription")} />
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

          <div className="section-card relative overflow-hidden p-6 sm:p-8">
            <div
              className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-primary/10 blur-3xl"
              aria-hidden
            />
            <h3 className="relative font-display text-lg font-semibold">{t("formTitle")}</h3>
            <div className="relative mt-6">
              <ContactForm formToken={formToken} turnstileSiteKey={turnstileSiteKey} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
