import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Influencers',
  alternates: { canonical: 'https://solomonandsage.com/influencers' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
