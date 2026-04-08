import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'Checkout' }

import { cookies } from 'next/headers'
import CheckoutClient from './CheckoutClient'
import { useCurrency } from '@/hooks/useCurrency'

export default async function CheckoutPage() {
  let user = null
  try {
    const cookieStore = await cookies()
    const allCookies = cookieStore.getAll()
    
    const cookieHeader = allCookies.map(c => `${c.name}=${c.value}`).join('; ')

    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/auth/me`, {
      headers: { cookie: cookieHeader },
      cache: 'no-store',
    })
    const data = await res.json()
    
    if (data.user) user = data.user
  } catch (err) {

  }

  return <CheckoutClient initialUser={user} />
}