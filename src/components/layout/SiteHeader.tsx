"use client";

import {
  BookOpen,
  Briefcase,
  FileText,
  Home,
  Mail,
  Menu,
  User,
  X,
  type LucideIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LocaleSwitcher } from "@/components/preferences/LocaleSwitcher";
import { ThemeToggle } from "@/components/preferences/ThemeToggle";
import { Link, usePathname } from "@/i18n/navigation";

const navIcons: Record<string, LucideIcon> = {
  hero: Home,
  about: User,
  resume: BookOpen,
  portfolio: Briefcase,
  notes: FileText,
  contact: Mail,
};

const navIds = ["hero", "about", "resume", "portfolio", "notes", "contact"] as const;
type NavId = (typeof navIds)[number];

function isNavId(value: string): value is NavId {
  return (navIds as readonly string[]).includes(value);
}

function getActiveIdFromHash(): NavId {
  if (typeof window === "undefined") return "hero";
  const hash = window.location.hash.replace("#", "");
  return isNavId(hash) ? hash : "hero";
}

export function SiteHeader() {
  const tNav = useTranslations("nav");
  const tSite = useTranslations("site");
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeId, setActiveId] = useState<NavId>("hero");
  const scrollLockRef = useRef(false);

  const navItems = useMemo(
    () =>
      navIds.map((id) => ({
        id,
        label: tNav(id),
        href: `/#${id}`,
      })),
    [tNav],
  );

  const handleNavClick = useCallback((id: NavId) => {
    setMobileOpen(false);
    setActiveId(id);
    scrollLockRef.current = true;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.getElementById(id)?.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "start",
    });

    const nextHash = `#${id}`;
    if (window.location.hash !== nextHash) {
      window.history.pushState(null, "", nextHash);
    }

    window.setTimeout(() => {
      scrollLockRef.current = false;
    }, 900);
  }, []);

  useEffect(() => {
    const syncFromHash = () => {
      setActiveId(getActiveIdFromHash());
    };

    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, []);

  useEffect(() => {
    const hash = getActiveIdFromHash();
    if (hash !== "hero") {
      requestAnimationFrame(() => {
        document.getElementById(hash)?.scrollIntoView({ block: "start" });
      });
    }
  }, []);

  useEffect(() => {
    const sections = navItems
      .map((item) => document.getElementById(item.id))
      .filter(Boolean) as HTMLElement[];

    const observer = new IntersectionObserver(
      (entries) => {
        if (scrollLockRef.current) return;

        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id && isNavId(visible.target.id)) {
          setActiveId(visible.target.id);
        }
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: [0, 0.25, 0.5] },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [navItems]);

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
                    <Link
                      href={item.href}
                      onClick={(e) => {
                        if (!isHomePage) return;
                        e.preventDefault();
                        handleNavClick(item.id);
                      }}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                        isActive
                          ? "bg-primary text-white"
                          : "text-secondary hover:bg-surface-muted hover:text-foreground"
                      }`}
                    >
                      <Icon className="h-4 w-4" aria-hidden />
                      {item.label}
                    </Link>
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
              <Link
                key={item.id}
                href={item.href}
                onClick={(e) => {
                  if (!isHomePage) return;
                  e.preventDefault();
                  handleNavClick(item.id);
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
              </Link>
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
