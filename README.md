# Ecoshift Corporation — B2B E-Commerce / Quote-Request Platform

A production-ready SSR e-commerce website built with SvelteKit, Firebase (product catalog), and Supabase (quotations, auth, contact forms). Customers browse products, build a quote request, and submit it for the admin team to review.

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Framework | SvelteKit (SSR) + TypeScript |
| Adapter | @sveltejs/adapter-node |
| Styling | Tailwind CSS |
| Product Catalog | Firebase Firestore (read-only from public site) |
| Quotations / Auth / Contact | Supabase (Postgres + Auth + RLS) |
| Package Manager | pnpm |
| Image Optimization | vite-imagetools |

## Getting Started

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

See [Environment Variables](#environment-variables) below for details.

### 3. Set up Firebase

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Create a Firestore database with a `products` collection
3. Add your Firebase config to `.env`:
   - `PUBLIC_FIREBASE_API_KEY`
   - `PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `PUBLIC_FIREBASE_PROJECT_ID`
   - `PUBLIC_FIREBASE_STORAGE_BUCKET`
4. Deploy `firestore.rules` to your Firebase project:
   ```bash
   firebase deploy --only firestore:rules
   ```
5. Add product documents to the `products` collection. See the schema in [Product Schema](#product-schema-firestore) below.

> No service account credentials are needed — the app uses the Firebase client SDK with your public API key to read products from Firestore (subject to your security rules, which allow public read).

### 4. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Open the SQL editor and run the contents of `supabase/schema.sql`
3. Add your Supabase config to `.env`:
   - `PUBLIC_SUPABASE_URL`
   - `PUBLIC_SUPABASE_PERISHABLE_KEY` (the publishable key, formerly anon key)
   - `SUPABASE_SERVICE_ROLE_KEY` (Settings → API → service_role key)
4. Create a staff/admin user:
   - Go to Authentication → Users → Add user
   - After creating the user, go to the Table Editor → `profiles` table
   - Insert a row with the user's UUID and set `role` to `'staff'` or `'admin'`

### 5. Run the dev server

```bash
pnpm dev
```

The site will be available at `http://localhost:5173`.

### 6. Build for production

```bash
pnpm build
node build/index.js
```

## Environment Variables

| Variable | Scope | Description |
|----------|-------|-------------|
| `PUBLIC_SITE_URL` | Public | Your site's canonical URL (e.g. `https://ecoshiftcorp.com`) |
| `PUBLIC_SITE_NAME` | Public | Site name for SEO and branding |
| `PUBLIC_FIREBASE_API_KEY` | Public | Firebase API key |
| `PUBLIC_FIREBASE_AUTH_DOMAIN` | Public | Firebase auth domain |
| `PUBLIC_FIREBASE_PROJECT_ID` | Public | Firebase project ID |
| `PUBLIC_FIREBASE_STORAGE_BUCKET` | Public | Firebase storage bucket |
| `PUBLIC_SUPABASE_URL` | Public | Supabase project URL |
| `PUBLIC_SUPABASE_PERISHABLE_KEY` | Public | Supabase publishable key (formerly anon key) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | Supabase service role key (bypasses RLS) |
| `PUBLIC_GA_ID` | Public | Google Analytics 4 measurement ID (e.g. `G-XXXXXXXX`) |
| `PUBLIC_GSC_VERIFICATION` | Public | Google Search Console verification token |
| `REDIS_URL` | Server only | Optional Redis URL for product cache (defaults to in-memory) |

> **Security:** Only `PUBLIC_` prefixed variables are exposed to the client. Server-only variables (`FIREBASE_*`, `SUPABASE_SERVICE_ROLE_KEY`, `REDIS_URL`) are never bundled into client code.

## Product Schema (Firestore)

Collection: `products`

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Same as document ID |
| `slug` | string | Unique URL slug (indexed) |
| `name` | string | Product name |
| `sku` | string | Stock keeping unit |
| `category` | string | Product category |
| `tags` | string[] | Tags for related product matching |
| `shortDescription` | string | Brief description for cards/SEO |
| `description` | string | Full HTML or markdown description |
| `specs` | map | Key-value specifications |
| `images` | string[] | WebP image URLs |
| `price` | number (optional) | Price (omit for quote-only products) |
| `unit` | string | e.g. "piece", "box", "meter" |
| `brand` | string | Brand name |
| `inStock` | boolean | Stock status |
| `featured` | boolean | Show on homepage |
| `sortOrder` | number | Display order |
| `createdAt` | timestamp | Creation date |
| `updatedAt` | timestamp | Last update date |
| `isActive` | boolean | Whether the product is live |

## Google Analytics & Search Console Setup

### Google Analytics 4

1. Create a GA4 property at [analytics.google.com](https://analytics.google.com)
2. Copy your Measurement ID (format: `G-XXXXXXXX`)
3. Add it to `.env` as `PUBLIC_GA_ID`
4. The gtag script loads automatically on every page (only when the env var is set)

### Google Search Console

1. Verify your site at [search.google.com/search-console](https://search.google.com/search-console)
2. Add the verification token to `.env` as `PUBLIC_GSC_VERIFICATION`
3. Submit your sitemap: enter `https://yourdomain.com/sitemap.xml` in GSC
4. The verification meta tag is injected automatically via Seo.svelte

## OG Image

Place a default Open Graph image at `static/og-default.webp` (1200×630px). This image is used as the default `og:image` and `twitter:image` on all pages unless overridden by a specific page.

## Project Structure

```
/
├── src/
│   ├── app.html                    # HTML shell with Organization JSON-LD
│   ├── app.d.ts                    # App types (Supabase locals)
│   ├── app.css                      # Tailwind directives + base styles
│   ├── hooks.server.ts             # 301 redirects + Supabase session
│   ├── lib/
│   │   ├── server/
│   │   │   ├── firebase.ts         # Firebase Admin init
│   │   │   ├── supabase.ts         # Supabase admin + SSR clients
│   │   │   ├── rate-limit.ts       # Rate limiting via Postgres function
│   │   │   ├── cache.ts            # In-memory/Redis TTL cache
│   │   │   └── products.ts         # Firestore product fetch + cache
│   │   ├── components/             # Seo, JsonLd, Breadcrumbs, Header, Footer, etc.
│   │   ├── stores/quote.ts         # Quote basket store + localStorage
│   │   ├── redirects.ts           # 301 redirect map
│   │   └── types.ts                # Shared TypeScript interfaces
│   └── routes/
│       ├── +layout.svelte         # Root layout (Header + Footer)
│       ├── +layout.server.ts      # Session passthrough
│       ├── +error.svelte          # Custom 404
│       ├── robots.txt/+server.ts  # robots.txt
│       ├── sitemap.xml/+server.ts # Dynamic sitemap
│       ├── (public pages: /, about, careers, products, projects, blog, quote, contact, branches, privacy)
│       ├── api/quote/+server.ts   # POST submit quote (rate-limited)
│       ├── api/contact/+server.ts # POST contact form (rate-limited)
│       └── admin/                 # Login + quotations + contact-submissions (RBAC)
├── supabase/schema.sql            # Database schema + RLS + rate limit function
├── firestore.rules                 # Firestore security rules
├── static/og-default.webp          # Default OG image (provide your own)
├── .env.example                    # Environment variable template
├── svelte.config.js
├── vite.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

## Features

- **SSR**: All pages are server-rendered with `+page.server.ts` load functions
- **Quote Basket**: localStorage-persisted cart that works without login
- **Quotation Submission**: POST `/api/quote` → Supabase `quotations` + `quotation_items` with reference number
- **Admin Dashboard**: RBAC-protected (staff/admin only) with quotation management and contact submission viewing
- **Rate Limiting**: 5 submissions per 10 minutes per IP (via Postgres `check_rate_limit` function)
- **SEO**: robots.txt, sitemap.xml, canonical URLs, OG tags, JSON-LD (Organization, Product, BreadcrumbList, BlogPosting), GA4, GSC
- **301 Redirects**: Data-driven redirect map in `src/lib/redirects.ts`
- **Custom 404**: Styled error page with navigation
- **Security**: RLS on all Supabase tables, honeypot on forms, server-only env vars, input validation

## TODO / Next Steps

- [ ] Add real blog posts (or connect a CMS)
- [ ] Replace `static/og-default.webp` with a real 1200×630 WebP image
- [ ] Configure `PUBLIC_GA_ID` and `PUBLIC_GSC_VERIFICATION` when ready
- [ ] Set up email notifications for new quotation requests (e.g. Supabase Edge Function or email service)
- [ ] Configure `REDIS_URL` for production caching if needed
