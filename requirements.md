# PROJECT: B2B E-Commerce / Quote-Request Platform (SvelteKit + Firebase + Supabase)

You are building a production-ready SSR e-commerce website where customers browse products, build a "quote request" (cart-like), submit it, and the admin team reviews all quotation requests in a dashboard. Use the tech stack and requirements below exactly. Do not skip any numbered requirement. If a requirement conflicts with SvelteKit conventions, use the correct SvelteKit equivalent and note it in a comment.

---

## 1. TECH STACK (mandatory)

- Framework: SvelteKit (latest stable) with TypeScript, SSR enabled (no SPA-only mode)
- Adapter: @sveltejs/adapter-node (or adapter-vercel if target is Vercel — pick one and keep it)
- Styling: Tailwind CSS
- Product catalog database: Firebase Firestore (READ-ONLY from public site — products are loaded from Firebase)
- Quotations / Auth / Contact-form database: Supabase (Postgres + Auth + RLS)
- Session/cache: SvelteKit server sessions + in-memory or Redis cache for product list (configurable)
- Package manager: pnpm
- Images: serve WebP, use vite-imagetools or equivalent for automatic format conversion

---

## 2. CORE USER FLOW (the most important feature)

1. Visitor browses `/products` (loaded from Firebase Firestore collection `products`).
2. Visitor clicks "Add to Quote" on any product → item goes into a quote-basket (stored in localStorage, synced to a Svelte store). Works without login.
3. Visitor opens `/quote` (the "cart" view) → sees line items, can change quantity, remove items, add notes per line, add company/contact details.
4. Visitor submits quote → POST to server endpoint → validates → writes ONE row to Supabase `quotations` and N rows to `quotation_items` → sends confirmation email if configured → redirects to `/quote/success` with reference number.
5. Admin/staff logs in via Supabase Auth at `/admin/login` → views `/admin/quotations` (list, filter by status, search, paginated) → clicks to view detail → can update status (pending / reviewed / quoted / won / lost) and add internal notes.
6. Product recommendations appear on product detail page (same category, related tags) and on home page.

---

## 3. DATABASE SCHEMAS

### 3.1 Firebase Firestore (products — public read, admin write via Firebase console or separate admin tool)

Collection: `products`
Document fields:
- id (string, same as doc id)
- slug (string, unique, indexed)
- name (string)
- sku (string)
- category (string)
- tags (array of strings)
- shortDescription (string)
- description (string, HTML or markdown)
- specs (map: key-value pairs)
- images (array of strings: storage URLs or CDN URLs — must be WebP or convertible)
- price (number, optional — can be hidden for quote-only)
- unit (string, e.g. "piece", "box", "meter")
- brand (string)
- inStock (boolean)
- featured (boolean)
- sortOrder (number)
- createdAt / updatedAt (timestamp)
- isActive (boolean)

Firestore rules: allow read if true; allow write only if request.auth != null && admin. (Provide the rules file.)

### 3.2 Supabase (run this SQL in the Supabase SQL editor — include it in the repo as `supabase/schema.sql`)

