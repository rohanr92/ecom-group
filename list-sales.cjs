const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const all = await prisma.product.findMany({
    select: { id: true, name: true, price: true, comparePrice: true, badge: true },
    orderBy: { name: 'asc' },
  })

  const onSale = all.filter(p => p.comparePrice != null && Number(p.comparePrice) > Number(p.price))

  console.log(`\nTOTAL products: ${all.length}`)
  console.log(`ON SALE (comparePrice > price): ${onSale.length}\n`)
  console.log('These products are currently ON SALE:')
  console.log('-'.repeat(70))
  for (const p of onSale) {
    console.log(`${p.name}`)
    console.log(`   now: $${Number(p.price).toFixed(2)}  |  original: $${Number(p.comparePrice).toFixed(2)}  |  badge: ${p.badge ?? '-'}`)
  }

  const other = all.filter(p => p.comparePrice != null && Number(p.comparePrice) <= Number(p.price))
  if (other.length) {
    console.log('\n' + '-'.repeat(70))
    console.log(`\n${other.length} products have comparePrice set but NOT higher than price:`)
    for (const p of other) {
      console.log(`   ${p.name} — price $${Number(p.price).toFixed(2)}, comparePrice $${Number(p.comparePrice).toFixed(2)}`)
    }
  }

  await prisma.$disconnect()
}
main().catch(e => { console.error(e); process.exit(1) })
