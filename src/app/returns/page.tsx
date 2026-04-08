import type { Metadata } from 'next'
import CmsPage from '@/components/CmsPage'
import ReturnsFallback from '@/components/cms-fallbacks/returns'

export const metadata: Metadata = {
  title: 'Returns & Exchanges',
  alternates: { canonical: 'https://solomonandsage.com/returns' },
}

export default function Page() {
  return <CmsPage slug="returns" pageTitle="Returns & Exchanges" pageSubtitle="Free returns within 30 days" fallback={<ReturnsFallback />} />
}