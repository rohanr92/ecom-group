import Link from 'next/link'

interface EditorialBannerProps {
  title: string
  subtitle?: string
  ctaText?: string
  ctaHref?: string
  image: string
  align?: 'left' | 'right' | 'center'
  dark?: boolean
}

export default function EditorialBanner({
  title,
  subtitle,
  ctaText = 'Shop Now',
  ctaHref = '/collections/all',
  image,
  align = 'left',
  dark = true,
}: EditorialBannerProps) {
  const textColor = dark ? '#fff' : 'var(--color-charcoal)'
  const alignMap = { left: 'flex-start', right: 'flex-end', center: 'center' }
  const textAlignMap = { left: 'left' as const, right: 'right' as const, center: 'center' as const }

  return (
   <section style={{ position: 'relative', minHeight: 'clamp(300px, 45vw, 580px)' }}>
      {/* Background */}
     <img
  src={image}
  alt={title}
  style={{
    position: 'absolute', inset: 0,
    width: '100%', height: '100%',
    objectFit: 'cover',
    overflow: 'hidden',
    filter: dark ? 'brightness(0.72)' : 'brightness(0.95)',
  }}
/>

      {/* Optional gradient */}
      {dark && (
        <div style={{
          position: 'absolute', inset: 0,
          background: align === 'left'
            ? 'linear-gradient(90deg, rgba(0,0,0,0.45) 0%, transparent 65%)'
            : 'linear-gradient(270deg, rgba(0,0,0,0.45) 0%, transparent 65%)',
        }} />
      )}

      {/* Content */}
      <div
        className="max-container"
        style={{
          position: 'relative', zIndex: 2,
          minHeight: 'clamp(300px, 45vw, 580px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: alignMap[align],
          padding: 'clamp(40px, 6vw, 80px) clamp(20px, 4vw, 60px)',
        }}
      >
        <div style={{ maxWidth: '480px', textAlign: textAlignMap[align] }}>
          {subtitle && (
            <div style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'clamp(10px, 1.1vw, 12px)',
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              color: dark ? 'rgba(255,255,255,0.75)' : 'var(--color-mid)',
              marginBottom: '12px',
            }}>
              {subtitle}
            </div>
          )}
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(32px, 5vw, 68px)',
            fontWeight: 300,
            color: textColor,
            lineHeight: 1.1,
            fontStyle: 'italic',
            marginBottom: '20px',
          }}>
            {title}
          </h2>
          <Link href={ctaHref} className="btn-outline" style={{
            borderColor: dark ? '#fff' : undefined,
            color: dark ? '#fff' : undefined,
          }}>
            {ctaText}
          </Link>
        </div>
      </div>
    </section>
  )
}