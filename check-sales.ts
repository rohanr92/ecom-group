import { prisma } from './src/lib/prisma'
async function main() {
  const all = await prisma.product.findMany({
    select: { name: true, price: true, comparePrice: true, badge: true },
    orderBy: { name: 'asc' },
  })
  const onSale = all.filter(p => p.comparePrice != null && Number(p.comparePrice) > Number(p.price))
  console.log(`TOTAL: ${all.length} | ON SALE: ${onSale.length}\n`)
  for (const p of onSale) {
    console.log(`${p.name} — now $${Number(p.price).toFixed(2)} / was $${Number(p.comparePrice).toFixed(2)} [${p.badge??'-'}]`)
  }
  await prisma.$disconnect()
}
main().catch(e => { console.error(e.message); process.exit(1) })
