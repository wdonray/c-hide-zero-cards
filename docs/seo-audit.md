# SEO Audit – Hide Zero Cards

- Site: https://hidezerocards.org/
- Repo: https://github.com/wdonray/c-hide-zero-cards
- Framework: Next.js 15 (App Router), React 19, Tailwind 4
- Purpose: Interactive place value teaching tool for teachers and students

## Routing & Rendering

- App Router detected (`app/`).
- Current pages: homepage only (`/`).
- Build output: SSG (static) for `/`.
- ISR: not needed yet; added ISR for sitemap (revalidate: daily).

## Metadata & Indexation (Before → After)

- Title/Description: Present → kept, refined robots and canonical.
- Canonical: Missing → added via `metadataBase` + `alternates.canonical`.
- Open Graph/Twitter: Present minimal → added `url`, `siteName`, images.
- JSON-LD: Missing → added Organization + WebSite + SearchAction to homepage.
- robots.txt: Missing → added `app/robots.ts` with non-prod disallow.
- sitemap.xml: Missing → added `app/sitemap.ts` with canonical URLs.

## CWV & Performance

- Fonts: self-hosted via `next/font`.
- Images: now using `next/image` logo with `priority` to improve LCP.
- Next config: enabled AVIF/WebP, disabled `x-powered-by`; package import optimization.
- First Load JS shared ~100 kB; room to reduce over time.

## Accessibility & Content

- One H1 present in header; semantic structure is acceptable.
- Alt text present on logo.
- Body content minimal; instructional value delivered via UI controls.

## Internationalization

- Single locale (`en`). No i18n/hreflang required yet.

## Key Issues (addressed)

- Missing robots/sitemap → Implemented.
- Missing canonical → Implemented.
- Missing JSON-LD → Implemented (Org, WebSite).

## Key Opportunities (next)

- Add educational content hubs: “Place Value Guide”, “Hide Zero strategy”, “Expanded form”.
- Create dedicated pages for FAQs (with FAQPage schema), How-to, and Teacher Resources.
- Add breadcrumbs once multiple pages exist.
- Consider server components where possible to reduce client JS.

## Rollback Notes

- Revert `app/robots.ts`, `app/sitemap.ts`, and metadata edits in `app/layout.tsx` to previous state.
- Remove JSON-LD `<Script>` tags from `app/page.tsx` if needed.
- Revert `next.config.ts` to prior minimal config.

## Evidence

- Build shows static prerender for `/` and generation of `/robots.txt` and `/sitemap.xml`.
- Live crawl (limited due to SSL time skew) indicates a single indexable page at `/`.
