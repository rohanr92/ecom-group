import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import CollectionsPage from '@/components/CollectionsPage'

export const metadata = {
  title: "Women's Clothing | Solomon Lawrence",
  description: "Shop women's clothing at Solomon Lawrence.",
}

export default function CollectionsRoute() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <div className="flex-1">
        <CollectionsPage />
      </div>
      <Footer />
    </div>
  )
}