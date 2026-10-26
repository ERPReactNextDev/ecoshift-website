// Shared class tokens so every page uses the same typography rhythm as the About page.
export const eyebrow = 'text-xs font-bold uppercase tracking-[0.18em] text-brand-700'
export const h2 = 'mt-2 text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl'
export const lead = 'mt-3 max-w-2xl text-zinc-600'

// Primary action. Solid brand green so it stays readable on both light panels
// and the soft green-tinted feature sections used across the site.
export const btnAmber =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-brand-600 px-7 text-sm font-bold text-white shadow-lg shadow-brand-600/25 transition-all hover:-translate-y-0.5 hover:bg-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2'

// Secondary action that sits next to btnAmber — outline green on light panels.
export const btnGhostDark =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-brand-300 bg-white/70 px-7 text-sm font-semibold text-brand-800 transition-colors hover:border-brand-500 hover:bg-brand-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500'

export const btnGreen =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-brand-600 px-7 text-sm font-bold text-white shadow-lg shadow-brand-600/20 transition-all hover:-translate-y-0.5 hover:bg-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:opacity-60'

export const btnOutline =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-brand-300 px-7 text-sm font-semibold text-brand-800 transition-colors hover:border-brand-500 hover:bg-brand-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500'

export const card =
  'rounded-3xl border border-zinc-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand-500/40 hover:shadow-xl hover:shadow-brand-900/10'

export const fieldLabel = 'text-sm font-semibold text-zinc-700'
export const field =
  'w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30'

// --- Light green feature panels -------------------------------------------------
// Replaces the old near-black feature blocks so every section stays light with a
// green tint, in line with the environment-first brand.

/** Container for a light green-tinted feature section. */
export const panelGreen =
  'relative overflow-hidden rounded-3xl border border-brand-100 bg-gradient-to-br from-brand-50 via-white to-emerald-50'

/** Eyebrow label used inside a light green panel. */
export const panelEyebrow = 'text-xs font-bold uppercase tracking-[0.18em] text-brand-700'

/** Heading used inside a light green panel. */
export const panelH2 = 'mt-2 text-3xl font-extrabold tracking-tight text-brand-900 sm:text-4xl'

/** Body copy used inside a light green panel. */
export const panelText = 'text-brand-900/70'

/** Small card used inside a light green panel. */
export const panelCard =
  'h-full rounded-2xl border border-brand-100 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md'
