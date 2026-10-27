/**
 * Shared design tokens — used across pages.
 * All classes use sharp corners (no rounded-2xl / rounded-full except pills).
 * See globals.css for CSS custom properties.
 */

// Typography
export const eyebrow = 'overline'
export const h2 = 'mt-2 text-3xl font-bold tracking-tight text-ink sm:text-4xl'
export const lead = 'mt-3 max-w-2xl text-sm leading-relaxed text-zinc-600 sm:text-base'

// Buttons — use .btn and .btn-ghost from globals.css
// These Tailwind versions are for JSX className usage:
export const btnAmber =
  'btn'
export const btnGhostDark =
  'btn-ghost'
export const btnGreen =
  'btn'
export const btnOutline =
  'btn-ghost'

// Form fields
export const fieldLabel = 'block text-xs font-semibold uppercase tracking-wide text-zinc-600'
export const field = 'field'

// Cards — flat, bordered, no shadow by default
export const card =
  'border border-rule bg-white p-5 transition-colors hover:border-brand-600'

// Section panels
export const panelGreen =
  'relative overflow-hidden border border-brand-200 bg-brand-50'
export const panelEyebrow = 'overline'
export const panelH2 = 'mt-2 text-3xl font-bold tracking-tight text-ink sm:text-4xl'
export const panelText = 'text-zinc-700'
export const panelCard =
  'border border-brand-100 bg-white p-5 transition-colors hover:border-brand-600'
