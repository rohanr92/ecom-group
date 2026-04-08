import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Page Not Found',
  description: 'The page you are looking for could not be found.',
}

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1 flex items-center justify-center">
        <div style={{ textAlign: 'center', padding: '80px 20px' }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#aaa', marginBottom: '16px' }}>
            404
          </p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 300, fontStyle: 'italic', color: '#1a1a1a', marginBottom: '16px', lineHeight: 1.2 }}>
            Page Not Found
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: '#888', marginBottom: '32px', maxWidth: '360px', margin: '0 auto 32px', lineHeight: 1.6 }}>
            The page you are looking for doesn't exist or has been moved.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/" className="btn-solid">
              Back to Home
            </Link>
            <Link href="/collections" className="btn-outline">
              Shop Collections
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
