import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'Contact Us', alternates: { canonical: 'https://solomonandsage.com/contact' } }

import CmsPage from '@/components/CmsPage'
import ContactFallback from '@/components/cms-fallbacks/contact'
export default function Page() {
  return <CmsPage slug="contact" pageTitle="Contact Us" fallback={<ContactFallback />} />
}
 