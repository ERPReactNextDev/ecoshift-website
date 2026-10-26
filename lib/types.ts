export interface TechnicalSpec {
  name: string
  value: string
}

export interface TechnicalSpecGroup {
  specGroup: string
  specs: TechnicalSpec[]
}

export interface ProductSeo {
  robots: string
  ogImage: string
  canonical: string
  description: string
  title: string
  lastUpdated: string
}

export interface Product {
  id: string
  name: string
  slug: string
  itemCode: string
  itemCodes: Record<string, string>
  itemDescription: string
  shortDescription: string
  productClass: string
  productFamily: string
  productUsage: string[]
  brand: string
  mainImage: string
  baseImage: string
  galleryImages: string[]
  technicalSpecs: TechnicalSpecGroup[]
  regularPrice: number
  salePrice: number
  promoPrice?: number
  status: string
  seo: ProductSeo
  websites: string[]
  createdAt: string | null
  updatedAt: string
}

export interface QuoteItem {
  productId: string
  productName: string
  itemCode: string
  quantity: number
  lineNote: string
  slug: string
}

export interface QuoteSubmission {
  customerName: string
  company?: string
  email: string
  phone?: string
  message?: string
  items: QuoteItem[]
}

export interface Quotation {
  id: string
  reference: string
  customer_name: string
  company: string | null
  email: string
  phone: string | null
  message: string | null
  status: 'pending' | 'reviewed' | 'quoted' | 'won' | 'lost'
  internal_notes: string | null
  created_at: string
  updated_at: string
}

export interface QuotationItem {
  id: string
  quotation_id: string
  product_id: string
  product_name: string
  sku: string | null
  quantity: number
  unit: string | null
  line_note: string | null
  created_at: string
}

export interface ContactSubmission {
  id: string
  name: string
  email: string
  phone: string | null
  subject: string | null
  message: string
  branch: string | null
  created_at: string
}

export interface Profile {
  id: string
  full_name: string | null
  role: 'customer' | 'staff' | 'admin'
  created_at: string
}

export interface BlogPost {
  slug: string
  title: string
  excerpt: string
  content: string
  author: string
  publishedAt: string
  tags: string[]
  ogImage?: string
}

export interface BreadcrumbItem {
  label: string
  href?: string
}
