import CmsPage from '@/components/CmsPage'
import PressFallback from '@/components/cms-fallbacks/press'
export default function Page() {
  return <CmsPage slug="press" pageTitle="Press" fallback={<PressFallback />} />
}
 