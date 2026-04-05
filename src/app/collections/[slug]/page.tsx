import { Suspense } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import CollectionsPage from '@/components/CollectionsPage'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const title = slug.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
  return {
    title: `${title} | Solomon Lawrence`,
    description: `Shop ${title} at Solomon Lawrence.`,
  }
}

export default async function CollectionSlugRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <div className="flex-1">
        <Suspense>
          <CollectionsPage slug={slug} />
        </Suspense>
      </div>
      <Footer />
    </div>
  )
}