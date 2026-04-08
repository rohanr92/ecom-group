import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import { readFileSync } from 'fs'

// Load .env.local manually
const env = readFileSync('.env.local', 'utf8')
env.split('\n').forEach(line => {
  const [key, ...vals] = line.split('=')
  if (key && vals.length) process.env[key.trim()] = vals.join('=').trim()
})

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

const defaults = [
  {
    heading: 'Your Order',
    links: [
      { label: 'Track Order', href: '/track' },
      { label: 'Shipping & Delivery', href: '/shipping' },
      { label: 'Returns & Exchanges', href: '/returns' },
      { label: 'Size Guide', href: '/size-guide' },
      { label: 'FAQ', href: '/faq' },
    ]
  },
  {
    heading: 'Help & Info',
    links: [
      { label: 'Contact Us', href: '/contact' },
      { label: 'About Us', href: '/about' },
      { label: 'Job Opportunities', href: '/jobs' },
      { label: 'Affiliate Program', href: '/affiliate' },
      { label: 'Gift Cards', href: '/gift-cards' },
    ]
  },
  {
    heading: 'About Solomon & Sage',
    links: [
      { label: 'Our Story', href: '/about' },
      { label: 'Sustainability', href: '/sustainability' },
      { label: 'Press', href: '/press' },
      { label: 'Influencers', href: '/influencers' },
    ]
  },
  {
    heading: 'Retailers',
    links: [
      { label: 'Nordstrom', href: 'https://www.nordstrom.com', openInNewTab: true },
      { label: "Macy's", href: 'https://www.macys.com', openInNewTab: true },
      { label: "Kohl's", href: 'https://www.kohls.com', openInNewTab: true },
      { label: 'JCPenney', href: 'https://www.jcpenney.com', openInNewTab: true },
      { label: 'Find a Store', href: '/stores' },
    ]
  },
]

async function main() {
  await prisma.footerLink.deleteMany()
  await prisma.footerColumn.deleteMany()

  for (let i = 0; i < defaults.length; i++) {
    const col = defaults[i]
    const column = await prisma.footerColumn.create({
      data: {
        heading: col.heading,
        position: i,
        links: {
          create: col.links.map((l, j) => ({
            label: l.label,
            href: l.href,
            position: j,
            openInNewTab: l.openInNewTab ?? false,
          }))
        }
      }
    })
    console.log('✅ Created:', column.heading)
  }

  await prisma.footerSettings.upsert({
    where: { key: 'social_links' },
    update: {},
    create: {
      key: 'social_links',
      value: {
        instagram: 'https://instagram.com/solomonandsage',
        facebook: 'https://facebook.com/solomonandsage',
        pinterest: 'https://pinterest.com/solomonandsage',
        youtube: '',
      }
    }
  })

  await prisma.footerSettings.upsert({
    where: { key: 'bottom_links' },
    update: {},
    create: {
      key: 'bottom_links',
      value: [
        { label: 'Privacy Policy', href: '/privacy' },
        { label: 'Terms of Service', href: '/terms' },
        { label: 'Accessibility', href: '/accessibility' },
        { label: 'CA Privacy Rights', href: '/ca-privacy' },
      ]
    }
  })

  console.log('✅ Footer seeded successfully')
  await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
