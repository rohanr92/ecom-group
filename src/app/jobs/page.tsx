// Save as: src/app/jobs/page.tsx  (REPLACE)
import CmsPage from '@/components/CmsPage'
import JobsFallback from '@/components/cms-fallbacks/jobs'
export default function Page() {
  return <CmsPage slug="jobs" pageTitle="Careers at Solomon Lawrence" pageSubtitle="Join our team" fallback={<JobsFallback />} />
}