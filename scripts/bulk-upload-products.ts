import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

const adapter = new PrismaPg({
  connectionString: 'postgresql://postgres.fscioyqdqxddjfzjkfph:IlovemymotheR92%40@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres',
})

const prisma = new PrismaClient({ adapter })

const products = [
  {
    name: "Men's Cotton Classic Stripe T-Shirt",
    slug: 'mens-cotton-classic-stripe-t-shirt',
    description: "A timeless wardrobe essential reimagined with clean Breton-inspired stripes. Cut from heavyweight 100% cotton jersey, this classic tee delivers structure and softness in equal measure. The relaxed crewneck silhouette sits perfectly on the shoulders, making it an effortless go-to for casual days, weekend outings, or layering under a jacket.",
    price: 48, comparePrice: null, category: 'Tops', badge: 'New', isActive: true,
    details: ['Material: 100% heavyweight cotton jersey','Classic Breton-inspired horizontal stripe pattern','Relaxed crewneck with ribbed collar','Short sleeves with clean hem finish','Straight hem with side seam construction','Care: Machine wash cold with like colors','Care: Tumble dry low','Care: Do not bleach','Care: Do not dry clean'],
    variants: [
      { color: 'Cream/Light Black', colorHex: '#f5f0e8', size: 'XS', sku: 'MCCS-CLB-XS', inventory: 15 },
      { color: 'Cream/Light Black', colorHex: '#f5f0e8', size: 'S',  sku: 'MCCS-CLB-S',  inventory: 20 },
      { color: 'Cream/Light Black', colorHex: '#f5f0e8', size: 'M',  sku: 'MCCS-CLB-M',  inventory: 25 },
      { color: 'Cream/Light Black', colorHex: '#f5f0e8', size: 'L',  sku: 'MCCS-CLB-L',  inventory: 20 },
      { color: 'Cream/Light Black', colorHex: '#f5f0e8', size: 'XL', sku: 'MCCS-CLB-XL', inventory: 15 },
      { color: 'Cream/Light Black', colorHex: '#f5f0e8', size: 'XXL',sku: 'MCCS-CLB-XXL',inventory: 10 },
    ],
    images: ['https://d3o8u8o2i2q94t.cloudfront.net/products/men-s-cotton-classic-stripe-t-shirt-cream-light-black-1.jpg','https://d3o8u8o2i2q94t.cloudfront.net/products/men-s-cotton-classic-stripe-t-shirt-cream-light-black-2.jpg'],
  },
  {
    name: 'S & G Classic Crewneck Sweatshirt',
    slug: 's-g-classic-crewneck-sweatshirt',
    description: "The perfect blend of comfort and casual sophistication. Crafted from premium cotton-blend fleece that feels incredibly soft against the skin while maintaining its shape wash after wash. A wardrobe anchor that transitions seamlessly from lounging at home to errands, coffee runs, or casual Fridays.",
    price: 78, comparePrice: null, category: 'Tops', badge: null, isActive: true,
    details: ['Material: 80% cotton, 20% polyester fleece','Classic crewneck with ribbed collar, cuffs, and hem','Relaxed, comfortable fit','Long sleeves with ribbed cuffs','Soft brushed fleece interior for warmth','Care: Machine wash cold inside out','Care: Tumble dry low','Care: Do not bleach','Care: Do not dry clean'],
    variants: [
      { color: 'Navy Blue', colorHex: '#1a2744', size: 'XS', sku: 'SGCS-NB-XS', inventory: 12 },
      { color: 'Navy Blue', colorHex: '#1a2744', size: 'S',  sku: 'SGCS-NB-S',  inventory: 18 },
      { color: 'Navy Blue', colorHex: '#1a2744', size: 'M',  sku: 'SGCS-NB-M',  inventory: 22 },
      { color: 'Navy Blue', colorHex: '#1a2744', size: 'L',  sku: 'SGCS-NB-L',  inventory: 18 },
      { color: 'Navy Blue', colorHex: '#1a2744', size: 'XL', sku: 'SGCS-NB-XL', inventory: 12 },
      { color: 'Navy Blue', colorHex: '#1a2744', size: 'XXL',sku: 'SGCS-NB-XXL',inventory: 8  },
      { color: 'White',     colorHex: '#ffffff', size: 'XS', sku: 'SGCS-WH-XS', inventory: 12 },
      { color: 'White',     colorHex: '#ffffff', size: 'S',  sku: 'SGCS-WH-S',  inventory: 18 },
      { color: 'White',     colorHex: '#ffffff', size: 'M',  sku: 'SGCS-WH-M',  inventory: 22 },
      { color: 'White',     colorHex: '#ffffff', size: 'L',  sku: 'SGCS-WH-L',  inventory: 18 },
      { color: 'White',     colorHex: '#ffffff', size: 'XL', sku: 'SGCS-WH-XL', inventory: 12 },
      { color: 'White',     colorHex: '#ffffff', size: 'XXL',sku: 'SGCS-WH-XXL',inventory: 8  },
    ],
    images: ['https://d3o8u8o2i2q94t.cloudfront.net/products/s-g-classic-sweatshirts-navy-blue-1.jpg','https://d3o8u8o2i2q94t.cloudfront.net/products/s-g-classic-sweatshirts-navy-blue-2.jpg','https://d3o8u8o2i2q94t.cloudfront.net/products/s-g-classic-sweatshirts-white-1.jpg','https://d3o8u8o2i2q94t.cloudfront.net/products/s-g-classic-sweatshirts-white-2.jpg'],
  },
  {
    name: 'Satin Button-Down Shirt',
    slug: 'satin-button-down-shirt',
    description: "Effortlessly elevated, this luxurious satin shirt blurs the line between day and evening dressing. The fluid, lightweight fabric drapes beautifully and catches the light with a subtle sheen. Whether worn tucked into tailored trousers for the office or open over a slip dress for evening, this versatile piece is a true wardrobe investment.",
    price: 118, comparePrice: null, category: 'Tops', badge: 'Best Seller', isActive: true,
    details: ['Material: 100% polyester satin weave with silk-like hand feel','Classic pointed collar with full button-down front','Long sleeves with single-button barrel cuffs','Relaxed slightly oversized fit','Curved hem longer at back','Care: Hand wash cold or machine wash gentle cycle','Care: Lay flat to dry','Care: Low heat iron on reverse side','Care: Do not bleach'],
    variants: [
      { color: 'Baby Pink', colorHex: '#e8b0a0', size: 'XS', sku: 'SAT-BP-XS', inventory: 10 },
      { color: 'Baby Pink', colorHex: '#e8b0a0', size: 'S',  sku: 'SAT-BP-S',  inventory: 15 },
      { color: 'Baby Pink', colorHex: '#e8b0a0', size: 'M',  sku: 'SAT-BP-M',  inventory: 20 },
      { color: 'Baby Pink', colorHex: '#e8b0a0', size: 'L',  sku: 'SAT-BP-L',  inventory: 15 },
      { color: 'Baby Pink', colorHex: '#e8b0a0', size: 'XL', sku: 'SAT-BP-XL', inventory: 10 },
      { color: 'Black',     colorHex: '#1a1a1a', size: 'XS', sku: 'SAT-BK-XS', inventory: 10 },
      { color: 'Black',     colorHex: '#1a1a1a', size: 'S',  sku: 'SAT-BK-S',  inventory: 15 },
      { color: 'Black',     colorHex: '#1a1a1a', size: 'M',  sku: 'SAT-BK-M',  inventory: 20 },
      { color: 'Black',     colorHex: '#1a1a1a', size: 'L',  sku: 'SAT-BK-L',  inventory: 15 },
      { color: 'Black',     colorHex: '#1a1a1a', size: 'XL', sku: 'SAT-BK-XL', inventory: 10 },
      { color: 'Green',     colorHex: '#1a6b4a', size: 'XS', sku: 'SAT-GR-XS', inventory: 10 },
      { color: 'Green',     colorHex: '#1a6b4a', size: 'S',  sku: 'SAT-GR-S',  inventory: 15 },
      { color: 'Green',     colorHex: '#1a6b4a', size: 'M',  sku: 'SAT-GR-M',  inventory: 20 },
      { color: 'Green',     colorHex: '#1a6b4a', size: 'L',  sku: 'SAT-GR-L',  inventory: 15 },
      { color: 'Green',     colorHex: '#1a6b4a', size: 'XL', sku: 'SAT-GR-XL', inventory: 10 },
    ],
    images: ['https://d3o8u8o2i2q94t.cloudfront.net/products/satin-shirt-baby-pink-1.jpg','https://d3o8u8o2i2q94t.cloudfront.net/products/satin-shirt-baby-pink-2.jpg','https://d3o8u8o2i2q94t.cloudfront.net/products/satin-shirt-black-1.jpg','https://d3o8u8o2i2q94t.cloudfront.net/products/satin-shirt-black-2.jpg','https://d3o8u8o2i2q94t.cloudfront.net/products/satin-shirt-green-1.jpg','https://d3o8u8o2i2q94t.cloudfront.net/products/satin-shirt-green-2.jpg'],
  },
  {
    name: 'Classic Crewneck Sweatshirt',
    slug: 'classic-crewneck-sweatshirt',
    description: "Your new everyday essential. Built for all-day comfort without compromising on style. Crafted from premium cotton-blend fleece with a soft brushed interior, it offers just the right weight for year-round layering. Available in Baby Pink, Black, Olive Green, and White.",
    price: 88, comparePrice: null, category: 'Tops', badge: null, isActive: true,
    details: ['Material: 80% cotton, 20% polyester premium fleece','Classic ribbed crewneck collar','Relaxed gender-inclusive fit','Ribbed cuffs and hem for a polished finish','Soft brushed fleece interior','Pre-shrunk fabric for consistent sizing','Care: Machine wash cold inside out','Care: Tumble dry low','Care: Do not bleach','Care: Do not dry clean'],
    variants: [
      { color: 'Baby Pink',  colorHex: '#f4c2c2', size: 'XS', sku: 'CCN-BP-XS', inventory: 12 },
      { color: 'Baby Pink',  colorHex: '#f4c2c2', size: 'S',  sku: 'CCN-BP-S',  inventory: 18 },
      { color: 'Baby Pink',  colorHex: '#f4c2c2', size: 'M',  sku: 'CCN-BP-M',  inventory: 22 },
      { color: 'Baby Pink',  colorHex: '#f4c2c2', size: 'L',  sku: 'CCN-BP-L',  inventory: 18 },
      { color: 'Baby Pink',  colorHex: '#f4c2c2', size: 'XL', sku: 'CCN-BP-XL', inventory: 12 },
      { color: 'Black',      colorHex: '#1a1a1a', size: 'XS', sku: 'CCN-BK-XS', inventory: 12 },
      { color: 'Black',      colorHex: '#1a1a1a', size: 'S',  sku: 'CCN-BK-S',  inventory: 18 },
      { color: 'Black',      colorHex: '#1a1a1a', size: 'M',  sku: 'CCN-BK-M',  inventory: 22 },
      { color: 'Black',      colorHex: '#1a1a1a', size: 'L',  sku: 'CCN-BK-L',  inventory: 18 },
      { color: 'Black',      colorHex: '#1a1a1a', size: 'XL', sku: 'CCN-BK-XL', inventory: 12 },
      { color: 'Olive Green',colorHex: '#6b7040', size: 'XS', sku: 'CCN-OG-XS', inventory: 12 },
      { color: 'Olive Green',colorHex: '#6b7040', size: 'S',  sku: 'CCN-OG-S',  inventory: 18 },
      { color: 'Olive Green',colorHex: '#6b7040', size: 'M',  sku: 'CCN-OG-M',  inventory: 22 },
      { color: 'Olive Green',colorHex: '#6b7040', size: 'L',  sku: 'CCN-OG-L',  inventory: 18 },
      { color: 'Olive Green',colorHex: '#6b7040', size: 'XL', sku: 'CCN-OG-XL', inventory: 12 },
      { color: 'White',      colorHex: '#ffffff', size: 'XS', sku: 'CCN-WH-XS', inventory: 12 },
      { color: 'White',      colorHex: '#ffffff', size: 'S',  sku: 'CCN-WH-S',  inventory: 18 },
      { color: 'White',      colorHex: '#ffffff', size: 'M',  sku: 'CCN-WH-M',  inventory: 22 },
      { color: 'White',      colorHex: '#ffffff', size: 'L',  sku: 'CCN-WH-L',  inventory: 18 },
      { color: 'White',      colorHex: '#ffffff', size: 'XL', sku: 'CCN-WH-XL', inventory: 12 },
    ],
    images: ['https://d3o8u8o2i2q94t.cloudfront.net/products/sweatshirt-classic-crewneck-sweatshirts-baby-pink-1.jpg','https://d3o8u8o2i2q94t.cloudfront.net/products/sweatshirt-classic-crewneck-sweatshirts-baby-pink-2.jpg','https://d3o8u8o2i2q94t.cloudfront.net/products/sweatshirt-classic-crewneck-sweatshirts-black-1.jpg','https://d3o8u8o2i2q94t.cloudfront.net/products/sweatshirt-classic-crewneck-sweatshirts-black-2.jpg'],
  },
  {
    name: 'Ribbed Cotton Tank Top',
    slug: 'ribbed-cotton-tank-top',
    description: "The ultimate layering piece and standalone summer staple. This slim-fit ribbed tank is crafted from soft cotton-blend jersey that moves with your body and holds its shape beautifully. The scoop neckline with contrast trim adds a sporty-chic edge. Available in Black, Gray, Tia, and White.",
    price: 38, comparePrice: null, category: 'Tops', badge: 'Best Seller', isActive: true,
    details: ['Material: 95% cotton, 5% elastane ribbed jersey','Slim body-skimming fit','Scoop neckline with contrasting white trim detail','Thick shoulder straps for comfort and support','Stretchy ribbed fabric moves with your body','Care: Machine wash cold','Care: Tumble dry low','Care: Do not bleach','Care: Do not iron'],
    variants: [
      { color: 'Black', colorHex: '#1a1a1a', size: 'XS', sku: 'TT-BK-XS', inventory: 20 },
      { color: 'Black', colorHex: '#1a1a1a', size: 'S',  sku: 'TT-BK-S',  inventory: 25 },
      { color: 'Black', colorHex: '#1a1a1a', size: 'M',  sku: 'TT-BK-M',  inventory: 30 },
      { color: 'Black', colorHex: '#1a1a1a', size: 'L',  sku: 'TT-BK-L',  inventory: 25 },
      { color: 'Black', colorHex: '#1a1a1a', size: 'XL', sku: 'TT-BK-XL', inventory: 15 },
      { color: 'Gray',  colorHex: '#9ca3af', size: 'XS', sku: 'TT-GR-XS', inventory: 20 },
      { color: 'Gray',  colorHex: '#9ca3af', size: 'S',  sku: 'TT-GR-S',  inventory: 25 },
      { color: 'Gray',  colorHex: '#9ca3af', size: 'M',  sku: 'TT-GR-M',  inventory: 30 },
      { color: 'Gray',  colorHex: '#9ca3af', size: 'L',  sku: 'TT-GR-L',  inventory: 25 },
      { color: 'Gray',  colorHex: '#9ca3af', size: 'XL', sku: 'TT-GR-XL', inventory: 15 },
      { color: 'Tia',   colorHex: '#7bc67e', size: 'XS', sku: 'TT-TI-XS', inventory: 15 },
      { color: 'Tia',   colorHex: '#7bc67e', size: 'S',  sku: 'TT-TI-S',  inventory: 20 },
      { color: 'Tia',   colorHex: '#7bc67e', size: 'M',  sku: 'TT-TI-M',  inventory: 25 },
      { color: 'Tia',   colorHex: '#7bc67e', size: 'L',  sku: 'TT-TI-L',  inventory: 20 },
      { color: 'Tia',   colorHex: '#7bc67e', size: 'XL', sku: 'TT-TI-XL', inventory: 12 },
      { color: 'White', colorHex: '#ffffff', size: 'XS', sku: 'TT-WH-XS', inventory: 20 },
      { color: 'White', colorHex: '#ffffff', size: 'S',  sku: 'TT-WH-S',  inventory: 25 },
      { color: 'White', colorHex: '#ffffff', size: 'M',  sku: 'TT-WH-M',  inventory: 30 },
      { color: 'White', colorHex: '#ffffff', size: 'L',  sku: 'TT-WH-L',  inventory: 25 },
      { color: 'White', colorHex: '#ffffff', size: 'XL', sku: 'TT-WH-XL', inventory: 15 },
    ],
    images: ['https://d3o8u8o2i2q94t.cloudfront.net/products/tank-tops-black-1.jpg','https://d3o8u8o2i2q94t.cloudfront.net/products/tank-tops-black-2.jpg','https://d3o8u8o2i2q94t.cloudfront.net/products/tank-tops-gray-1.jpg','https://d3o8u8o2i2q94t.cloudfront.net/products/tank-tops-gray-2.jpg','https://d3o8u8o2i2q94t.cloudfront.net/products/tank-tops-tia-1.jpg','https://d3o8u8o2i2q94t.cloudfront.net/products/tank-tops-tia-2.jpg','https://d3o8u8o2i2q94t.cloudfront.net/products/tank-tops-white-1.jpg','https://d3o8u8o2i2q94t.cloudfront.net/products/tank-tops-white-2.jpg'],
  },
  {
    name: "Women's Relax Crewneck Tee",
    slug: 'womens-relax-crewneck-tee',
    description: "Simple, breathable, and endlessly wearable. Made from 100% soft cotton with a slightly oversized boxy cut that feels effortless and modern. The Solomon Group label on the back neck is a mark of quality craftsmanship. Available in Sky Blue.",
    price: 42, comparePrice: null, category: 'Tops', badge: 'New', isActive: true,
    details: ['Material: 100% pre-washed cotton jersey','Relaxed slightly oversized boxy fit','Clean ribbed crewneck collar','Short sleeves with clean hem','Dropped shoulder seam for casual silhouette','Solomon Group branded neck label','Care: Machine wash cold','Care: Tumble dry low','Care: Do not bleach','Care: Do not dry clean'],
    variants: [
      { color: 'Sky Blue', colorHex: '#87ceeb', size: 'XS',  sku: 'WRCT-SB-XS',  inventory: 15 },
      { color: 'Sky Blue', colorHex: '#87ceeb', size: 'S',   sku: 'WRCT-SB-S',   inventory: 20 },
      { color: 'Sky Blue', colorHex: '#87ceeb', size: 'M',   sku: 'WRCT-SB-M',   inventory: 25 },
      { color: 'Sky Blue', colorHex: '#87ceeb', size: 'L',   sku: 'WRCT-SB-L',   inventory: 20 },
      { color: 'Sky Blue', colorHex: '#87ceeb', size: 'XL',  sku: 'WRCT-SB-XL',  inventory: 15 },
      { color: 'Sky Blue', colorHex: '#87ceeb', size: 'XXL', sku: 'WRCT-SB-XXL', inventory: 10 },
    ],
    images: ['https://d3o8u8o2i2q94t.cloudfront.net/products/women-s-relax-crewneck-tee-sky-blue-1.jpg','https://d3o8u8o2i2q94t.cloudfront.net/products/women-s-relax-crewneck-tee-sky-blue-2.jpg','https://d3o8u8o2i2q94t.cloudfront.net/products/women-s-relax-crewneck-tee-sky-blue-3.jpg','https://d3o8u8o2i2q94t.cloudfront.net/products/women-s-relax-crewneck-tee-sky-blue-4.jpg'],
  },
  {
    name: "Women's Relaxed Button-Down Oxford Shirt",
    slug: 'womens-relaxed-button-down-oxford-shirt',
    description: "The classic Oxford shirt, redesigned with a relaxed modern fit. Woven from breathable cotton Oxford cloth with a chest patch pocket and slightly curved hem. Available in Butter Yellow and Sky Blue.",
    price: 98, comparePrice: null, category: 'Tops', badge: null, isActive: true,
    details: ['Material: 100% cotton Oxford weave','Relaxed slightly oversized fit','Classic pointed collar with button-down collar points','Full button-front placket with pearlized buttons','Left chest patch pocket','Long sleeves with single-button barrel cuffs','Slightly curved shirttail hem','Solomon Group branded interior neck label','Care: Machine wash warm','Care: Tumble dry medium','Care: Iron on medium heat while slightly damp','Care: Do not bleach'],
    variants: [
      { color: 'Butter Yellow', colorHex: '#f5d78e', size: 'XS', sku: 'WRBDO-BY-XS', inventory: 12 },
      { color: 'Butter Yellow', colorHex: '#f5d78e', size: 'S',  sku: 'WRBDO-BY-S',  inventory: 18 },
      { color: 'Butter Yellow', colorHex: '#f5d78e', size: 'M',  sku: 'WRBDO-BY-M',  inventory: 22 },
      { color: 'Butter Yellow', colorHex: '#f5d78e', size: 'L',  sku: 'WRBDO-BY-L',  inventory: 18 },
      { color: 'Butter Yellow', colorHex: '#f5d78e', size: 'XL', sku: 'WRBDO-BY-XL', inventory: 12 },
      { color: 'Sky Blue',      colorHex: '#87ceeb', size: 'XS', sku: 'WRBDO-SB-XS', inventory: 12 },
      { color: 'Sky Blue',      colorHex: '#87ceeb', size: 'S',  sku: 'WRBDO-SB-S',  inventory: 18 },
      { color: 'Sky Blue',      colorHex: '#87ceeb', size: 'M',  sku: 'WRBDO-SB-M',  inventory: 22 },
      { color: 'Sky Blue',      colorHex: '#87ceeb', size: 'L',  sku: 'WRBDO-SB-L',  inventory: 18 },
      { color: 'Sky Blue',      colorHex: '#87ceeb', size: 'XL', sku: 'WRBDO-SB-XL', inventory: 12 },
    ],
    images: ['https://d3o8u8o2i2q94t.cloudfront.net/products/women-s-relaxed-button-down-oxford-shirt-butter-yellow-1.jpg','https://d3o8u8o2i2q94t.cloudfront.net/products/women-s-relaxed-button-down-oxford-shirt-butter-yellow-2.jpg','https://d3o8u8o2i2q94t.cloudfront.net/products/women-s-relaxed-button-down-oxford-shirt-sky-blue-1.jpg','https://d3o8u8o2i2q94t.cloudfront.net/products/women-s-relaxed-button-down-oxford-shirt-sky-blue-2.jpg'],
  },
]

async function bulkUpload() {
  console.log(`\n🚀 Starting bulk upload of ${products.length} products...\n`)
  for (const product of products) {
    try {
      const existing = await prisma.product.findFirst({ where: { slug: product.slug } })
      if (existing) { console.log(`⏭️  Skipping "${product.name}" — already exists`); continue }
      const created = await prisma.product.create({
        data: {
          name: product.name, slug: product.slug, description: product.description,
          price: product.price, comparePrice: product.comparePrice,
          category: product.category, badge: product.badge,
          isActive: product.isActive, images: product.images, details: product.details,
        },
      })
      for (const variant of product.variants) {
        await prisma.productVariant.create({
          data: {
            productId: created.id, color: variant.color, colorHex: variant.colorHex,
            size: variant.size, sku: variant.sku, inventory: variant.inventory,
          },
        })
      }
      console.log(`✅ Created: "${product.name}" with ${product.variants.length} variants`)
    } catch (err: any) {
      console.error(`❌ Failed: "${product.name}" — ${err.message}`)
    }
  }
  console.log('\n🎉 Bulk upload complete!\n')
  await prisma.$disconnect()
}

bulkUpload()
