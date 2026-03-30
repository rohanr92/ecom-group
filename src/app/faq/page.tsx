import CmsPage from '@/components/CmsPage'
import FaqFallback from '@/components/cms-fallbacks/faq'
export default function Page() {
  return <CmsPage slug="faq" pageTitle="Frequently Asked Questions" fallback={<FaqFallback />} />
}
 