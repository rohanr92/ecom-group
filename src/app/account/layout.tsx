// Save as: src/app/account/layout.tsx (REPLACE existing)
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import ClientAccountLayout from './ClientAccountLayout'

const BARE_PAGES     = ['/account/login', '/account/register', '/account/forgot-password']
const SESSION_COOKIE = 'sl_session'

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Server-side auth check — no flicker
  const cookieStore = await cookies()
  const token       = cookieStore.get(SESSION_COOKIE)?.value

  return (
    <ClientAccountLayout token={token ?? null}>
      {children}
    </ClientAccountLayout>
  )
}