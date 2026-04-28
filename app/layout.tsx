import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Kart Finder — Your Universal Wishlist',
  description: 'Save products from Amazon, Flipkart, Meesho and any store in one place. Track prices, get drop alerts, share wishlists.',
  icons: { icon: '/favicon.svg' },
  openGraph: {
    title: 'Kart Finder',
    description: 'Your universal shopping wishlist & price tracker',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 antialiased">{children}</body>
    </html>
  )
}
