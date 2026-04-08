'use client'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

declare global {
  interface Window {
    dataLayer: any[]
  }
}

// Push to dataLayer safely
export function pushDataLayer(event: Record<string, any>) {
  if (typeof window !== 'undefined') {
    window.dataLayer = window.dataLayer || []
    window.dataLayer.push(event)
  }
}

// Page view tracker
export default function DataLayer() {
  const pathname = usePathname()

  useEffect(() => {
    window.dataLayer = window.dataLayer || []
    window.dataLayer.push({
      event: 'page_view',
      page_path: pathname,
      page_title: document.title,
    })
  }, [pathname])

  return null
}