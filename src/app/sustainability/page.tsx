import CmsPage from '@/components/CmsPage'
import SustainabilityFallback from '@/components/cms-fallbacks/sustainability'
export default function Page() {
  return <CmsPage slug="sustainability" pageTitle="Sustainability" fallback={<SustainabilityFallback />} />
}
 