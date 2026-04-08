// Save as: src/components/CmsPage.tsx  (REPLACE)
'use client'
import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import CmsPageRenderer from '@/components/CmsPageRenderer'

interface Props {
  slug: string
  pageTitle: string
  pageSubtitle?: string
  fallback: React.ReactNode
}

export default function CmsPage({ slug, pageTitle, pageSubtitle, fallback }: Props) {
  const [sections, setSections] = useState<any[] | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/cms?slug=${encodeURIComponent(slug)}`)
      .then(r => r.json())
      .then(d => {
        const secs = d?.page?.sections
        setSections(Array.isArray(secs) && secs.length > 0 ? secs : null)
      })
      .catch(() => setSections(null))
      .finally(() => setLoading(false))
  }, [slug])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#fff' }}>
      <Navbar />
      <main style={{ flex: 1, minHeight: '70vh' }}>

        {/* ── Page header — clean like Nordstrom/Free People ── */}


        {/* ── Content ── */}
        <div className="max-container" style={{ padding: 'clamp(40px,2vw,80px) clamp(16px,4vw,60px)' }}>
          <div style={{ maxWidth: '780px', margin: '0 auto' }}>
            {loading ? (
              // Skeleton
             <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '680px', margin: '0 auto' }}>
                {[100, 60, 80, 45, 70].map((w, i) => (
                  <div key={i} style={{ height: i % 3 === 0 ? '20px' : '13px', width: `${w}%`, background: '#f0ece6', borderRadius: '3px' }} />
                ))}
              </div>
            ) : sections ? (
              // ✅ CMS content from admin backend
              <CmsPageRenderer sections={sections} />
            ) : (
              // Fallback static content (shown until admin saves something)
              fallback
            )}
          </div>
          </div>
      </main>
      <Footer />
    </div>
  )
}