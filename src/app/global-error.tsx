'use client'
import { useEffect } from 'react'

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { console.error(error) }, [error])
  return (
    <html>
      <body>
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', fontFamily: 'sans-serif' }}>
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <p style={{ fontSize: '11px', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#aaa', marginBottom: '16px' }}>
              Something went wrong
            </p>
            <h1 style={{ fontSize: '42px', fontWeight: 300, fontStyle: 'italic', color: '#1a1a1a', marginBottom: '16px' }}>
              Unexpected Error
            </h1>
            <p style={{ fontSize: '14px', color: '#888', marginBottom: '32px', maxWidth: '360px', margin: '0 auto 32px', lineHeight: 1.6 }}>
              We're sorry, something went wrong. Please try again.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button onClick={reset} style={{ padding: '12px 28px', background: '#1a1a1a', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '13px', letterSpacing: '0.1em' }}>
                Try Again
              </button>
              <a href="/" style={{ padding: '12px 28px', border: '1px solid #1a1a1a', color: '#1a1a1a', textDecoration: 'none', fontSize: '13px', letterSpacing: '0.1em' }}>
                Back to Home
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
