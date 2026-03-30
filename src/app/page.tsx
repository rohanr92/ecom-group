// Save as: src/app/page.tsx (REPLACE entire file)
import Navbar from '@/components/Navbar'
import HeroBanner from '@/components/HeroBanner'
import PromoBanner from '@/components/PromoBanner'
import EditorialBanner from '@/components/EditorialBanner'
import ShopByCategory from '@/components/ShopByCategory'
import Footer from '@/components/Footer'
import SlotProductGrid from '@/components/SlotProductGrid'

export default function HomePage() {
  return (
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
        title="Spring Shirts"
        subtitle="New season"
        ctaText="Shop Collection"
        ctaHref="/collections/shirts"
        image="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1400&auto=format&fit=crop&q=80"
        align="left"
        dark={true}
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
        title="The Vacation Edit"
        subtitle="Curated for travel"
        ctaText="Shop Vacation"
        ctaHref="/collections/vacation"
        image="https://images.unsplash.com/photo-1570464197285-9949814674a7?w=1400&auto=format&fit=crop&q=80"
        align="right"
        dark={true}
      />

      <Footer />
    </main>
  )
}