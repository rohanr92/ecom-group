import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign In',
  alternates: { canonical: 'https://solomonandsage.com/account/login' },
  robots: { index: false, follow: false },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
