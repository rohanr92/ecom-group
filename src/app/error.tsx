'use client'
import Link from 'next/link'
import { useEffect } from 'react'

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { console.error(error) }, [error])
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <main className="flex-1 flex items-center justify-center">
        <div style={{ textAlign: 'center', padding: '80px 20px' }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#aaa', marginBottom: '16px' }}>
            Something went wrong
          </p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 300, fontStyle: 'italic', color: '#1a1a1a', marginBottom: '16px', lineHeight: 1.2 }}>
            Unexpected Error
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: '#888', marginBottom: '32px', maxWidth: '360px', margin: '0 auto 32px', lineHeight: 1.6 }}>
            We're sorry, something went wrong on our end. Please try again.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={reset} className="btn-solid">Try Again</button>
            <Link href="/" className="btn-outline">Back to Home</Link>
          </div>
        </div>
      </main>
    </div>
  )
}
