import CmsPage from '@/components/CmsPage'
import ContactFallback from '@/components/cms-fallbacks/contact'
export default function Page() {
  return <CmsPage slug="contact" pageTitle="Contact Us" fallback={<ContactFallback />} />
}
 