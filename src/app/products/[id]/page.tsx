import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import ProductPageClient from './ProductPageClient'

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params

  const product = await prisma.product.findFirst({
    where: { OR: [{ slug: id }, { id }] },
    select: {
      name: true,
      description: true,
      price: true,
      category: true,
      images: true,
      slug: true,
    },
  })

  if (!product) return { title: 'Product Not Found' }

  return {
  title: product.name,
  description: product.description?.slice(0, 160) ?? `Shop ${product.name} from Solomon & Sage. Premium ${product.category} starting at $${Number(product.price).toFixed(2)}.`,
  alternates: {
    canonical: `https://solomonandsage.com/products/${product.slug ?? product.id}`,
  },
    openGraph: {
      title: `${product.name} | Solomon & Sage`,
      description: product.description?.slice(0, 160) ?? `Shop ${product.name} from Solomon & Sage.`,
      images: product.images?.[0] ? [
        {
          url: product.images[0],
          width: 800,
          height: 1000,
          alt: product.name,
        }
      ] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} | Solomon & Sage`,
      images: product.images?.[0] ? [product.images[0]] : [],
    },
  }
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params

  const product = await prisma.product.findFirst({
    where: { OR: [{ slug: id }, { id }] },
    select: { name: true, description: true, price: true, images: true, slug: true },
  })

  const jsonLd = product ? {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description ?? '',
    image: product.images ?? [],
    brand: { '@type': 'Brand', name: 'Solomon & Sage' },
    offers: {
      '@type': 'Offer',
      price: Number(product.price).toFixed(2),
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      url: `https://solomonandsage.com/products/${product.slug ?? product.id}`,
    },
  } : null

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <ProductPageClient id={id} />
    </>
  )
}