/**
 * One-shot extractor: copies Neon Drift from portfolio → Desktop/neon-drift
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SRC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DEST = path.resolve(SRC, "..", "neon-drift");

const COPY_DIRS = [
  ["src/lib/arcade", "src/lib/arcade"],
  ["src/lib/neon-drift", "src/lib/neon-drift"],
  ["src/lib/auth", "src/lib/auth"],
  ["src/db", "src/db"],
  ["src/components/arcade", "src/components/arcade"],
  ["src/app/api/neon-drift", "src/app/api/neon-drift"],
  ["src/app/api/auth", "src/app/api/auth"],
  ["src/i18n", "src/i18n"],
  ["drizzle", "drizzle"],
  ["public/sound", "public/sound"],
];

const COPY_FILES = [
  ["src/lib/contact/turnstile.ts", "src/lib/contact/turnstile.ts"],
  ["drizzle.config.ts", "drizzle.config.ts"],
  ["postcss.config.mjs", "postcss.config.mjs"],
  ["eslint.config.mjs", "eslint.config.mjs"],
  ["vitest.config.ts", "vitest.config.ts"],
  ["tsconfig.json", "tsconfig.json"],
];

const NEON_DRIFT_PAGES = [
  "page.tsx",
  "NeonDriftPlayClient.tsx",
  "shop/page.tsx",
  "leaderboard/page.tsx",
  "signin/page.tsx",
  "register/page.tsx",
  "forgot-password/page.tsx",
  "reset-password/page.tsx",
  "verify-email/page.tsx",
];

function rmrf(p) {
  if (fs.existsSync(p)) fs.rmSync(p, { recursive: true, force: true });
}

function mkdirp(p) {
  fs.mkdirSync(p, { recursive: true });
}

function copyDir(from, to) {
  mkdirp(path.dirname(to));
  fs.cpSync(from, to, { recursive: true });
}

function copyFile(from, to) {
  mkdirp(path.dirname(to));
  fs.copyFileSync(from, to);
}

function walk(dir, fn) {
  if (!fs.existsSync(dir)) return;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, fn);
    else fn(p);
  }
}

function rewriteContent(text) {
  let s = text;
  s = s.replaceAll("@/components/portfolio/neon-drift/", "@/components/neon-drift/");
  s = s.replaceAll("@/app/[locale]/neon-drift/", "@/app/[locale]/");
  // App routes: /neon-drift/foo → /foo (keep /api/neon-drift)
  s = s.replaceAll('"/neon-drift/', '"/');
  s = s.replaceAll("'/neon-drift/", "'/");
  s = s.replaceAll("`/neon-drift/", "`/");
  s = s.replaceAll('"/neon-drift"', '"/"');
  s = s.replaceAll("'/neon-drift'", "'/'");
  s = s.replaceAll("`/neon-drift`", "`/`");
  s = s.replaceAll("${baseURL}/neon-drift/", "${baseURL}/");
  s = s.replaceAll("${base}/neon-drift/", "${base}/");
  s = s.replaceAll(
    "${window.location.origin}/neon-drift/",
    "${window.location.origin}/",
  );
  s = s.replaceAll('redirect("/neon-drift/', 'redirect("/');
  s = s.replaceAll("redirect(next ?? \"/shop\")", "redirect(next ?? \"/shop\")");
  s = s.replaceAll('router.push("/#portfolio")', 'router.push("/shop")');
  s = s.replaceAll('exit": "Back to portfolio"', 'exit": "Leave game"');
  s = s.replaceAll('back": "Back to portfolio"', 'back": "Back to game"');
  s = s.replaceAll('backToArcade": "Back to Neon Drift"', 'backToArcade": "Back to game"');
  s = s.replaceAll('globalPausedCta": "Sign in (coming soon)"', 'globalPausedCta": "Sign in"');
  s = s.replaceAll(
    'globalPausedBody": "Online scores will open after sign-in. Your run is saved on this device."',
    'globalPausedBody": "Sign in to submit runs to the global board."',
  );
  return s;
}

function rewriteFile(filePath) {
  const ext = path.extname(filePath);
  if (![".ts", ".tsx", ".css", ".json", ".mjs"].includes(ext)) return;
  const raw = fs.readFileSync(filePath, "utf8");
  const next = rewriteContent(raw);
  if (next !== raw) fs.writeFileSync(filePath, next);
}

function buildMessages(locale) {
  const all = JSON.parse(
    fs.readFileSync(path.join(SRC, "messages", `${locale}.json`), "utf8"),
  );
  const panelLb = all.projects?.items?.["neon-drift"]?.leaderboard ?? {};
  return {
    site: {
      name: "Neon Drift",
      title: locale === "fi" ? "Neon Drift" : "Neon Drift",
      description:
        locale === "fi"
          ? "Selviydy parvesta. Selaa kosmetiikkaa, kilpaile tulostaululla."
          : "Survive the swarm. Customize your ship, compete on the global board.",
    },
    arcade: {
      ...all.arcade,
      exit: locale === "fi" ? "Poistu pelistä" : "Leave game",
      panel: { leaderboard: panelLb },
    },
    notFound: all.notFound,
  };
}

function writeGlobalsCss() {
  const srcCss = fs.readFileSync(path.join(SRC, "src/app/globals.css"), "utf8");
  const arcadeBlock = srcCss.slice(srcCss.indexOf("/* Hidden arcade"));
  const css = `@import "tailwindcss";

@custom-variant dark (&:where(.dark, .dark *));

:root,
.dark {
  --background: #0a0b0d;
  --foreground: #e8eaed;
  --surface: #14161a;
  --surface-muted: #1c1e22;
  --primary: #3b9eff;
  --primary-hover: #5aafff;
  --secondary: #a8b0bb;
  --border: #2e333b;
  --hero-bg: #0d0e10;
  --hero-gradient: rgba(59, 158, 255, 0.28);
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-surface: var(--surface);
  --color-surface-muted: var(--surface-muted);
  --color-primary: var(--primary);
  --color-primary-hover: var(--primary-hover);
  --color-secondary: var(--secondary);
  --color-border: var(--border);
  --color-hero-bg: var(--hero-bg);
  --font-sans: var(--font-sans);
  --font-display: var(--font-display);
}

html {
  scroll-behavior: smooth;
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: var(--font-sans), system-ui, sans-serif;
}

::selection {
  background: color-mix(in srgb, var(--primary) 25%, transparent);
}

${arcadeBlock}`;
  fs.writeFileSync(path.join(DEST, "src/app/globals.css"), css);
}

function writePackageJson() {
  const pkg = JSON.parse(fs.readFileSync(path.join(SRC, "package.json"), "utf8"));
  pkg.name = "neon-drift";
  pkg.description = "Neon Drift — browser survival arcade";
  fs.writeFileSync(path.join(DEST, "package.json"), JSON.stringify(pkg, null, 2) + "\n");
}

function writeEnvExample() {
  const example = fs.readFileSync(path.join(SRC, ".env.example"), "utf8");
  const filtered = example
    .split("\n")
    .filter(
      (line) =>
        !line.startsWith("CONTACT_") &&
        !line.includes("CONTACT_FORM_SECRET") &&
        line.trim() !== "",
    )
    .join("\n");
  fs.writeFileSync(
    path.join(DEST, ".env.example"),
    filtered +
      "\n# Optional: enable global leaderboard score submit (requires pilot auth)\nNEXT_PUBLIC_NEON_DRIFT_GLOBAL_SUBMIT=false\n",
  );
}

function writeTurnstileTypes() {
  mkdirp(path.join(DEST, "src/types"));
  fs.writeFileSync(
    path.join(DEST, "src/types/turnstile.d.ts"),
    `interface TurnstileRenderOptions {
  sitekey: string;
  theme?: "light" | "dark" | "auto";
  callback?: (token: string) => void;
  "expired-callback"?: () => void;
  "error-callback"?: () => void;
}

interface TurnstileApi {
  render: (container: HTMLElement, options: TurnstileRenderOptions) => string;
  remove: (widgetId: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

export {};
`,
  );
}

function writeSiteLib() {
  const content = `export const siteConfig = {
  name: "Neon Drift",
  title: "Neon Drift",
  description: "Browser-native survival shooter — dodge, shoot, combo.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  locale: "fi",
} as const;
`;
  fs.writeFileSync(path.join(DEST, "src/lib/site.ts"), content);
}

function writeNextConfig() {
  const content = `import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {};

export default withNextIntl(nextConfig);
`;
  fs.writeFileSync(path.join(DEST, "next.config.ts"), content);
}

function writeProxy() {
  copyFile(path.join(SRC, "src/proxy.ts"), path.join(DEST, "src/proxy.ts"));
}

function writeProviders() {
  const content = `"use client";

import { NextIntlClientProvider } from "next-intl";
import type { AbstractIntlMessages } from "next-intl";
import { defaultTimeZone } from "@/i18n/request";
import type { Locale } from "@/i18n/routing";

type AppProvidersProps = {
  children: React.ReactNode;
  locale: Locale;
  messages: AbstractIntlMessages;
};

export function AppProviders({ children, locale, messages }: AppProvidersProps) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages} timeZone={defaultTimeZone}>
      {children}
    </NextIntlClientProvider>
  );
}
`;
  mkdirp(path.join(DEST, "src/components/providers"));
  fs.writeFileSync(path.join(DEST, "src/components/providers/AppProviders.tsx"), content);
}

function writeLocaleLayout() {
  const content = `import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Raleway } from "next/font/google";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { NeonDriftAudioProvider } from "@/components/arcade/NeonDriftAudioProvider";
import { AppProviders } from "@/components/providers/AppProviders";
import { routing, type Locale } from "@/i18n/routing";
import { siteConfig } from "@/lib/site";
import "../globals.css";

const sans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const display = Raleway({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "site" });
  const base =
    locale === routing.defaultLocale
      ? siteConfig.url
      : \`\${siteConfig.url}/\${locale}\`;

  return {
    metadataBase: new URL(siteConfig.url),
    title: { default: t("title"), template: "%s · Neon Drift" },
    description: t("description"),
    alternates: { canonical: base },
    robots: { index: true, follow: true },
    icons: { icon: "/favicon.ico" },
  };
}

export default async function LocaleLayout({ children, params }: LayoutProps) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={\`dark \${sans.variable} \${display.variable}\`}
      suppressHydrationWarning
    >
      <body className="min-h-dvh bg-[#0a0b0d] text-foreground antialiased">
        <AppProviders locale={locale as Locale} messages={messages}>
          <div className="fixed inset-0 z-0 flex h-dvh flex-col overflow-hidden">
            <NeonDriftAudioProvider>{children}</NeonDriftAudioProvider>
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
`;
  mkdirp(path.join(DEST, "src/app/[locale]"));
  fs.writeFileSync(path.join(DEST, "src/app/[locale]/layout.tsx"), content);
}

function writeRootRedirect() {
  const content = `import { redirect } from "next/navigation";
import { routing } from "@/i18n/routing";

export default function RootPage() {
  redirect(\`/\${routing.defaultLocale}\`);
}
`;
  fs.writeFileSync(path.join(DEST, "src/app/page.tsx"), content);
}

function writeGitignore() {
  fs.writeFileSync(
    path.join(DEST, ".gitignore"),
    fs.readFileSync(path.join(SRC, ".gitignore"), "utf8"),
  );
}

function writeReadme() {
  fs.writeFileSync(
    path.join(DEST, "README.md"),
    `# Neon Drift

Standalone Neon Drift arcade (extracted from the portfolio).

## Setup

\`\`\`bash
npm install
cp .env.example .env
# Fill DATABASE_URL, BETTER_AUTH_SECRET, RESEND_API_KEY, NEON_DRIFT_SECRET
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) (redirects to \`/fi\`).

## Database

\`\`\`bash
npm run db:push
\`\`\`
`,
  );
}

// --- main ---
console.log("Bootstrap Neon Drift →", DEST);
rmrf(DEST);
mkdirp(DEST);

for (const [from, to] of COPY_DIRS) {
  const srcPath = path.join(SRC, from);
  if (!fs.existsSync(srcPath)) {
    console.warn("skip missing:", from);
    continue;
  }
  copyDir(srcPath, path.join(DEST, to));
  console.log("copied dir", to);
}

for (const [from, to] of COPY_FILES) {
  copyFile(path.join(SRC, from), path.join(DEST, to));
}

// portfolio neon-drift UI → components/neon-drift (leaderboard panel only)
const portfolioNd = path.join(SRC, "src/components/portfolio/neon-drift");
const destNd = path.join(DEST, "src/components/neon-drift");
mkdirp(destNd);
for (const f of ["LeaderboardPanel.tsx"]) {
  copyFile(path.join(portfolioNd, f), path.join(destNd, f));
}

// Move app pages from neon-drift subfolder to [locale] root
const srcPages = path.join(SRC, "src/app/[locale]/neon-drift");
const destLocale = path.join(DEST, "src/app/[locale]");
mkdirp(destLocale);
for (const rel of NEON_DRIFT_PAGES) {
  const srcPage = path.join(srcPages, rel);
  if (!fs.existsSync(srcPage)) continue;
  const destPage = path.join(destLocale, rel);
  mkdirp(path.dirname(destPage));
  copyFile(srcPage, destPage);
}

mkdirp(path.join(DEST, "messages"));
for (const locale of ["en", "fi"]) {
  fs.writeFileSync(
    path.join(DEST, "messages", `${locale}.json`),
    JSON.stringify(buildMessages(locale), null, 2) + "\n",
  );
}

writeGlobalsCss();
writePackageJson();
writeEnvExample();
writeSiteLib();
writeTurnstileTypes();
writeNextConfig();
writeProxy();
writeProviders();
writeLocaleLayout();
writeRootRedirect();
writeGitignore();
writeReadme();

// Patch LeaderboardPanel translations
const lbPanel = path.join(DEST, "src/components/neon-drift/LeaderboardPanel.tsx");
let lb = fs.readFileSync(lbPanel, "utf8");
lb = lb.replace(
  'getTranslations("projects.items.neon-drift.leaderboard")',
  'getTranslations("arcade.panel.leaderboard")',
);
fs.writeFileSync(lbPanel, lb);

// Rewrite all source files
walk(path.join(DEST, "src"), rewriteFile);

console.log("Done. Next: cd", DEST, "&& npm install && npm run typecheck");
