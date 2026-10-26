import type { Product, TechnicalSpec, TechnicalSpecGroup, ProductSeo } from './types'

const FIREBASE_PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!
const FIREBASE_API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY!

// Fallback catalog source (server-only). Same product schema as Firestore but a
// separate quota pool, so the site keeps serving products when Firestore is
// quota-limited.
const JARIES_API_URL = process.env.JARIES_API_URL
const JARIES_API_KEY = process.env.JARIES_API_KEY

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseValue(v: any): any {
  if (v === null || v === undefined) return null
  if (v.stringValue !== undefined) return v.stringValue
  if (v.integerValue !== undefined) return Number(v.integerValue)
  if (v.doubleValue !== undefined) return v.doubleValue
  if (v.booleanValue !== undefined) return v.booleanValue
  if (v.timestampValue !== undefined) return v.timestampValue
  if (v.nullValue !== undefined) return null
  if (v.arrayValue) {
    return (v.arrayValue.values || []).map(parseValue)
  }
  if (v.mapValue) {
    const out: Record<string, any> = {}
    const fields = v.mapValue.fields || {}
    for (const k of Object.keys(fields)) out[k] = parseValue(fields[k])
    return out
  }
  if (v.referenceValue !== undefined) return v.referenceValue
  return null
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseDoc(doc: any): Product {
  const fields = doc.fields || {}
  const parsed: Record<string, any> = {}
  for (const k of Object.keys(fields)) parsed[k] = parseValue(fields[k])

  const docId = (doc.name || '').split('/').pop() || ''
  return buildProduct(parsed, docId)
}

// Builds a Product from an already-decoded record. Both the Firestore loader and
// the Jaries CMS fallback expose the same schema, so they share this mapper.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildProduct(parsed: Record<string, any>, fallbackId = ''): Product {
  const id = parsed.id || fallbackId

  // images handling
  let images: string[] = []
  if (Array.isArray(parsed.images)) {
    images = parsed.images.map((x: any) => (typeof x === 'string' ? x : (x?.url || x?.src || ''))).filter(Boolean)
  } else if (Array.isArray(parsed.galleryImages)) {
    images = parsed.galleryImages.filter((x: any) => typeof x === 'string')
  }
  const mainImage = parsed.mainImage || parsed.image || parsed.photo || (images.length ? images[0] : '') || ''
  const galleryImages = parsed.galleryImages || (images.length > 1 ? images.slice(1) : (images.length === 1 && mainImage !== images[0] ? images : []))

  // specs / technicalSpecs
  let technicalSpecs: TechnicalSpecGroup[] = []
  if (Array.isArray(parsed.technicalSpecs)) {
    technicalSpecs = parsed.technicalSpecs
  } else if (parsed.specs && typeof parsed.specs === 'object' && !Array.isArray(parsed.specs)) {
    // could be map of group -> specs, or flat map of name->value
    const specs = parsed.specs
    const groups: TechnicalSpecGroup[] = []
    let flat: TechnicalSpec[] = []
    for (const k of Object.keys(specs)) {
      const v = specs[k]
      if (Array.isArray(v)) {
        groups.push({ specGroup: k, specs: v.map((s: any) => ({ name: s?.name ?? s?.label ?? '', value: String(s?.value ?? s) })) })
      } else if (v && typeof v === 'object' && (v.name || v.value)) {
        groups.push({ specGroup: k, specs: [{ name: v.name ?? k, value: String(v.value ?? '') }] })
      } else {
        flat.push({ name: k, value: String(v) })
      }
    }
    if (flat.length) groups.push({ specGroup: 'Specifications', specs: flat })
    technicalSpecs = groups
  } else if (Array.isArray(parsed.specs)) {
    technicalSpecs = [{ specGroup: 'Specifications', specs: parsed.specs.map((s: any) => ({ name: s?.name ?? '', value: String(s?.value ?? s) })) }]
  }

  const productUsage = Array.isArray(parsed.productUsage)
    ? parsed.productUsage
    : (Array.isArray(parsed.tags) ? parsed.tags : (Array.isArray(parsed.usage) ? parsed.usage : []))

  const createdAt = parsed.createdAt || parsed.created_at || null
  const updatedAt = parsed.updatedAt || parsed.updated_at || new Date().toISOString()

  const seo: ProductSeo = parsed.seo || {
    robots: 'index, follow',
    ogImage: mainImage,
    canonical: '',
    description: parsed.shortDescription || parsed.itemDescription || '',
    title: parsed.name || '',
    lastUpdated: updatedAt
  }

  return {
    id,
    name: parsed.name || parsed.title || '',
    slug: parsed.slug || id,
    itemCode: parsed.itemCode || parsed.sku || parsed.code || parsed.item_code || '',
    itemCodes: parsed.itemCodes || {},
    itemDescription: parsed.itemDescription || parsed.description || parsed.shortDescription || parsed.name || '',
    shortDescription: parsed.shortDescription || parsed.description?.slice?.(0, 160) || '',
    productClass: parsed.productClass || parsed.category || parsed.class || '',
    productFamily: parsed.productFamily || parsed.category || parsed.family || parsed.product_class || '',
    productUsage,
    brand: parsed.brand || '',
    mainImage,
    baseImage: parsed.baseImage || '',
    galleryImages: Array.isArray(parsed.galleryImages) ? parsed.galleryImages : galleryImages,
    technicalSpecs,
    regularPrice: Number(parsed.regularPrice ?? parsed.price ?? parsed.regular_price ?? 0),
    salePrice: Number(parsed.salePrice ?? parsed.sale_price ?? 0),
    promoPrice: parsed.promoPrice ?? parsed.promo_price,
    status: parsed.status || (parsed.isActive === false ? 'draft' : (parsed.inStock === false ? 'out_of_stock' : 'published')),
    seo,
    websites: Array.isArray(parsed.websites) ? parsed.websites : [],
    createdAt: createdAt ? (typeof createdAt === 'string' ? createdAt : String(createdAt)) : null,
    updatedAt: typeof updatedAt === 'string' ? updatedAt : String(updatedAt)
  }
}

