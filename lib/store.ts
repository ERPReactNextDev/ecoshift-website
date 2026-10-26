// Display name of the storefront brand (used for labels / badges / SEO).
export const STORE_BRAND = process.env.NEXT_PUBLIC_STORE_BRAND || 'Ecoshift'

// Matches "Ecoshift", "ECOSHIFT", "Eco Shift", "Eco-Shift", "Ecoshift Corp", ...
export const ECOSHIFT_PATTERN = /eco[\s_-]*shift/i

/**
 * Finds the exact brand string stored in the product data that represents Ecoshift,
 * so the filter works no matter how the CMS spells it.
 * Returns undefined when no Ecoshift brand exists (callers should then NOT filter by brand,
 * so the catalog never ends up empty because of a spelling mismatch).
 */
export function resolveStoreBrand(brands: string[]): string | undefined {
  const wanted = STORE_BRAND.trim().toLowerCase()
  return (
    brands.find(b => b.trim().toLowerCase() === wanted) ??
    brands.find(b => ECOSHIFT_PATTERN.test(b))
  )
}