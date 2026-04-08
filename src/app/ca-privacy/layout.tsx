import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'CA Privacy Rights', alternates: { canonical: 'https://solomonandsage.com/ca-privacy' } }
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</> }
