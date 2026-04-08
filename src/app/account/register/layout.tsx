import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Create Account',
  alternates: { canonical: 'https://solomonandsage.com/account/register' },
  robots: { index: false, follow: false },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
