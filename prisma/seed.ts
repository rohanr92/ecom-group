// Save as: prisma/seed.ts (REPLACE existing)
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

const adapter = new PrismaPg({
  connectionString: 'postgresql://postgres.fscioyqdqxddjfzjkfph:IlovemymotheR92%40@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres',
})

const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Seeding database...')

  await prisma.promoCode.upsert({
    where: { code: 'SOLOMON10' },
    update: {},
    create: { code: 'SOLOMON10', type: 'PERCENT', value: 10, minOrder: 50, isActive: true },
  })
  await prisma.promoCode.upsert({
    where: { code: 'WELCOME20' },
    update: {},
    create: { code: 'WELCOME20', type: 'PERCENT', value: 20, minOrder: 100, isActive: true },
  })
  console.log('  ✓ Promo codes')

  const products = [
    {
      name: 'Silk Wrap Midi Dress', slug: 'silk-wrap-midi-dress',
      description: 'Effortlessly elegant silk wrap midi dress.',
      details: ['Fabric: 100% Silk', 'Dry clean only', 'Adjustable wrap tie'],
      price: 218, comparePrice: null, category: 'Dresses', badge: 'Best Seller',
      images: ['https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&auto=format&fit=crop&q=80'],
      variants: [
        { size: 'XS', color: 'Caramel', colorHex: '#c8a882', sku: 'SWMD-XS-CAR', inventory: 12 },
        { size: 'S',  color: 'Caramel', colorHex: '#c8a882', sku: 'SWMD-S-CAR',  inventory: 20 },
        { size: 'M',  color: 'Caramel', colorHex: '#c8a882', sku: 'SWMD-M-CAR',  inventory: 18 },
        { size: 'XS', color: 'Onyx',    colorHex: '#1a1a1a', sku: 'SWMD-XS-ONX', inventory: 8  },
        { size: 'S',  color: 'Onyx',    colorHex: '#1a1a1a', sku: 'SWMD-S-ONX',  inventory: 15 },
      ],
    },
    {
      name: 'Linen Wide-Leg Trousers', slug: 'linen-wide-leg-trousers',
      description: 'Relaxed yet refined wide-leg linen trousers.',
      details: ['Fabric: 100% Linen', 'Machine washable', 'Elastic waistband'],
      price: 128, comparePrice: null, category: 'Pants', badge: 'New',
      images: ['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop&q=80'],
      variants: [
        { size: 'XS', color: 'Onyx',  colorHex: '#1a1a1a', sku: 'LWLT-XS-ONX', inventory: 15 },
        { size: 'S',  color: 'Onyx',  colorHex: '#1a1a1a', sku: 'LWLT-S-ONX',  inventory: 20 },
        { size: 'M',  color: 'Cream', colorHex: '#d4cfc8', sku: 'LWLT-M-CRM',  inventory: 18 },
        { size: 'L',  color: 'Cream', colorHex: '#d4cfc8', sku: 'LWLT-L-CRM',  inventory: 10 },
      ],
    },
    {
      name: 'Structured Blazer', slug: 'structured-blazer',
      description: 'Perfectly tailored blazer for office to evening.',
      details: ['Fabric: 68% Polyester, 30% Viscose', 'Dry clean', 'Single button closure'],
      price: 248, comparePrice: null, category: 'Jackets', badge: null,
      images: ['https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&auto=format&fit=crop&q=80'],
      variants: [
        { size: 'XS', color: 'Onyx',  colorHex: '#1a1a1a', sku: 'SB-XS-ONX', inventory: 8  },
        { size: 'S',  color: 'Onyx',  colorHex: '#1a1a1a', sku: 'SB-S-ONX',  inventory: 12 },
        { size: 'M',  color: 'Cream', colorHex: '#c4bfb5', sku: 'SB-M-CRM',  inventory: 10 },
      ],
    },
    {
      name: 'Cashmere Crew Sweater', slug: 'cashmere-crew-sweater',
      description: 'Pure luxury cashmere crew sweater.',
      details: ['Fabric: 100% Cashmere', 'Dry clean only', 'Relaxed fit'],
      price: 188, comparePrice: 248, category: 'Tops', badge: 'Sale',
      images: ['https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&auto=format&fit=crop&q=80'],
      variants: [
        { size: 'XS', color: 'Caramel', colorHex: '#c8a882', sku: 'CCS-XS-CAR', inventory: 6  },
        { size: 'S',  color: 'Caramel', colorHex: '#c8a882', sku: 'CCS-S-CAR',  inventory: 10 },
        { size: 'M',  color: 'Onyx',    colorHex: '#1a1a1a', sku: 'CCS-M-ONX',  inventory: 8  },
      ],
    },
    {
      name: 'Leather Belt Bag', slug: 'leather-belt-bag',
      description: 'Genuine leather belt bag — hands-free never looked so chic.',
      details: ['Material: 100% Genuine Leather', 'Adjustable strap', 'Zip closure'],
      price: 148, comparePrice: null, category: 'Accessories', badge: 'Best Seller',
      images: ['https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&auto=format&fit=crop&q=80'],
      variants: [
        { size: 'One Size', color: 'Caramel', colorHex: '#c8a882', sku: 'LBB-OS-CAR', inventory: 25 },
        { size: 'One Size', color: 'Onyx',    colorHex: '#1a1a1a', sku: 'LBB-OS-ONX', inventory: 20 },
      ],
    },
    {
      name: 'Gold Hoop Earring Set', slug: 'gold-hoop-earring-set',
      description: 'Three pairs of hoops in varying sizes.',
      details: ['Material: 18K Gold Plated Brass', 'Set of 3 pairs', 'Hypoallergenic'],
      price: 48, comparePrice: null, category: 'Accessories', badge: 'Best Seller',
      images: ['https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&auto=format&fit=crop&q=80'],
      variants: [
        { size: 'One Size', color: 'Gold', colorHex: '#c8a882', sku: 'GHE-OS-GLD', inventory: 50 },
      ],
    },
  ]

  for (const p of products) {
    const { variants, ...productData } = p
    const product = await prisma.product.upsert({
      where: { slug: productData.slug },
      update: {},
      create: productData,
    })
    for (const v of variants) {
      await prisma.productVariant.upsert({
        where: { sku: v.sku },
        update: { inventory: v.inventory },
        create: { ...v, productId: product.id },
      })
    }
    console.log(`  ✓ ${product.name}`)
  }

  console.log('\n✅ Seed complete!')
}

main()
  .catch(e => { console.error('❌ Failed:', e); process.exit(1) })
  .finally(() => prisma.$disconnect())