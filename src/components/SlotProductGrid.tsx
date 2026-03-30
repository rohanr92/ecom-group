// Save as: src/components/SlotProductGrid.tsx (NEW FILE)
// Fetches products from a collection slot then renders using the ORIGINAL ProductGrid
// — no design changes whatsoever
'use client'

import { useEffect, useState } from 'react'
import ProductGrid from '@/components/ProductGrid'

interface Props {
  title:       string
  subtitle?:   string
  slot:        string
  limit?:      number
  viewAllHref: string
}

export default function SlotProductGrid({ title, subtitle, slot, limit = 10, viewAllHref }: Props) {
  const [products, setProducts] = useState<any[]>([])

  useEffect(() => {
    fetch(`/api/collections/slot?slot=${slot}&limit=${limit}`)
      .then(r => r.json())
      .then(d => {
        const mapped = (d.products ?? []).map((p: any) => ({
          id:    p.id,
          name:  p.name,
          price: Number(p.price),
          image: p.images?.[0] ?? '',
          badge: p.badge ?? undefined,
          href:  `/products/${p.slug ?? p.id}`,
        }))
        setProducts(mapped)
      })
      .catch(() => setProducts([]))
  }, [slot, limit])

  // Don't render until products load — keeps layout stable
  if (products.length === 0) return null

  return (
    <ProductGrid
      title={title}
      subtitle={subtitle}
      products={products}
      viewAllHref={viewAllHref}
    />
  )
}