import type { Metadata } from 'next'
import { Suspense } from 'react'
import CollectionsPage from '@/components/CollectionsPage'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: "Women's Clothing",
  description: "Shop Solomon & Sage women's clothing. Browse dresses, tops, jeans, jackets, skirts and accessories. Free shipping on all orders in the USA .",
  alternates: { canonical: 'https://solomonandsage.com/collections' },
}


export default function CollectionsRoute() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <div className="flex-1">
        <Suspense>
          <CollectionsPage />
        </Suspense>
      </div>
      <Footer />
    </div>
  )
}