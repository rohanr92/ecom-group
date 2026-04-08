import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Forgot Password',
  alternates: { canonical: 'https://solomonandsage.com/account/forgot-password' },
  robots: { index: false, follow: false },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
