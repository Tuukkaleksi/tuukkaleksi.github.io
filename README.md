<p align="center">
  <strong>Tuukka Pitkänen — Portfolio</strong><br />
  <sub>Personal site · project showcase · Oulu, Finland</sub>
</p>

<p align="center">
  <a href="https://www.tuukkadev.com/">Live</a>
  ·
  <a href="https://github.com/Tuukkaleksi/tuukkaleksi.github.io">Source</a>
  ·
  <a href="./LICENSE">License</a>
</p>

---

A bilingual portfolio built with Next.js — one polished surface for background, skills, résumé, selected work, and contact. Content is data-driven; layout and interaction stay consistent as projects evolve.

**Live:** [tuukkadev.com](https://www.tuukkadev.com/)

---

## Highlights

| | |
|---|---|
| **Experience** | Single-page home with anchored sections, project detail routes, and locale-aware routing (FI / EN) |
| **Content** | Projects, copy, and metadata in typed modules and translation files — no layout edits for new work |
| **Contact** | Server-side form with HMAC tokens, rate limiting, honeypot, spam heuristics, and optional Cloudflare Turnstile |
| **Quality** | Open Graph metadata, sitemap, robots.txt, legacy URL redirects, accessible focus states |
| **Pipeline** | GitHub Actions — lint, typecheck, production build |

---

## Stack

<p>
  <img src="https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind-4-38B2AC?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS 4" />
  <img src="https://img.shields.io/badge/next--intl-i18n-000?style=flat-square" alt="next-intl" />
</p>

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| UI | React 19, Tailwind CSS 4, Lucide |
| i18n | next-intl (Finnish default, English) |
| Email | Resend (contact + optional auth flows) |
| Tooling | ESLint, Turbopack, Vitest |

---

## Structure

```
├── public/images/              # Portfolio and site assets
├── messages/                   # en.json, fi.json — site and project copy
├── src/
│   ├── app/                    # Routes, API, layout, SEO
│   ├── components/             # Layout, sections, contact, portfolio
│   ├── content/                # projects-base.ts, skills, social links
│   ├── i18n/                   # Locale routing and message loading
│   └── lib/                    # Site config, contact pipeline
├── .env.example
├── LICENSE
└── next.config.ts              # Images, legacy redirects
```

---

## Local development

**Requirements:** Node.js 20+ (22 recommended for CI parity), npm

```bash
git clone https://github.com/Tuukkaleksi/tuukkaleksi.github.io.git
cd tuukkaleksi.github.io
npm install
cp .env.example .env.local
```

Set at minimum in `.env.local`:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

| Command | Purpose |
|---------|---------|
| `npm run dev` | Development server → [localhost:3000](http://localhost:3000) |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript (no emit) |
| `npm run test` | Vitest |
| `npm run db:migrate` | Database migrations (Neon Drift features) |

---

## Environment

Copy [`.env.example`](./.env.example) to `.env.local`. Never commit secrets.

| Variable | Required | Role |
|----------|----------|------|
| `NEXT_PUBLIC_SITE_URL` | Yes | Canonical URL — metadata, sitemap, callbacks |
| `CONTACT_FORM_SECRET` | Contact form | HMAC secret (`openssl rand -base64 32`) |
| `CONTACT_TO_EMAIL` | Contact form | Inbox for messages |
| `RESEND_API_KEY` | Contact form | Resend API key |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Optional | Cloudflare Turnstile (client) |
| `TURNSTILE_SECRET_KEY` | Optional | Turnstile verification (server) |
| `NEXT_PUBLIC_NEON_DRIFT_URL` | Optional | External play link for Neon Drift |
| `DATABASE_URL` | Neon Drift | Postgres connection string |
| `BETTER_AUTH_SECRET` | Neon Drift auth | Auth secret |
| `BETTER_AUTH_URL` | Neon Drift auth | Auth base URL |
| `NEON_DRIFT_SECRET` | Leaderboard | HMAC for run tokens |

---

## Deployment

Optimized for [Vercel](https://vercel.com/) or any Node host that runs Next.js App Router.

1. Import the repository (project root — no subdirectory).
2. Set `NEXT_PUBLIC_SITE_URL` to your production URL.
3. Configure contact and optional feature env vars.
4. Point DNS to the host.

GitHub Pages does not run this stack without a static export; Vercel is the recommended path.

---

## Editing content

| Change | Location |
|--------|----------|
| Project images, slugs, categories, links | `src/content/projects-base.ts` |
| Project titles, descriptions, meta labels | `messages/en.json`, `messages/fi.json` → `projects.items` |
| Skills | `src/content/skills.ts` |
| Social links | `src/content/social-links.ts` |
| Site name, default URL, roles | `src/lib/site.ts` + `messages/*/site` |
| Images | `public/images/` |

Run `npm run build` after content changes before deploying.

---

## Author

**Tuukka Pitkänen** — Web developer & programmer

- **Site:** [tuukkadev.com](https://www.tuukkadev.com/)
- **GitHub:** [@Tuukkaleksi](https://github.com/Tuukkaleksi)
- **LinkedIn:** [Tuukka Pitkänen](https://www.linkedin.com/in/tuukka-pitk%C3%A4nen-768009265/)

---

## License

**Proprietary — all rights reserved.** This repository is not open source.

No permission is granted to use, copy, modify, distribute, host, or create derivative works from any part of this project. See [LICENSE](./LICENSE) for full terms.

Third-party libraries remain under their respective licenses. Assets in `public/images/` are the author's property unless otherwise noted.