```sql
-- Roles / RBAC
create table public.profiles (
  id uuid references auth.users(id) primary key,
  full_name text,
  role text not null default 'customer' check (role in ('customer','staff','admin')),
  created_at timestamptz default now()
);

-- Quotation header
create table public.quotations (
  id uuid primary key default gen_random_uuid(),
  reference text unique not null,            -- e.g. Q-2026-000123
  customer_name text not null,
  company text,
  email text not null,
  phone text,
  message text,
  status text not null default 'pending' check (status in ('pending','reviewed','quoted','won','lost')),
  internal_notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Quotation line items
create table public.quotation_items (
  id uuid primary key default gen_random_uuid(),
  quotation_id uuid references public.quotations(id) on delete cascade,
  product_id text not null,                  -- Firebase product id
  product_name text not null,
  sku text,
  quantity numeric not null default 1,
  unit text,
  line_note text,
  created_at timestamptz default now()
);

-- Contact form submissions
create table public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  subject text,
  message text not null,
  branch text,
  created_at timestamptz default now()
);

-- Rate limiting (simple, per-IP + per-action)
create table public.rate_limit_log (
  id bigserial primary key,
  ip text not null,
  action text not null,                       -- 'submit_quote','contact_form','login'
  created_at timestamptz default now()
);
create index on public.rate_limit_log (ip, action, created_at);

-- RLS: enable on all tables
alter table public.quotations enable row level security;
alter table public.quotation_items enable row level security;
alter table public.contact_submissions enable row level security;
alter table public.profiles enable row level security;
alter table public.rate_limit_log enable row level security;

-- Public can INSERT a quotation (anonymous submission) but NOT read/update
create policy "public can insert quotations" on public.quotations for insert with check (true);
create policy "public can insert quotation_items" on public.quotation_items for insert with check (true);
create policy "public can insert contact" on public.contact_submissions for insert with check (true);

-- Only staff/admin can read/update quotations
create policy "staff read quotations" on public.quotations for select using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('staff','admin'))
);
create policy "staff update quotations" on public.quotations for update using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('staff','admin'))
);
create policy "staff read items" on public.quotation_items for select using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('staff','admin'))
);
create policy "staff read contact" on public.contact_submissions for select using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('staff','admin'))
);
-- rate_limit_log: insert via service role only (server endpoint), no public access


so provide a Supabase Edge Function or a server-side Postgres function check_rate_limit(ip, action, limit_seconds, max_count) that the SvelteKit server endpoints call before accepting a submission. If exceeded, return 429.
4. PAGES & ROUTES (build all of these)
Public:
/ — Home: hero, featured products (from Firebase, cached), product categories, projects preview, blog preview, CTA to quote.
/about — About Us.
/careers — Careers list (static or from Supabase jobs table if you add one; include an apply-by-email CTA).
/products — Product list/catalog: filters by category, brand, search, pagination. Loads from Firebase on the server (server load function), with cache headers.
/products/[slug] — Product detail: gallery (WebP, lazy), specs table, description, "Add to Quote" button, breadcrumbs, related/recommended products (same category + tags).
/projects — Projects gallery/portfolio.
/blog — Blog list (paginated).
/blog/[slug] — Blog post.
/quote — Quote basket (cart view): line items, qty edit, remove, per-line notes, customer info form, submit button.
/quote/success — Confirmation page with reference number.
/contact — Contact form (working, posts to Supabase, rate-limited, with honeypot + validation + success state).
/branches — Branch locations list.
/privacy — Privacy policy page.
/admin/login — Supabase Auth login (email/password).
/admin/quotations — Protected: list of quotation requests (RBAC staff/admin only).
/admin/quotations/[id] — Protected: quotation detail + status update + internal notes.
/admin/contact-submissions — Protected: contact form submissions.
Shared components:
Header.svelte — main navigation menu (Header Menu requirement), sticky, mobile hamburger, quote-basket icon with item count.
Footer.svelte — links, branches summary, contact info, social, copyright.
QuoteBasket.svelte, ProductCard.svelte, Breadcrumbs.svelte, Seo.svelte (handles title/meta/canonical/OG), JsonLd.svelte.
5. SEO REQUIREMENTS (implement every one)
SSR: every page server-rendered; use +page.server.ts load functions for data. No client-only data fetching for primary content.
robots.txt: create src/routes/robots.txt/+server.ts returning robots.txt with Sitemap URL. (Note: robots.tsx is a Next.js convention — in SvelteKit this is the correct equivalent.)
sitemap.xml: create src/routes/sitemap.xml/+server.ts — dynamically generate from static routes + product slugs (Firebase) + blog slugs, cached for 1 hour.
Unique title tags: every page has a unique <title> via a Seo.svelte component; use %sveltekit.head%.
Meta descriptions: unique per page, passed to Seo.svelte.
One H1 per page: enforce exactly one <h1>; lint for it.
Canonical tags: <link rel="canonical"> on every page, built from $page.url.pathname + configured site origin.
Open Graph images: og:image, og:title, og:description, og:type, og:url, twitter card — per page; provide a default OG image and allow per-page override.
Custom 404: src/routes/+error.svelte styled to match the site, with links home.
301 redirects: implement in src/hooks.server.ts — a redirect map (old URL → new URL) returning 301; include at least a sample map and make it data-driven from src/lib/redirects.ts.
Alt text: every <img> has meaningful alt; empty alt only for purely decorative images.
WebP images: all product/content images served as WebP (use vite-imagetools or convert at build; provide <picture> with webp + fallback).
Lazy loading: loading="lazy" on below-fold images; decoding="async"; native lazy load.
Organization schema: JSON-LD Organization on every page (in app.html or Seo.svelte); add Product schema on product detail, BreadcrumbList on breadcrumb pages, BlogPosting on blog posts.
Breadcrumbs: visible breadcrumb UI + BreadcrumbList JSON-LD on products, blogs, projects, about.
Internal links: header nav, footer nav, related products, related blog posts, category links on product cards — ensure a crawlable internal-link structure.
Google Analytics: GA4 integration — load via partytown or a lightweight client component; accept PUBLIC_GA_ID env var; respect a simple consent toggle if present.
Search Console: support PUBLIC_GSC_VERIFICATION env var → inject <meta name="google-site-verification">; document that sitemap must be submitted in GSC.
Privacy policy: /privacy page with real sections (data collected, cookies, GA, Supabase/Firebase data, contact, user rights).
Working contact form: /contact — validates email/required fields, honeypot field, rate-limited, writes to Supabase contact_submissions, shows success/error states, no page reload (enhanced form action).
6. SECURITY, RATE LIMITING, RBAC, CACHE & SESSIONS
Rate limiter (Firebase + Supabase):
Supabase: server endpoints (POST /api/quote, POST /api/contact, POST /api/auth/login) call check_rate_limit (Postgres function or Edge Function) keyed by client IP + action; return 429 with Retry-After if exceeded. Config: max 5 submissions / 10 min per IP for quote/contact.
Firebase: Firestore rules limit read volume; on the server, cache product list (TTL 10 min) so Firebase is not hit on every request; add client-side throttle on "Add to Quote".
RBAC: Supabase Auth + profiles.role ('customer','staff','admin'). +layout.server.ts under /admin checks session + role; redirect non-staff to /admin/login. RLS policies enforce the same at DB level (see schema above).
Cache & sessions:
SvelteKit server session via @supabase/ssr cookies (access + refresh).
Product catalog cached server-side (in-memory Map with TTL, or Redis if REDIS_URL set) with Cache-Control headers.
Set proper Cache-Control on static assets and sitemap.
Quote basket: localStorage + Svelte store, hydrated on client; optional merge after login.

7. PROJECT STRUCTURE (follow this layout)
/
├── src/
│   ├── app.html
│   ├── hooks.server.ts            # 301 redirects + Supabase session handle
│   ├── lib/
│   │   ├── server/
│   │   │   ├── firebase.ts        # Firebase admin/server init (service account)
│   │   │   ├── supabase.ts        # Supabase admin client (service role) + SSR client
│   │   │   ├── rate-limit.ts
│   │   │   ├── cache.ts
│   │   │   └── products.ts        # product fetch + cache
│   │   ├── components/            # Header, Footer, Seo, JsonLd, Breadcrumbs, ProductCard, QuoteBasket, ...
│   │   ├── stores/quote.ts        # quote basket store + localStorage sync
│   │   ├── redirects.ts
│   │   └── types.ts
│   └── routes/
│       ├── +layout.svelte / +layout.server.ts
│       ├── +error.svelte          # custom 404
│       ├── robots.txt/+server.ts
│       ├── sitemap.xml/+server.ts
│       ├── / (home)
│       ├── about/
│       ├── careers/
│       ├── products/[slug]/
│       ├── projects/
│       ├── blog/[slug]/
│       ├── quote/ + quote/success/
│       ├── contact/
│       ├── branches/
│       ├── privacy/
│       ├── api/quote/+server.ts   # POST submit quote (rate-limited)
│       ├── api/contact/+server.ts # POST contact form (rate-limited)
│       └── admin/(login, quotations, quotations/[id], contact-submissions)
├── supabase/schema.sql
├── firestore.rules
├── static/og-default.webp
├── .env.example
├── svelte.config.js
└── vite.config.ts

. ENVIRONMENT VARIABLES (create .env.example)
PUBLIC_SITE_URL=https://example.com
PUBLIC_SITE_NAME="Ecoshift Corporation"
# Firebase (client + admin)
PUBLIC_FIREBASE_API_KEY=...
PUBLIC_FIREBASE_AUTH_DOMAIN=...
PUBLIC_FIREBASE_PROJECT_ID=...
PUBLIC_FIREBASE_STORAGE_BUCKET=...
FIREBASE_CLIENT_EMAIL=...          # server only
FIREBASE_PRIVATE_KEY=...           # server only
# Supabase
PUBLIC_SUPABASE_URL=...
PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...      # server only
# Analytics / SEO
PUBLIC_GA_ID=G-XXXXXXXX
PUBLIC_GSC_VERIFICATION=...
# Optional cache
REDIS_URL=

 BUILD ORDER (do it in this sequence, one step at a time)
Scaffold SvelteKit + TS + Tailwind + adapter, configure svelte.config.js.
Set up app.html with default meta, Organization JSON-LD, GA/GSC slots.
Create Seo.svelte, JsonLd.svelte, Breadcrumbs.svelte, Header, Footer, base layout.
Firebase server client + product fetch + cache; build /products and /products/[slug].
Quote store (localStorage) + "Add to Quote" + /quote + /quote/success.
Supabase schema.sql, RLS, check_rate_limit; build POST /api/quote and POST /api/contact.
Supabase Auth + RBAC + /admin/* pages.
Remaining pages: home, about, careers, projects, blog, branches, privacy, contact.
SEO pass: robots.txt, sitemap.xml, canonical, OG images, 301 redirects in hooks.server.ts, custom 404, alt text audit, WebP + lazy loading.
Security pass: rate limiter wired to both endpoints, RLS verified, env vars split public/server.
README with setup steps, env vars, Firebase/Supabase config, and GSC/GA setup checklist.
10. ACCEPTANCE CRITERIA (must all be true before you say "done")
npm run build passes with zero errors.
Every public page is SSR (view-source shows real content, not an empty <div id="app">).
/robots.txt and /sitemap.xml return valid content.
Every page has unique title, meta description, canonical, OG tags, exactly one H1.
Submitting the quote form writes to Supabase quotations + quotation_items and returns a reference number.
Submitting twice rapidly from same IP returns 429.
/admin/quotations is inaccessible without staff/admin login (redirect + RLS).
Contact form saves to Supabase and shows success without reload.
All images are WebP with alt text and lazy loading.
301 redirect map works (test one sample redirect).
Custom 404 renders for unknown routes.
.env.example documents every variable; no secret is exposed to the client (verify via PUBLIC_ prefix only).
Ask me for the actual Firebase and Supabase credential values when you reach step 3/6 — do NOT hardcode any keys. If anything above is ambiguous, choose the most standard SvelteKit pattern and leave a TODO comment.