// ---------------------------------------------------------------------------
// Firestore reads are billed PER DOCUMENT, and the free (Spark) plan allows
// only ~50k reads/day. Loading the whole catalog on every request burns that
// quota fast, so we:
//   1. keep the cache on globalThis (survives dev hot-reloads),
//   2. share ONE in-flight request (the products page calls getProducts 3x at once),
//   3. use Next's data cache per Firestore page (revalidate), not no-store,
//   4. never cache a failed/partial load, and fall back to stale data on errors.
// ---------------------------------------------------------------------------
const CACHE_TTL = 10 * 60 * 1000 // in-memory freshness
const REVALIDATE_SECONDS = 10 * 60 // Next data cache freshness
const FAILURE_BACKOFF = 60 * 1000 // don't hammer Firestore right after a failure

const g = globalThis as unknown as {
  __ecoProducts?: { data: Product[]; ts: number }
  __ecoProductsInflight?: Promise<Product[]>
  __ecoProductsFailedAt?: number
}

async function loadFromFirestore(): Promise<Product[]> {
  const products: Product[] = []
  let pageToken: string | null = null

  do {
    const url = new URL(`https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/products`)
    url.searchParams.set('key', FIREBASE_API_KEY)
    url.searchParams.set('pageSize', '300')
    if (pageToken) url.searchParams.set('pageToken', pageToken)

    const res = await fetch(url.toString(), { next: { revalidate: REVALIDATE_SECONDS } })
    if (!res.ok) {
      // Throw so a partial/empty result is never cached as if it were complete
      throw new Error(`Firestore ${res.status}: ${(await res.text().catch(() => '')).slice(0, 200)}`)
    }
    const data = await res.json()
    const docs = data?.documents || []
    for (const doc of docs) {
      // filter inactive if field present
      if (doc.fields && doc.fields.isActive && doc.fields.isActive.booleanValue === false) continue
      products.push(parseDoc(doc))
    }
    pageToken = data?.nextPageToken || null
  } while (pageToken)

  return products
}

// Secondary source used only when Firestore is unavailable (e.g. its daily read
// quota is exhausted): the Jaries CMS public API serves the same catalog.
async function loadFromJaries(): Promise<Product[]> {
  if (!JARIES_API_URL || !JARIES_API_KEY) return []

  try {
    const url = new URL(JARIES_API_URL)
    url.searchParams.set('endpoint', 'products')

    const res = await fetch(url.toString(), {
      headers: { 'X-API-Key': JARIES_API_KEY },
      next: { revalidate: REVALIDATE_SECONDS }
    })
    if (!res.ok) {
      console.warn(`[products] Jaries fallback failed: ${res.status}`)
      return []
    }

    const data = await res.json()
    const items = Array.isArray(data?.data) ? data.data : []
    return items
      .filter((p: any) => p && p.name)
      .map((p: any) => buildProduct(p))
  } catch (err) {
    console.warn('[products] Jaries fallback error:', err instanceof Error ? err.message : err)
    return []
  }
}

