import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'Size Guide', alternates: { canonical: 'https://solomonandsage.com/size-guide' } }

import CmsPage from '@/components/CmsPage'
import SizeguideFallback from '@/components/cms-fallbacks/size-guide'
export default function Page() {
  return <CmsPage slug="size-guide" pageTitle="Size Guide" fallback={<SizeguideFallback />} />
}
 