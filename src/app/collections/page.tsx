import { Suspense } from 'react'
import CollectionsPage from '@/components/CollectionsPage'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

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