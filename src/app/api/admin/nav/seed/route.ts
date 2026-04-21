import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const SEED_DATA = {
  women: [
    {
      label: 'New', href: '/collections/new-arrivals', isSale: false,
      sections: [
        { heading: 'Shop By Category', links: ['New Arrivals','New Clothing', 'New Accessories','New Beauty'] },
        { heading: 'Shop By Collection', links: ['Spring Edit','Resort Collection','Vacation Ready','Workwear'] },
      ],
      featured: { image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&auto=format&fit=crop&q=80', label: 'Shop New Arrivals', href: '/collections/new-arrivals' },
    },
    {
      label: 'Best Sellers', href: '/collections/best-sellers', isSale: false,
      sections: [
        { heading: 'Shop By Category', links: ['Shop All Best Sellers','Best Sellers Lookbook','Most Duped','Top Rated'] },
        { heading: 'Trending Now', links: ['Dresses','Wide Leg Pants','Linen Tops','Sandals','Tote Bags'] },
      ],
      featured: { image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&auto=format&fit=crop&q=80', label: 'Shop Best Sellers', href: '/collections/best-sellers' },
    },
    {
      label: 'Clothing', href: '/collections?category=Clothing', isSale: false,
      sections: [
        { heading: 'Shop By Category', links: ['Shop All Clothing','Dresses','Tops','Sweaters','Jackets & Coats','Pants','Skirts','Shorts','Sets & Matching'] },
        { heading: 'Shop By Collection', links: ['Spring Collection','Resort Wear','Work Wear','Weekend Casual','Loungewear'] },
        { heading: 'Brands We Love', links: ['Free People','Reformation','Madewell','Anthropologie','Veronica Beard'] },
      ],
      featured: { image: 'https://images.unsplash.com/photo-1551803091-e20673f15770?w=400&auto=format&fit=crop&q=80', label: 'Shop Spring Clothing', href: '/collections/clothing' },
    },
    {
      label: 'Dresses', href: '/collections?category=Dresses', isSale: false,
      sections: [
        { heading: 'Shop By Category', links: ['Shop All Dresses','Mini Dresses','Midi Dresses','Maxi Dresses','Slip Dresses','Wrap Dresses','Shirt Dresses','Floral Dresses'] },
        { heading: 'Shop By Collection', links: ['Wedding Guest','Vacation Dresses','Work Dresses','Going Out','Summer Dresses'] },
      ],
      featured: { image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&auto=format&fit=crop&q=80', label: 'Shop All Dresses', href: '/collections/dresses' },
    },
    {
      label: 'Tops', href: '/collections?category=Tops', isSale: false,
      sections: [
        { heading: 'Shop By Category', links: ['Shop All Tops','T-Shirts','Blouses','Tank Tops','Crop Tops','Button-Downs','Sweaters','Sweatshirts'] },
        { heading: 'Shop By Collection', links: ['Linen Tops','Silk Tops','Graphic Tees','Workwear Tops'] },
      ],
      featured: { image: 'https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?w=400&auto=format&fit=crop&q=80', label: 'New Tops', href: '/collections/tops' },
    },
    {
      label: 'Jeans', href: '/collections?category=Jeans', isSale: false,
      sections: [
        { heading: 'Shop By Category', links: ['Shop All Jeans','New Jeans','Top Rated','Barrel Jeans','Bootcut Jeans','Boyfriend Jeans','Flare Jeans','Wide-Leg Jeans'] },
        { heading: 'Shop By Collection', links: ['Lightweight Denim','Statement Jeans','White Jeans','Long Jeans','Petite Jeans'] },
        { heading: 'Brands We Love', links: ['Wrangler',"Levi's",'Mother','RE/DONE','AGOLDE'] },
      ],
      featured: { image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&auto=format&fit=crop&q=80', label: 'Shop Statement Jeans', href: '/collections/jeans' },
    },
    {
      label: 'Accessories', href: '/collections?category=Accessories', isSale: false,
      sections: [
        { heading: 'Shop By Category', links: ['Shop All Accessories','Bags & Handbags','Jewelry','Sunglasses','Hats','Scarves','Belts'] },
        { heading: 'Shop By Collection', links: ['Summer Accessories','Jewelry Trends','Bag Edit'] },
      ],
      featured: { image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&auto=format&fit=crop&q=80', label: 'Shop Accessories', href: '/collections/accessories' },
    },
    {
      label: 'Sale', href: '/collections/sale', isSale: true,
      sections: [
        { heading: 'Shop Sale', links: ['All Sale','Sale Clothing', 'Sale Accessories','Under $50','Under $100'] },
      ],
      featured: { image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=400&auto=format&fit=crop&q=80', label: 'Shop All Sale', href: '/collections/sale' },
    },
  ],
  men: [
    { label: 'New', href: '/collections/new-arrivals', isSale: false, sections: [], featured: null },
    { label: 'Best Sellers', href: '/collections/best-sellers', isSale: false, sections: [], featured: null },
    { label: 'Clothing', href: '/collections?category=Clothing', isSale: false, sections: [], featured: null },
    { label: 'Tops', href: '/collections?category=Tops', isSale: false, sections: [], featured: null },
    { label: 'Bottoms', href: '/collections?category=Bottoms', isSale: false, sections: [], featured: null },
    { label: 'Outerwear', href: '/collections?category=Outerwear', isSale: false, sections: [], featured: null },
  
    { label: 'Accessories', href: '/collections?category=Accessories', isSale: false, sections: [], featured: null },
    { label: 'Sale', href: '/collections/sale', isSale: true, sections: [], featured: null },
  ],
}

export async function POST(req: NextRequest) {
  try {
    // Clear existing
    await prisma.navItem.deleteMany()

    for (const [tab, items] of Object.entries(SEED_DATA)) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        const navItem = await prisma.navItem.create({
          data: {
            label: item.label,
            href: item.href,
            tab,
            position: i,
            isSale: item.isSale,
          },
        })

        for (let j = 0; j < item.sections.length; j++) {
          const section = item.sections[j]
          const navSection = await prisma.navSection.create({
            data: { navItemId: navItem.id, heading: section.heading, position: j },
          })
          for (let k = 0; k < section.links.length; k++) {
            const linkLabel = section.links[k]
            await prisma.navLink.create({
              data: {
                sectionId: navSection.id,
                label: linkLabel,
                href: `/collections/${linkLabel.toLowerCase().replace(/[\s+&]/g, '-')}`,
                position: k,
              },
            })
          }
        }

        if (item.featured) {
          await prisma.navFeatured.create({
            data: { navItemId: navItem.id, image: item.featured.image, label: item.featured.label, href: item.featured.href },
          })
        }
      }
    }

    return NextResponse.json({ success: true, message: 'Nav seeded successfully' })
  } catch (err: any) {
    console.error('SEED ERROR:', err)
    return NextResponse.json({ error: err.message, stack: err.stack }, { status: 500 })
  }
}