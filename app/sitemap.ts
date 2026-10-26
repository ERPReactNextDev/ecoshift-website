import type { MetadataRoute } from 'next'
import { getProducts } from '@/lib/products'
import { blogPosts } from '@/lib/blog-data'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ecoshiftcorp.com'
  const entries: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, changeFrequency: 'daily', priority: 1.0 },
    { url: `${siteUrl}/products`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${siteUrl}/about`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${siteUrl}/projects`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${siteUrl}/blog`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${siteUrl}/contact`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${siteUrl}/branches`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${siteUrl}/careers`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${siteUrl}/privacy`, changeFrequency: 'yearly', priority: 0.3 },
  ]
  try {
    const { products } = await getProducts({ perPage: 500 })
    products.forEach(p => entries.push({ url: `${siteUrl}/products/${p.slug}`, changeFrequency: 'weekly', priority: 0.8 }))
  } catch (e) {
    console.error('[sitemap] products error:', e)
  }
  blogPosts.forEach(p => entries.push({ url: `${siteUrl}/blog/${p.slug}`, lastModified: new Date(p.publishedAt), changeFrequency: 'monthly', priority: 0.6 }))
  return entries
}