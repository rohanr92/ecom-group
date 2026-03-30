// Save as: src/app/about/page.tsx  (REPLACE entire file)
import CmsPage from '@/components/CmsPage'
import AboutFallback from '@/components/cms-fallbacks/about'
export default function Page() {
  return <CmsPage slug="about" pageTitle="Our Story" pageSubtitle="Established 2018 · Los Angeles, California" fallback={<AboutFallback />} />
}