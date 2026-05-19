# Tuukka Pitkänen — Portfolio

Personal portfolio and project showcase for **Tuukka Pitkänen**, software developer based in Oulu, Finland. The site presents background, skills, résumé, and selected work in a single-page layout with dedicated project detail pages.

**Live site:** Coming Soon

---

## Features

- **Single-page home** — Hero, about, skills, résumé, portfolio grid, and contact sections with smooth in-page navigation
- **Project pages** — Static routes at `/portfolio/[slug]` with image galleries and metadata
- **Content-driven** — Projects and site copy live in TypeScript modules (`src/content/`) for type-safe updates without touching layout code
- **SEO-ready** — Open Graph metadata, `sitemap.xml`, and `robots.txt`
- **Legacy redirects** — Old `portfolio-*.html` URLs redirect to the new routes
- **Responsive UI** — Mobile navigation and desktop sidebar; accessible focus states and semantic markup
- **CI** — GitHub Actions runs lint, typecheck, and production build on push/PR

The contact form is intentionally disabled while a server-side email integration is planned (no `mailto:` links).

---

## Tech stack

| Layer | Technology |
|--------|------------|
| Framework | [Next.js 16](https://nextjs.org/) (App Router) |
| Language | [TypeScript](https://www.typescriptlang.org/) |
| UI | [React 19](https://react.dev/), [Tailwind CSS 4](https://tailwindcss.com/) |
| Icons | [Lucide](https://lucide.dev/) |
| Tooling | ESLint, Turbopack (dev/build) |

---

## Project structure

```
├── public/images/          # Profile and portfolio assets
├── src/
│   ├── app/                # Routes, layout, global styles, SEO files
│   ├── components/         # Layout, sections, UI, portfolio gallery
│   ├── content/            # projects.ts, site-data.ts (editable copy)
│   ├── lib/                # Site configuration
│   └── types/              # Shared TypeScript types
├── .env.example            # Environment variable template
└── next.config.ts          # Images, legacy URL redirects
```

---

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) 20+ (22 recommended for CI parity)
- npm

### Installation

```bash
git clone https://github.com/Tuukkaleksi/tuukkaleksi.github.io.git
cd tuukkaleksi.github.io
npm install
cp .env.example .env.local
```

Edit `.env.local` and set your public site URL:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Production build

```bash
npm run build
npm run start
```

### Other scripts

| Command | Description |
|---------|-------------|
| `npm run lint` | Run ESLint |
| `npm run typecheck` | TypeScript check without emit |

---

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SITE_URL` | Yes | Canonical URL for metadata, Open Graph, and sitemap |
| `RESEND_API_KEY` | No | Reserved for future contact API |
| `CONTACT_TO_EMAIL` | No | Reserved for future contact API |

Never commit `.env.local` or secrets to the repository.

---

## Deployment

This app is designed for [Vercel](https://vercel.com/) (or any Node-compatible host that supports Next.js).

1. Import the GitHub repository; use the **repository root** as the project root (no subdirectory).
2. Set `NEXT_PUBLIC_SITE_URL` to your production domain.
3. Point your domain’s DNS to the hosting provider.

GitHub Pages does not run this stack without additional static-export configuration; Vercel is the recommended path for full App Router features and future API routes.

---

## Updating content

| What to change | Where |
|----------------|--------|
| Projects (title, images, links, description) | `src/content/projects.ts` |
| Skills, résumé, about text, social links | `src/content/site-data.ts` |
| Site name, default URL, meta description | `src/lib/site.ts` |
| Images | `public/images/` |

After editing content, run `npm run build` locally to verify before deploying.

---

## Roadmap

- [ ] Contact form API route with rate limiting and an email provider (e.g. Resend)
- [ ] Optional CAPTCHA / bot protection on contact submissions

---

## Author

**Tuukka Pitkänen** — Web developer & programmer

- Website: [portfoliobytuukka.net](https://portfoliobytuukka.net/)
- GitHub: [@Tuukkaleksi](https://github.com/Tuukkaleksi)
- LinkedIn: [Tuukka Pitkänen](https://www.linkedin.com/in/tuukka-pitk%C3%A4nen-768009265/)

---

## License

This project is private portfolio code. All rights reserved unless otherwise noted. Third-party assets in `public/images/` remain your property.
