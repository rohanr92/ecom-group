import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'Shipping & Delivery', alternates: { canonical: 'https://solomonandsage.com/shipping' } }

import CmsPage from '@/components/CmsPage'
import ShippingFallback from '@/components/cms-fallbacks/shipping'
export default function Page() {
  return <CmsPage slug="shipping"  fallback={<ShippingFallback />} />
}
