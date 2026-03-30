// Save as: prisma.config.ts (ROOT folder — REPLACE existing)
import { defineConfig } from 'prisma/config'

export default defineConfig({
  datasource: {
    url: `postgresql://postgres.fscioyqdqxddjfzjkfph:IlovemymotheR92%40@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres`,
  },
  migrations: {
    seed: 'ts-node --compiler-options {"module":"CommonJS"} prisma/seed.ts',
  },
})