import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

const adapter = new PrismaPg({
  connectionString: 'postgresql://postgres.fscioyqdqxddjfzjkfph:IlovemymotheR92%40@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres',
})
const prisma = new PrismaClient({ adapter })

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

async function fixSlugs() {
  const products = await prisma.product.findMany()
  console.log(`\n🔄 Fixing slugs for ${products.length} products...\n`)

  for (const p of products) {
    const correctSlug = generateSlug(p.name)
    if (p.slug !== correctSlug) {
      await prisma.product.update({
        where: { id: p.id },
        data: { slug: correctSlug },
      })
      console.log(`✅ ${p.name}: ${p.slug} → ${correctSlug}`)
    } else {
      console.log(`✓ ${p.name}: already correct`)
    }
  }

  console.log('\n🎉 Done!\n')
  await prisma.$disconnect()
}

fixSlugs()
