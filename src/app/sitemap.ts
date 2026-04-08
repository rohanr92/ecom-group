import type { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://solomonandsage.com'

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, priority: 1.0, changeFrequency: 'daily' },
    { url: `${baseUrl}/collections`, priority: 0.9, changeFrequency: 'daily' },
    { url: `${baseUrl}/about`, priority: 0.7, changeFrequency: 'monthly' },
    { url: `${baseUrl}/contact`, priority: 0.7, changeFrequency: 'monthly' },
    { url: `${baseUrl}/shipping`, priority: 0.6, changeFrequency: 'monthly' },
    { url: `${baseUrl}/returns`, priority: 0.6, changeFrequency: 'monthly' },
    { url: `${baseUrl}/faq`, priority: 0.6, changeFrequency: 'monthly' },
    { url: `${baseUrl}/size-guide`, priority: 0.6, changeFrequency: 'monthly' },
    { url: `${baseUrl}/privacy`, priority: 0.4, changeFrequency: 'yearly' },
    { url: `${baseUrl}/terms`, priority: 0.4, changeFrequency: 'yearly' },
    { url: `${baseUrl}/sustainability`, priority: 0.5, changeFrequency: 'monthly' },
    { url: `${baseUrl}/press`, priority: 0.5, changeFrequency: 'monthly' },
    { url: `${baseUrl}/jobs`, priority: 0.5, changeFrequency: 'weekly' },
    { url: `${baseUrl}/affiliate`, priority: 0.5, changeFrequency: 'monthly' },
    { url: `${baseUrl}/gift-cards`, priority: 0.6, changeFrequency: 'monthly' },
    { url: `${baseUrl}/influencers`, priority: 0.5, changeFrequency: 'monthly' },
    { url: `${baseUrl}/track`, priority: 0.5, changeFrequency: 'monthly' },
    { url: `${baseUrl}/accessibility`, priority: 0.3, changeFrequency: 'yearly' },
    { url: `${baseUrl}/ca-privacy`, priority: 0.3, changeFrequency: 'yearly' },
  ]

  // Fetch all active products
  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: { slug: true, updatedAt: true },
    orderBy: { updatedAt: 'desc' },
  })

  const productPages: MetadataRoute.Sitemap = products.map(p => ({
    url: `${baseUrl}/products/${p.slug}`,
    lastModified: p.updatedAt,
    priority: 0.8,
    changeFrequency: 'weekly' as const,
  }))

  // Fetch all active collections
  const collections = await prisma.collection.findMany({
    where: { isActive: true },
    select: { slug: true, updatedAt: true },
  })

  const collectionPages: MetadataRoute.Sitemap = collections.map(c => ({
    url: `${baseUrl}/collections/${c.slug}`,
    lastModified: c.updatedAt,
    priority: 0.85,
    changeFrequency: 'daily' as const,
  }))

  return [...staticPages, ...collectionPages, ...productPages]
}