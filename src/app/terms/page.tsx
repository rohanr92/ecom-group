import CmsPage from '@/components/CmsPage'
import TermsFallback from '@/components/cms-fallbacks/terms'
export default function Page() {
  return <CmsPage slug="terms" pageTitle="Terms of Service" pageSubtitle="Last updated March 30, 2026" fallback={<TermsFallback />} />
}
 