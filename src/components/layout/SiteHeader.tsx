"use client";

import {
  BookOpen,
  Briefcase,
  Home,
  Mail,
  Menu,
  User,
  X,
  type LucideIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { LocaleSwitcher } from "@/components/preferences/LocaleSwitcher";
import { ThemeToggle } from "@/components/preferences/ThemeToggle";
import { Link } from "@/i18n/navigation";

const navIcons: Record<string, LucideIcon> = {
  hero: Home,
  about: User,
  resume: BookOpen,
  portfolio: Briefcase,
  contact: Mail,
};

const navIds = ["hero", "about", "resume", "portfolio", "contact"] as const;

export function SiteHeader() {
  const tNav = useTranslations("nav");
  const tSite = useTranslations("site");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeId, setActiveId] = useState("hero");

  const navItems = useMemo(
    () =>
      navIds.map((id) => ({
        id,
        label: tNav(id),
        href: `#${id}`,
      })),
    [tNav],
  );

  useEffect(() => {
    const sections = navItems
      .map((item) => document.getElementById(item.id))
      .filter(Boolean) as HTMLElement[];

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) {
          setActiveId(visible.target.id);
        }
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: [0, 0.25, 0.5] },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [navItems]);

  const handleNavClick = (href: string) => {
    setMobileOpen(false);
    const id = href.replace("#", "");
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-border/80 bg-surface/90 backdrop-blur-md lg:hidden">
        <div className="flex h-14 items-center justify-between gap-2 px-4">
          <Link href="/" className="min-w-0 truncate font-display text-sm font-semibold tracking-wide">
            {tSite("name")}
          </Link>
          <div className="flex shrink-0 items-center gap-2">
            <LocaleSwitcher compact />
            <ThemeToggle />
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border text-foreground"
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav"
              onClick={() => setMobileOpen((o) => !o)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              <span className="sr-only">{tNav("openMenu")}</span>
            </button>
          </div>
        </div>
        {mobileOpen ? (
          <nav id="mobile-nav" className="border-t border-border bg-surface px-2 pb-4">
            <ul className="space-y-1">
              {navItems.map((item) => {
                const Icon = navIcons[item.id] ?? Home;
                const isActive = activeId === item.id;
                return (
                  <li key={item.id}>
                    <a
                      href={item.href}
                      onClick={(e) => {
                        e.preventDefault();
                        handleNavClick(item.href);
                      }}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                        isActive
                          ? "bg-primary text-white"
                          : "text-secondary hover:bg-surface-muted hover:text-foreground"
                      }`}
                    >
                      <Icon className="h-4 w-4" aria-hidden />
                      {item.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>
        ) : null}
      </header>

      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-20 flex-col items-center border-r border-border bg-surface py-6 lg:flex xl:w-24">
        <Link
          href="/"
          className="mb-8 flex h-10 w-10 items-center justify-center rounded-xl bg-primary font-display text-sm font-bold text-white"
          title={tNav("home")}
        >
          TP
        </Link>
        <nav className="flex flex-1 flex-col items-center gap-2" aria-label={tNav("mainMenu")}>
          {navItems.map((item) => {
            const Icon = navIcons[item.id] ?? Home;
            const isActive = activeId === item.id;
            return (
              <a
                key={item.id}
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(item.href);
                }}
                title={item.label}
                className={`group relative flex h-11 w-11 items-center justify-center rounded-xl transition ${
                  isActive
                    ? "bg-primary text-white shadow-md shadow-primary/30"
                    : "text-secondary hover:bg-surface-muted hover:text-primary"
                }`}
              >
                <Icon className="h-5 w-5" aria-hidden />
                <span className="pointer-events-none absolute left-full ml-3 hidden whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-xs text-background opacity-0 transition group-hover:opacity-100 xl:block">
                  {item.label}
                </span>
              </a>
            );
          })}
        </nav>
        <div className="mt-auto flex flex-col items-center gap-3 pb-2">
          <LocaleSwitcher compact />
          <ThemeToggle />
        </div>
      </aside>
    </>
  );
}
