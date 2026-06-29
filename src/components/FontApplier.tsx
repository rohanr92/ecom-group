'use client'
import { useEffect } from 'react'

export default function FontApplier() {
useEffect(() => {
  fetch('/api/cms/settings')
    .then(r => r.json())
    .then(d => {
      const f = d.settings?.font_settings
      if (!f) return
      const root = document.documentElement
      if (f.displayFont)     root.style.setProperty('--font-display', f.displayFont)
        // Dynamically load the font stylesheet
      const existingLink = document.getElementById('dynamic-font-link')
      if (!existingLink) {
        const link = document.createElement('link')
        link.id = 'dynamic-font-link'
        link.rel = 'stylesheet'
        link.href = `https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Jost:wght@300;400;500;600&display=swap`
        document.head.appendChild(link)
      }
      if (f.displaySizeBase) root.style.setProperty('--font-display-size', `${f.displaySizeBase}px`)
      if (f.displayWeight)   root.style.setProperty('--font-display-weight', f.displayWeight)
      if (f.displayStyle)    root.style.setProperty('--font-display-style', f.displayStyle)
      if (f.bodyFont)        root.style.setProperty('--font-body', f.bodyFont)
      if (f.bodySizeBase) {
  root.style.setProperty('--font-body-size', `${f.bodySizeBase}px`)
  root.style.fontSize = `${(Number(f.bodySizeBase) / 14) * 100}%`
}
      if (f.bodyWeight)      root.style.setProperty('--font-body-weight', f.bodyWeight)
      if (f.bodyTracking)    root.style.setProperty('--font-body-tracking', `${f.bodyTracking}em`)
      if (f.navFont)         root.style.setProperty('--font-nav', f.navFont || f.bodyFont)
      if (f.navSize)         root.style.setProperty('--font-nav-size', `${f.navSize}px`)
      if (f.navTracking)     root.style.setProperty('--font-nav-tracking', `${f.navTracking}em`)
      // Also apply body styles directly for immediate effect
      document.body.style.fontFamily = f.bodyFont || ''
      document.body.style.fontSize = f.bodySizeBase ? `${f.bodySizeBase}px` : ''
      document.body.style.fontWeight = f.bodyWeight || ''
      document.body.style.letterSpacing = f.bodyTracking ? `${f.bodyTracking}em` : ''
    })
    .catch(() => {})
}, [])

  return null
}
