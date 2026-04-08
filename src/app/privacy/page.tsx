import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'Privacy Policy', alternates: { canonical: 'https://solomonandsage.com/privacy' } }

// Save as: src/app/privacy/page.tsx  (REPLACE)
import CmsPage from '@/components/CmsPage'
import PrivacyFallback from '@/components/cms-fallbacks/privacy'
export default function Page() {
  return <CmsPage slug="privacy" pageTitle="Privacy Policy" pageSubtitle="Last updated March 30, 2026" fallback={<PrivacyFallback />} />
}