import { cookies } from 'next/headers'
import AdminClientLayout from './AdminClientLayout'

const ADMIN_COOKIE = 'sl_admin_session'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore     = await cookies()
  const token           = cookieStore.get(ADMIN_COOKIE)?.value
  const isAuthenticated = !!(token && token.length > 10)

  return (
    <AdminClientLayout isAuthenticated={isAuthenticated}>
      {children}
    </AdminClientLayout>
  )
}