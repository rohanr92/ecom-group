import type { Metadata } from 'next'
import './globals.css'
import { CartProvider } from '@/components/CartContext'

export const metadata: Metadata = {
  title: 'Solomon Lawrence | Premium Clothing',
  description: "Contemporary clothing for women and men. Available at Nordstrom, Macy's, Kohl's, and JCPenney.",
  keywords: 'Solomon Lawrence, clothing, fashion, women, men, premium',
  openGraph: {
    title: 'Solomon Lawrence',
    description: 'Contemporary clothing for women and men.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  )
}