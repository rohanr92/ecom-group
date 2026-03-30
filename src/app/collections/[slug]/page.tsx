// Save as: src/app/collections/[slug]/page.tsx (REPLACE entire file)
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import CollectionsPage from '@/components/CollectionsPage'

export async function generateMetadata({ params }: { params: Promise<{ slug?: string }> }) {
  const { slug } = await params

  if (!slug) {
    return {
      title: "Women's Clothing | Solomon Lawrence",
      description: "Shop women's clothing at Solomon Lawrence.",
    }
  }

  const title = slug
    .split('-')
    .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')

  return {
    title:       `${title} | Solomon Lawrence`,
    description: `Shop ${title} at Solomon Lawrence.`,
  }
}

export default async function CollectionSlugRoute({ params }: { params: Promise<{ slug?: string }> }) {
  await params // unwrap — not used in render but required by Next.js 15

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