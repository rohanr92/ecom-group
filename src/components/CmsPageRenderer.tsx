// Save as: src/components/CmsPageRenderer.tsx  (CREATE or REPLACE)
import Link from 'next/link'

interface Section { id: string; type: string; content: any }

export default function CmsPageRenderer({ sections }: { sections: Section[] }) {
  if (!sections?.length) return null
  return (
    <div>
      {sections.map(s => <Block key={s.id} s={s} />)}
    </div>
  )
}

function Block({ s }: { s: Section }) {
  const c = s.content ?? {}

  if (s.type === 'text') return (
    <div style={{ paddingBottom: '40px', marginBottom: '40px', borderBottom: '1px solid #f0ece6' }}>
      {c.heading && <h2 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(22px,3vw,32px)', fontWeight:400, fontStyle:'italic', color:'var(--color-charcoal)', marginBottom:'14px' }}>{c.heading}</h2>}
      {c.body && <p style={{ fontFamily:'var(--font-body)', fontSize:'14px', color:'var(--color-mid)', lineHeight:1.9, maxWidth:'680px' }}>{c.body}</p>}
    </div>
  )

  if (s.type === 'rich_text') return (
    <div style={{ paddingBottom:'40px', marginBottom:'40px', borderBottom:'1px solid #f0ece6', fontFamily:'var(--font-body)', fontSize:'14px', color:'var(--color-mid)', lineHeight:1.9, maxWidth:'680px' }}
      dangerouslySetInnerHTML={{ __html: c.body ?? '' }} />
  )

  if (s.type === 'hero') return (
    <div style={{ position:'relative', minHeight:'clamp(260px,38vw,440px)', textAlign:'center', overflow:'hidden', marginBottom:'40px' }}>
      {c.image && <img src={c.image} alt={c.title ?? ''} style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', filter:'brightness(0.6)' }} />}
      <div style={{
        position:'relative',
        zIndex:2,
        display:'flex',
        flexDirection:'column',
        justifyContent:'center',
        alignItems:'center', // ✅ added
        textAlign:'center',  // ✅ added
        minHeight:'clamp(260px,38vw,440px)',
        padding:'clamp(32px,5vw,64px) clamp(20px,4vw,52px)'
      }}>
        {c.subtitle && <p style={{ fontFamily:'var(--font-body)', fontSize:'11px', letterSpacing:'0.3em', textTransform:'uppercase', color:'rgba(255,255,255,0.75)', marginBottom:'10px' }}>{c.subtitle}</p>}
        {c.title && <h2 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(26px,4.5vw,54px)', fontWeight:300, fontStyle:'italic', color:'#fff', lineHeight:1.1, marginBottom:'20px', maxWidth:'440px' }}>{c.title}</h2>}
        {c.ctaText && <Link href={c.ctaHref ?? '#'} className="btn-outline" style={{ borderColor:'#fff', color:'#fff', alignSelf:'center' }}>{c.ctaText}</Link>}
      </div>
    </div>
  )

  if (s.type === 'image') return (
    <div style={{ paddingBottom:'40px', marginBottom:'40px', borderBottom:'1px solid #f0ece6' }}>
      {c.src && <figure style={{ margin:0 }}>
        <img src={c.src} alt={c.alt ?? ''} style={{ width:'100%', maxHeight:'460px', objectFit:'cover', display:'block' }} />
        {c.caption && <figcaption style={{ fontFamily:'var(--font-body)', fontSize:'12px', color:'var(--color-mid)', marginTop:'8px', fontStyle:'italic' }}>{c.caption}</figcaption>}
      </figure>}
    </div>
  )

  if (s.type === 'columns') return (
    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:'48px', paddingBottom:'40px', marginBottom:'40px', borderBottom:'1px solid #f0ece6' }}>
      <p style={{ fontFamily:'var(--font-body)', fontSize:'14px', color:'var(--color-mid)', lineHeight:1.9 }}>{c.left}</p>
      <p style={{ fontFamily:'var(--font-body)', fontSize:'14px', color:'var(--color-mid)', lineHeight:1.9 }}>{c.right}</p>
    </div>
  )

  if (s.type === 'faq') return (
    <div style={{ paddingBottom:'40px', marginBottom:'40px', borderBottom:'1px solid #f0ece6' }}>
      {(c.items ?? []).map((item: any, i: number) => (
        <details key={i} style={{ borderBottom:'1px solid #e8e4de' }}>
          <summary style={{ padding:'16px 0', fontFamily:'var(--font-body)', fontSize:'14px', color:'var(--color-charcoal)', fontWeight:500, cursor:'pointer', listStyle:'none', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            {item.q}<span style={{ fontSize:'20px', fontWeight:300, marginLeft:'16px', flexShrink:0 }}>+</span>
          </summary>
          <p style={{ padding:'0 0 16px', fontFamily:'var(--font-body)', fontSize:'13px', color:'var(--color-mid)', lineHeight:1.8, margin:0 }}>{item.a}</p>
        </details>
      ))}
    </div>
  )

  if (s.type === 'cta') return (
    <div style={{ background:'var(--color-cream)', padding:'clamp(36px,5vw,64px)', textAlign:'center', marginBottom:'40px' }}>
      {c.heading && <h2 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(22px,3vw,36px)', fontWeight:300, fontStyle:'italic', color:'var(--color-charcoal)', marginBottom:'12px' }}>{c.heading}</h2>}
      {c.body && <p style={{ fontFamily:'var(--font-body)', fontSize:'13px', color:'var(--color-mid)', lineHeight:1.7, maxWidth:'480px', margin:'0 auto 20px' }}>{c.body}</p>}
      {c.buttonText && <Link href={c.buttonHref ?? '#'} className="btn-solid">{c.buttonText}</Link>}
    </div>
  )

  return null
}