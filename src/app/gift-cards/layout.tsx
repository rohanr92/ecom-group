import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Gift Cards',
  alternates: { canonical: 'https://solomonandsage.com/gift-cards' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
