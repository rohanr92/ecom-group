'use client'
import { useState, useEffect } from 'react'
import { Save, AlertCircle, CheckCircle2, ChevronDown, ChevronUp, Monitor } from 'lucide-react'

function Toast({ msg, type }: { msg: string; type: 'success' | 'error' }) {
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-lg shadow-xl text-[13px] font-medium
      ${type === 'success' ? 'bg-[#4a6741] text-white' : 'bg-red-600 text-white'}`}>
      {type === 'success' ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
      {msg}
    </div>
  )
}

function Section({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="bg-white border border-gray-200">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left cursor-pointer bg-transparent border-none">
        <span className="text-[14px] font-semibold text-[#1a1a1a]">{title}</span>
        {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
      </button>
      {open && <div className="px-5 pb-5 border-t border-gray-100 pt-4 space-y-4">{children}</div>}
    </div>
  )
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[11px] font-semibold tracking-widest uppercase text-gray-500 mb-1.5">{label}</label>
      {hint && <p className="text-[11px] text-gray-400 mb-1.5">{hint}</p>}
      {children}
    </div>
  )
}

const input = "w-full px-3 py-2 border border-gray-300 text-[13px] outline-none focus:border-[#1a1a1a] transition-colors"
const textarea = "w-full px-3 py-2 border border-gray-300 text-[13px] outline-none focus:border-[#1a1a1a] transition-colors resize-none"

export default function ThemePage() {
  const [toast,   setToast]   = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const [saving,  setSaving]  = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Promo bar
  const [promoText,    setPromoText]    = useState('Spring is here!')
  const [promoMiddle,  setPromoMiddle]  = useState('FREE SHIPPING FOR YOUR EVERY PURCHASE WHEN YOU BUY AN ITEM')
  const [promoCta,     setPromoCta]     = useState('SHOP NEW ARRIVALS')
  const [promoCtaHref, setPromoCtaHref] = useState('/collections/new-arrivals')
  const [promoActive,  setPromoActive]  = useState(true)

  // Hero banner
  const [heroLeftImage,    setHeroLeftImage]    = useState('')
  const [heroLeftTitle,    setHeroLeftTitle]    = useState('Wear-to-work arrivals for spring')
  const [heroLeftSubtitle, setHeroLeftSubtitle] = useState('Slip into something a little more chic—these new season styles make every day a special occasion.')
  const [heroLeftCta,      setHeroLeftCta]      = useState('Shop Now')
  const [heroLeftCtaHref,  setHeroLeftCtaHref]  = useState('/collections/new-arrivals')
  const [heroTopImage,     setHeroTopImage]     = useState('')
  const [heroTopLabel,     setHeroTopLabel]     = useState('Shop Essentials')
  const [heroTopHref,      setHeroTopHref]      = useState('/collections/essentials')
  const [heroBottomImage,  setHeroBottomImage]  = useState('')
  const [heroBottomLabel,  setHeroBottomLabel]  = useState('Shop Accessories')
  const [heroBottomHref,   setHeroBottomHref]   = useState('/collections/accessories')

  // Promo video section
  const [videoUrl,       setVideoUrl]       = useState('/videos/promo.mp4')
  const [videoTitle,     setVideoTitle]     = useState('Limited-Edition Tote Bag')
  const [videoSubtitle,  setVideoSubtitle]  = useState('With any $500+ purchase')
  const [videoCta,       setVideoCta]       = useState('Shop Now')
  const [videoCtaHref,   setVideoCtaHref]   = useState('/collections/all')
  const [videoNote,      setVideoNote]      = useState('*While supplies last. One per order.')

  // Editorial banner 1 (Spring Shirts)
  const [ed1Title,    setEd1Title]    = useState('Spring Shirts')
  const [ed1Subtitle, setEd1Subtitle] = useState('New season')
  const [ed1Cta,      setEd1Cta]      = useState('Shop Collection')
  const [ed1CtaHref,  setEd1CtaHref]  = useState('/collections/shirts')
  const [ed1Image,    setEd1Image]    = useState('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1400&auto=format&fit=crop&q=80')
  const [ed1Align,    setEd1Align]    = useState('left')
  const [ed1Dark,     setEd1Dark]     = useState(true)

  // Editorial banner 2 (Vacation Edit)
  const [ed2Title,    setEd2Title]    = useState('The Vacation Edit')
  const [ed2Subtitle, setEd2Subtitle] = useState('Curated for travel')
  const [ed2Cta,      setEd2Cta]      = useState('Shop Vacation')
  const [ed2CtaHref,  setEd2CtaHref]  = useState('/collections/vacation')
  const [ed2Image,    setEd2Image]    = useState('https://images.unsplash.com/photo-1570464197285-9949814674a7?w=1400&auto=format&fit=crop&q=80')
  const [ed2Align,    setEd2Align]    = useState('right')
  const [ed2Dark,     setEd2Dark]     = useState(true)

  // Section titles
  const [newArrivalsTitle,    setNewArrivalsTitle]    = useState('New Arrivals For You')
  const [bestSellersTitle,    setBestSellersTitle]    = useState('Best Sellers')
  const [bestSellersSubtitle, setBestSellersSubtitle] = useState('Community favorites')
  const [alsoInterestTitle,   setAlsoInterestTitle]   = useState('Also of Interest')

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    fetch('/api/admin/cms/settings', { credentials: 'include' })
      .then(r => r.json())
      .then(d => {
        const s = d.settings ?? {}
        if (s.promo_bar) {
          setPromoText(s.promo_bar.text ?? promoText)
          setPromoMiddle(s.promo_bar.middle ?? promoMiddle)
          setPromoCta(s.promo_bar.cta ?? promoCta)
          setPromoCtaHref(s.promo_bar.ctaHref ?? promoCtaHref)
          setPromoActive(s.promo_bar.active ?? true)
        }
        if (s.hero_banner) {
          setHeroLeftImage(s.hero_banner.leftImage ?? '')
          setHeroLeftTitle(s.hero_banner.leftTitle ?? heroLeftTitle)
          setHeroLeftSubtitle(s.hero_banner.leftSubtitle ?? heroLeftSubtitle)
          setHeroLeftCta(s.hero_banner.leftCta ?? heroLeftCta)
          setHeroLeftCtaHref(s.hero_banner.leftCtaHref ?? heroLeftCtaHref)
          setHeroTopImage(s.hero_banner.topImage ?? '')
          setHeroTopLabel(s.hero_banner.topLabel ?? heroTopLabel)
          setHeroTopHref(s.hero_banner.topHref ?? heroTopHref)
          setHeroBottomImage(s.hero_banner.bottomImage ?? '')
          setHeroBottomLabel(s.hero_banner.bottomLabel ?? heroBottomLabel)
          setHeroBottomHref(s.hero_banner.bottomHref ?? heroBottomHref)
        }
        if (s.promo_video) {
          setVideoUrl(s.promo_video.url ?? videoUrl)
          setVideoTitle(s.promo_video.title ?? videoTitle)
          setVideoSubtitle(s.promo_video.subtitle ?? videoSubtitle)
          setVideoCta(s.promo_video.cta ?? videoCta)
          setVideoCtaHref(s.promo_video.ctaHref ?? videoCtaHref)
          setVideoNote(s.promo_video.note ?? videoNote)
        }
        if (s.editorial_1) {
          setEd1Title(s.editorial_1.title ?? ed1Title)
          setEd1Subtitle(s.editorial_1.subtitle ?? ed1Subtitle)
          setEd1Cta(s.editorial_1.cta ?? ed1Cta)
          setEd1CtaHref(s.editorial_1.ctaHref ?? ed1CtaHref)
          setEd1Image(s.editorial_1.image ?? ed1Image)
          setEd1Align(s.editorial_1.align ?? ed1Align)
          setEd1Dark(s.editorial_1.dark ?? ed1Dark)
        }
        if (s.editorial_2) {
          setEd2Title(s.editorial_2.title ?? ed2Title)
          setEd2Subtitle(s.editorial_2.subtitle ?? ed2Subtitle)
          setEd2Cta(s.editorial_2.cta ?? ed2Cta)
          setEd2CtaHref(s.editorial_2.ctaHref ?? ed2CtaHref)
          setEd2Image(s.editorial_2.image ?? ed2Image)
          setEd2Align(s.editorial_2.align ?? ed2Align)
          setEd2Dark(s.editorial_2.dark ?? ed2Dark)
        }
        if (s.section_titles) {
          setNewArrivalsTitle(s.section_titles.newArrivals ?? newArrivalsTitle)
          setBestSellersTitle(s.section_titles.bestSellers ?? bestSellersTitle)
          setBestSellersSubtitle(s.section_titles.bestSellersSubtitle ?? bestSellersSubtitle)
          setAlsoInterestTitle(s.section_titles.alsoInterest ?? alsoInterestTitle)
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const save = async (key: string, value: any) => {
    setSaving(key)
    try {
      const res = await fetch('/api/admin/cms/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ key, value }),
      })
      if (res.ok) showToast('Saved successfully', 'success')
      else showToast('Failed to save', 'error')
    } catch {
      showToast('Failed to save', 'error')
    }
    setSaving(null)
  }

  const SaveBtn = ({ sectionKey }: { sectionKey: string }) => (
    <button onClick={() => {
      if (sectionKey === 'promo_bar') save('promo_bar', { text: promoText, middle: promoMiddle, cta: promoCta, ctaHref: promoCtaHref, active: promoActive })
      if (sectionKey === 'hero_banner') save('hero_banner', { leftImage: heroLeftImage, leftTitle: heroLeftTitle, leftSubtitle: heroLeftSubtitle, leftCta: heroLeftCta, leftCtaHref: heroLeftCtaHref, topImage: heroTopImage, topLabel: heroTopLabel, topHref: heroTopHref, bottomImage: heroBottomImage, bottomLabel: heroBottomLabel, bottomHref: heroBottomHref })
      if (sectionKey === 'promo_video') save('promo_video', { url: videoUrl, title: videoTitle, subtitle: videoSubtitle, cta: videoCta, ctaHref: videoCtaHref, note: videoNote })
      if (sectionKey === 'editorial_1') save('editorial_1', { title: ed1Title, subtitle: ed1Subtitle, cta: ed1Cta, ctaHref: ed1CtaHref, image: ed1Image, align: ed1Align, dark: ed1Dark })
      if (sectionKey === 'editorial_2') save('editorial_2', { title: ed2Title, subtitle: ed2Subtitle, cta: ed2Cta, ctaHref: ed2CtaHref, image: ed2Image, align: ed2Align, dark: ed2Dark })
      if (sectionKey === 'section_titles') save('section_titles', { newArrivals: newArrivalsTitle, bestSellers: bestSellersTitle, bestSellersSubtitle: bestSellersSubtitle, alsoInterest: alsoInterestTitle })
    }}
      disabled={saving === sectionKey}
      className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] text-white text-[12px] border-none cursor-pointer hover:bg-gray-800 disabled:opacity-50 transition-colors">
      {saving === sectionKey
        ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        : <Save size={13} />}
      Save Section
    </button>
  )

  if (loading) return (
    <div className="p-6">
      <div className="w-6 h-6 border-2 border-gray-200 border-t-[#1a1a1a] rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="p-6 space-y-4 max-w-4xl">
      {toast && <Toast {...toast} />}

      {/* Header */}
      <div className="bg-white border border-gray-200 p-5 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-[18px] font-semibold text-[#1a1a1a] flex items-center gap-2">
            <Monitor size={18} strokeWidth={1.5} className="text-[#c8a882]" />
            Theme & Homepage
          </h1>
          <p className="text-[12px] text-gray-500 mt-0.5">Control all homepage sections, banners, videos and text</p>
        </div>
        <a href="/" target="_blank"
          className="text-[12px] text-[#1a1a1a] border-b border-[#1a1a1a] no-underline hover:text-gray-500 transition-colors">
          Preview Homepage →
        </a>
      </div>

      {/* Promo Bar */}
      <Section title="📢 Promo Bar (top announcement bar)" defaultOpen>
        <Field label="Active">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={promoActive} onChange={e => setPromoActive(e.target.checked)} className="w-4 h-4 accent-[#1a1a1a]" />
            <span className="text-[13px] text-gray-600">Show promo bar</span>
          </label>
        </Field>
        <Field label="Left Text" hint="Small text on the left side">
          <input value={promoText} onChange={e => setPromoText(e.target.value)} className={input} placeholder="Spring is here!" />
        </Field>
        <Field label="Main Message" hint="The bold promotional message in the center">
          <textarea value={promoMiddle} onChange={e => setPromoMiddle(e.target.value)} rows={2} className={textarea} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Button Text">
            <input value={promoCta} onChange={e => setPromoCta(e.target.value)} className={input} placeholder="SHOP NEW ARRIVALS" />
          </Field>
          <Field label="Button Link">
            <input value={promoCtaHref} onChange={e => setPromoCtaHref(e.target.value)} className={input} placeholder="/collections/new-arrivals" />
          </Field>
        </div>
        <SaveBtn sectionKey="promo_bar" />
      </Section>

      {/* Hero Banner */}
      <Section title="🖼️ Hero Banner (main homepage images)">
        <p className="text-[12px] text-gray-500 bg-[#f8f6f1] px-3 py-2 border border-[#e8e0d0]">
          The hero has 3 panels: large left panel + 2 stacked right panels. Use S3/CloudFront URLs for best performance.
        </p>

        <p className="text-[12px] font-semibold text-[#1a1a1a] mt-2">Left Panel (large)</p>
        <Field label="Image URL">
          <input value={heroLeftImage} onChange={e => setHeroLeftImage(e.target.value)} className={input} placeholder="https://..." />
          {heroLeftImage && <img src={heroLeftImage} className="mt-2 h-32 object-cover w-full border border-gray-200" />}
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Title">
            <input value={heroLeftTitle} onChange={e => setHeroLeftTitle(e.target.value)} className={input} />
          </Field>
          <Field label="Subtitle">
            <input value={heroLeftSubtitle} onChange={e => setHeroLeftSubtitle(e.target.value)} className={input} />
          </Field>
          <Field label="Button Text">
            <input value={heroLeftCta} onChange={e => setHeroLeftCta(e.target.value)} className={input} />
          </Field>
          <Field label="Button Link">
            <input value={heroLeftCtaHref} onChange={e => setHeroLeftCtaHref(e.target.value)} className={input} />
          </Field>
        </div>

        <p className="text-[12px] font-semibold text-[#1a1a1a] mt-2">Top Right Panel</p>
        <Field label="Image URL">
          <input value={heroTopImage} onChange={e => setHeroTopImage(e.target.value)} className={input} placeholder="https://..." />
          {heroTopImage && <img src={heroTopImage} className="mt-2 h-24 object-cover w-full border border-gray-200" />}
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Label">
            <input value={heroTopLabel} onChange={e => setHeroTopLabel(e.target.value)} className={input} />
          </Field>
          <Field label="Link">
            <input value={heroTopHref} onChange={e => setHeroTopHref(e.target.value)} className={input} />
          </Field>
        </div>

        <p className="text-[12px] font-semibold text-[#1a1a1a] mt-2">Bottom Right Panel</p>
        <Field label="Image URL">
          <input value={heroBottomImage} onChange={e => setHeroBottomImage(e.target.value)} className={input} placeholder="https://..." />
          {heroBottomImage && <img src={heroBottomImage} className="mt-2 h-24 object-cover w-full border border-gray-200" />}
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Label">
            <input value={heroBottomLabel} onChange={e => setHeroBottomLabel(e.target.value)} className={input} />
          </Field>
          <Field label="Link">
            <input value={heroBottomHref} onChange={e => setHeroBottomHref(e.target.value)} className={input} />
          </Field>
        </div>
        <SaveBtn sectionKey="hero_banner" />
      </Section>

      {/* Promo Video */}
      <Section title="🎬 Promo Video Section">
        <Field label="Video URL" hint="Upload to S3 or use a public video URL (.mp4)">
          <input value={videoUrl} onChange={e => setVideoUrl(e.target.value)} className={input} placeholder="/videos/promo.mp4" />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Title">
            <input value={videoTitle} onChange={e => setVideoTitle(e.target.value)} className={input} />
          </Field>
          <Field label="Subtitle">
            <input value={videoSubtitle} onChange={e => setVideoSubtitle(e.target.value)} className={input} />
          </Field>
          <Field label="Button Text">
            <input value={videoCta} onChange={e => setVideoCta(e.target.value)} className={input} />
          </Field>
          <Field label="Button Link">
            <input value={videoCtaHref} onChange={e => setVideoCtaHref(e.target.value)} className={input} />
          </Field>
        </div>
        <Field label="Fine Print">
          <input value={videoNote} onChange={e => setVideoNote(e.target.value)} className={input} placeholder="*While supplies last..." />
        </Field>
        <SaveBtn sectionKey="promo_video" />
      </Section>

      {/* Editorial Banner 1 */}
      <Section title="📸 Editorial Banner 1 (below New Arrivals)">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Title">
            <input value={ed1Title} onChange={e => setEd1Title(e.target.value)} className={input} />
          </Field>
          <Field label="Subtitle">
            <input value={ed1Subtitle} onChange={e => setEd1Subtitle(e.target.value)} className={input} />
          </Field>
          <Field label="Button Text">
            <input value={ed1Cta} onChange={e => setEd1Cta(e.target.value)} className={input} />
          </Field>
          <Field label="Button Link">
            <input value={ed1CtaHref} onChange={e => setEd1CtaHref(e.target.value)} className={input} />
          </Field>
        </div>
        <Field label="Image URL">
          <input value={ed1Image} onChange={e => setEd1Image(e.target.value)} className={input} placeholder="https://..." />
          {ed1Image && <img src={ed1Image} className="mt-2 h-32 object-cover w-full border border-gray-200" />}
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Text Alignment">
            <select value={ed1Align} onChange={e => setEd1Align(e.target.value)} className={input}>
              <option value="left">Left</option>
              <option value="right">Right</option>
              <option value="center">Center</option>
            </select>
          </Field>
          <Field label="Dark Overlay">
            <label className="flex items-center gap-2 cursor-pointer mt-2">
              <input type="checkbox" checked={ed1Dark} onChange={e => setEd1Dark(e.target.checked)} className="w-4 h-4 accent-[#1a1a1a]" />
              <span className="text-[13px] text-gray-600">Dark background overlay</span>
            </label>
          </Field>
        </div>
        <SaveBtn sectionKey="editorial_1" />
      </Section>

      {/* Editorial Banner 2 */}
      <Section title="📸 Editorial Banner 2 (below Also of Interest)">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Title">
            <input value={ed2Title} onChange={e => setEd2Title(e.target.value)} className={input} />
          </Field>
          <Field label="Subtitle">
            <input value={ed2Subtitle} onChange={e => setEd2Subtitle(e.target.value)} className={input} />
          </Field>
          <Field label="Button Text">
            <input value={ed2Cta} onChange={e => setEd2Cta(e.target.value)} className={input} />
          </Field>
          <Field label="Button Link">
            <input value={ed2CtaHref} onChange={e => setEd2CtaHref(e.target.value)} className={input} />
          </Field>
        </div>
        <Field label="Image URL">
          <input value={ed2Image} onChange={e => setEd2Image(e.target.value)} className={input} placeholder="https://..." />
          {ed2Image && <img src={ed2Image} className="mt-2 h-32 object-cover w-full border border-gray-200" />}
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Text Alignment">
            <select value={ed2Align} onChange={e => setEd2Align(e.target.value)} className={input}>
              <option value="left">Left</option>
              <option value="right">Right</option>
              <option value="center">Center</option>
            </select>
          </Field>
          <Field label="Dark Overlay">
            <label className="flex items-center gap-2 cursor-pointer mt-2">
              <input type="checkbox" checked={ed2Dark} onChange={e => setEd2Dark(e.target.checked)} className="w-4 h-4 accent-[#1a1a1a]" />
              <span className="text-[13px] text-gray-600">Dark background overlay</span>
            </label>
          </Field>
        </div>
        <SaveBtn sectionKey="editorial_2" />
      </Section>

      {/* Section Titles */}
      <Section title="📝 Product Grid Section Titles">
        <div className="grid grid-cols-2 gap-4">
          <Field label="New Arrivals Title">
            <input value={newArrivalsTitle} onChange={e => setNewArrivalsTitle(e.target.value)} className={input} />
          </Field>
          <Field label="Best Sellers Title">
            <input value={bestSellersTitle} onChange={e => setBestSellersTitle(e.target.value)} className={input} />
          </Field>
          <Field label="Best Sellers Subtitle">
            <input value={bestSellersSubtitle} onChange={e => setBestSellersSubtitle(e.target.value)} className={input} />
          </Field>
          <Field label="Also of Interest Title">
            <input value={alsoInterestTitle} onChange={e => setAlsoInterestTitle(e.target.value)} className={input} />
          </Field>
        </div>
        <SaveBtn sectionKey="section_titles" />
      </Section>
    </div>
  )
}
