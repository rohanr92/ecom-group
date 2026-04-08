import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  const sections = [
    {
      heading: 'Your Order',
      position: 0,
      links: [
        { label: 'Track Order', href: '/track', position: 0 },
        { label: 'Shipping & Delivery', href: '/shipping', position: 1 },
        { label: 'Returns & Exchanges', href: '/returns', position: 2 },
        { label: 'Size Guide', href: '/size-guide', position: 3 },
        { label: 'FAQ', href: '/faq', position: 4 },
      ]
    },
    {
      heading: 'Help & Info',
      position: 1,
      links: [
        { label: 'Contact Us', href: '/contact', position: 0 },
        { label: 'About Us', href: '/about', position: 1 },
        { label: 'Job Opportunities', href: '/jobs', position: 2 },
        { label: 'Affiliate Program', href: '/affiliate', position: 3 },
        { label: 'Gift Cards', href: '/gift-cards', position: 4 },
      ]
    },
    {
      heading: 'About Solomon & Sage',
      position: 2,
      links: [
        { label: 'Our Story', href: '/about', position: 0 },
        { label: 'Sustainability', href: '/sustainability', position: 1 },
        { label: 'Press', href: '/press', position: 2 },
        { label: 'Influencers', href: '/influencers', position: 3 },
      ]
    },
    {
      heading: 'Retailers',
      position: 3,
      links: [
        { label: 'Nordstrom', href: 'https://www.nordstrom.com', position: 0 },
        { label: "Macy's", href: 'https://www.macys.com', position: 1 },
        { label: "Kohl's", href: 'https://www.kohls.com', position: 2 },
        { label: 'JCPenney', href: 'https://www.jcpenney.com', position: 3 },
        { label: 'Find a Store', href: '/stores', position: 4 },
      ]
    },
  ]

  for (const section of sections) {
    await prisma.footerSection.upsert({
      where: { heading: section.heading },
      update: {},
      create: {
        heading: section.heading,
        position: section.position,
        links: { create: section.links }
      }
    })
  }

  // Bottom links
  const bottomLinks = [
    { label: 'Privacy Policy', href: '/privacy', position: 0 },
    { label: 'Terms of Service', href: '/terms', position: 1 },
    { label: 'Accessibility', href: '/accessibility', position: 2 },
    { label: 'CA Privacy Rights', href: '/ca-privacy', position: 3 },
  ]
  for (const link of bottomLinks) {
    await prisma.footerBottomLink.upsert({
      where: { label: link.label },
      update: { href: link.href },
      create: link
    })
  }

  console.log('✅ Footer seeded')
}
main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
