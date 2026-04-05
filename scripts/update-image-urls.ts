import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

const adapter = new PrismaPg({
  connectionString: 'postgresql://postgres.fscioyqdqxddjfzjkfph:IlovemymotheR92%40@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres',
})
const prisma = new PrismaClient({ adapter })

async function updateImageUrls() {
  const products = await prisma.product.findMany()
  console.log(`\n🔄 Updating image URLs for ${products.length} products...\n`)

  for (const product of products) {
    const updatedImages = product.images.map((url: string) => url.replace('.jpg', '.webp'))
    await prisma.product.update({
      where: { id: product.id },
      data: { images: updatedImages },
    })
    console.log(`✅ Updated: ${product.name}`)
  }

  console.log('\n🎉 All image URLs updated to WebP!\n')
  await prisma.$disconnect()
}

updateImageUrls()
