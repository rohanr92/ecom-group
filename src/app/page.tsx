import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import HeroBanner from '@/components/HeroBanner'
import PromoBanner from '@/components/PromoBanner'
import EditorialBanner from '@/components/EditorialBanner'
import ShopByCategory from '@/components/ShopByCategory'
import Footer from '@/components/Footer'
import SlotProductGrid from '@/components/SlotProductGrid'

export const metadata: Metadata = {
  title: "Solomon & Sage | Premium Men's & Women's Clothing Brand",
  description: "Solomon & Sage is a premium men's and women's clothing brand founded in 2013, based in Lancaster, CA. Discover modern dresses, tops, jeans, blouses, sweatshirts and outerwear.",
  alternates: { canonical: 'https://solomonandsage.com' },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ClothingStore',
  name: 'Solomon & Sage',
  description: "Premium men's and women's clothing brand founded in 2013",
  url: 'https://solomonandsage.com',
  logo: 'https://d3o8u8o2i2q94t.cloudfront.net/products/1775668915292-solomon-sage-1-.png',
  image: 'https://d3o8u8o2i2q94t.cloudfront.net/products/1775596326876-s-linenwomen-dt-v1.webp',
  foundingDate: '2013',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Lancaster',
    addressRegion: 'CA',
    addressCountry: 'US',
  },
  sameAs: [
    'https://www.instagram.com/solomonandsage',
    'https://www.facebook.com/solomonandsage',
    'https://www.pinterest.com/solomonandsage',
  ],
  priceRange: '$$',
}

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main>
        <Navbar />
        <HeroBanner />
        <PromoBanner />

        <SlotProductGrid
          title="New Arrivals For You"
          slot="homepage_new_arrivals"
          limit={10}
          viewAllHref="/collections/new-arrivals"
        />

        <div style={{ background: 'var(--color-cream)' }}>
          <SlotProductGrid
            title="Best Sellers"
            subtitle="Community favorites"
            slot="homepage_bestsellers"
            limit={10}
            viewAllHref="/collections/best-sellers"
          />
        </div>

        <EditorialBanner
          title="The Vacation Edit"
          subtitle="Curated for travel"
          ctaText="Shop Vacation"
          ctaHref="/collections/vacation"
          image="https://d3o8u8o2i2q94t.cloudfront.net/products/1775596330514-wsp_swm01f_0426_1564_altbgd_ext_2-1.jpeg"
          align="right"
          dark={true}
          cmsKey="editorial_1"
        />

        <ShopByCategory />

        <div style={{ background: 'var(--color-cream)' }}>
          <SlotProductGrid
            title="Also of Interest"
            slot="homepage_also_interest"
            limit={7}
            viewAllHref="/collections/all"
          />
        </div>

        <EditorialBanner
          title="Spring Shirts"
          subtitle="New season"
          ctaText="Shop Collection"
          ctaHref="/collections/shirts"
          image="https://d3o8u8o2i2q94t.cloudfront.net/products/1775597587589-c2605093_slide_dt.webp"
          align="center"
          dark={true}
          cmsKey="editorial_2"
        />

        <Footer />
      </main>
    </>
  )
}