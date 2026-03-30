// Save as: src/app/returns/page.tsx  (REPLACE)
import CmsPage from '@/components/CmsPage'
import ReturnsFallback from '@/components/cms-fallbacks/returns'
export default function Page() {
  return <CmsPage slug="returns" pageTitle="Returns & Exchanges" pageSubtitle="Free returns within 30 days" fallback={<ReturnsFallback />} />
}