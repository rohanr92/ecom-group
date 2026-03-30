import CmsPage from '@/components/CmsPage'
import ShippingFallback from '@/components/cms-fallbacks/shipping'
export default function Page() {
  return <CmsPage slug="shipping"  fallback={<ShippingFallback />} />
}
