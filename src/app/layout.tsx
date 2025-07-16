import type { Metadata } from 'next'
import './globals.css'
import Web3Provider from '@/providers/Web3Provider'

export const metadata: Metadata = {
  title: '🍓 Strawberry Catcher - Web3 Game',
  description: 'Modern Web3 oyunu - Çilekleri yakala, bombaları kaçın! Rainbow Kit ile güçlendirildi.',
  keywords: 'web3, game, phaser, next.js, rainbow kit, blockchain',
  authors: [{ name: 'Boundless Fruit Games' }],
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr">
      <body className="antialiased">
        <Web3Provider>
          {children}
        </Web3Provider>
      </body>
    </html>
  )
}
