// Save as: src/lib/prisma.ts (REPLACE existing)
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const adapter = new PrismaPg({
  connectionString: 'postgresql://postgres.fscioyqdqxddjfzjkfph:IlovemymotheR92%40@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres',
})

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma