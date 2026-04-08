import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Track Your Order',
  alternates: { canonical: 'https://solomonandsage.com/track' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
