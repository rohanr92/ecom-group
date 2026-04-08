import type { Metadata } from 'next'
export const metadata: Metadata = {
  title: 'Shopping Bag',
  alternates: { canonical: 'https://solomonandsage.com/cart' },
}
export default function CartLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
