import type { Metadata } from 'next'
import { Suspense } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import CollectionsPage from '@/components/CollectionsPage'
import { prisma } from '@/lib/prisma'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params

  const collection = await prisma.collection.findUnique({
    where: { slug },
    select: { name: true, description: true, image: true },
  })

  const title = collection?.name ?? slug.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
  const description = collection?.description ?? `Shop ${title} at Solomon & Sage. Premium women's and men's clothing.`

  return {
    title,
    description,
    alternates: { canonical: `https://solomonandsage.com/collections/${slug}` },
    openGraph: {
      title: `${title} | Solomon & Sage`,
      description,
      images: collection?.image ? [{ url: collection.image, width: 1200, height: 630, alt: title }] : [],
    },
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