async function fetchAllProducts(): Promise<Product[]> {
  const cached = g.__ecoProducts
  if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.data

  if (!FIREBASE_PROJECT_ID || !FIREBASE_API_KEY) {
    console.error('[products] Missing Firebase env vars')
    return cached?.data ?? []
  }

  // Recently failed (e.g. quota exceeded): serve stale data instead of retrying every request
  if (g.__ecoProductsFailedAt && Date.now() - g.__ecoProductsFailedAt < FAILURE_BACKOFF) {
    return cached?.data ?? []
  }

  // Share a single in-flight load between concurrent callers
  if (!g.__ecoProductsInflight) {
    g.__ecoProductsInflight = loadFromFirestore()
      .then(data => {
        g.__ecoProducts = { data, ts: Date.now() }
        g.__ecoProductsFailedAt = undefined
        return data
      })
      .catch(async err => {
        g.__ecoProductsFailedAt = Date.now()
        const message = err instanceof Error ? err.message : String(err)
        // 429/RESOURCE_EXHAUSTED means the project used up its daily Firestore read
        // quota — nothing to fix here, so log a warning instead of an error.
        const quotaHint = /429|RESOURCE_EXHAUSTED|quota/i.test(message) ? ' (Firestore daily read quota exceeded)' : ''
        console.warn(`[products] Firestore load failed${quotaHint}: ${message}`)

        const fallback = await loadFromJaries()
        if (fallback.length) {
          console.warn(`[products] Serving ${fallback.length} products from the Jaries CMS fallback`)
          g.__ecoProducts = { data: fallback, ts: Date.now() }
          return fallback
        }

        return g.__ecoProducts?.data ?? [] // stale data if we have it
      })
      .finally(() => {
        g.__ecoProductsInflight = undefined
      })
  }
  return g.__ecoProductsInflight
}

export interface ProductFilters {
  productFamily?: string
  brand?: string
  search?: string
  page?: number
  perPage?: number
}

export interface ProductsResult {
  products: Product[]
  total: number
}

export async function getProducts(filters: ProductFilters = {}): Promise<ProductsResult> {
  const { productFamily, brand, search, page = 1, perPage = 24 } = filters
  let products = await fetchAllProducts()

  if (productFamily) products = products.filter(p => p.productFamily === productFamily || p.productClass === productFamily)
  if (brand) products = products.filter(p => p.brand === brand)
  if (search) {
    const term = search.toLowerCase()
    products = products.filter(p =>
      p.name.toLowerCase().includes(term) ||
      p.itemDescription.toLowerCase().includes(term) ||
      p.productFamily.toLowerCase().includes(term) ||
      p.brand.toLowerCase().includes(term) ||
      p.itemCode.toLowerCase().includes(term)
    )
  }

  products.sort((a, b) => a.name.localeCompare(b.name))
  const total = products.length
  const start = (page - 1) * perPage
  return { products: products.slice(start, start + perPage), total }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const products = await fetchAllProducts()
  return products.find(p => p.slug === slug) ?? null
}

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  const products = await fetchAllProducts()
  return products
    .filter(p => p.mainImage && p.name.toLowerCase() !== 'test')
    .sort((a, b) => {
      const da = a.createdAt ? new Date(a.createdAt).getTime() : 0
      const db = b.createdAt ? new Date(b.createdAt).getTime() : 0
      return db - da
    })
    .slice(0, limit)
}

export async function getRelatedProducts(
  productFamily: string,
  excludeId: string,
  limit = 4
): Promise<Product[]> {
  if (!productFamily) return []
  const products = await fetchAllProducts()
  return products.filter(p => (p.productFamily === productFamily || p.productClass === productFamily) && p.id !== excludeId).slice(0, limit)
}

export function extractCategories(products: Product[]): string[] {
  return [...new Set(products.map(p => p.productFamily || p.productClass).filter(Boolean))].sort()
}

export function extractBrands(products: Product[]): string[] {
  return [...new Set(products.map(p => p.brand).filter(Boolean))].sort()
}