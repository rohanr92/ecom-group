import type { Metadata } from 'next'
import CmsPage from '@/components/CmsPage'
import JobsFallback from '@/components/cms-fallbacks/jobs'

export const metadata: Metadata = {
  title: 'Careers',
  alternates: { canonical: 'https://solomonandsage.com/jobs' },
}

export default function Page() {
  return <CmsPage slug="jobs" pageTitle="Careers at Solomon & Sage" pageSubtitle="Join our team" fallback={<JobsFallback />} />
}