'use client'

import '@rainbow-me/rainbowkit/styles.css'
import { useEffect, useState } from 'react'
import {
  getDefaultConfig,
  RainbowKitProvider,
  darkTheme,
} from '@rainbow-me/rainbowkit'
import { WagmiProvider } from 'wagmi'
import {
  mainnet,
  polygon,
  optimism,
  arbitrum,
  base,
  sepolia,
} from 'wagmi/chains'
import {
  QueryClientProvider,
  QueryClient,
} from "@tanstack/react-query"

const config = getDefaultConfig({
  appName: 'Strawberry Catcher',
  projectId: '370011c870345409bdfbe756cef57a9d',
  chains: [mainnet, polygon, optimism, arbitrum, base, sepolia],
  ssr: true,
})

const queryClient = new QueryClient()

// Custom Rainbow Kit theme
const customTheme = darkTheme({
  accentColor: '#FF6B9D',
  accentColorForeground: 'white',
  borderRadius: 'large',
  fontStack: 'system',
})

export default function Web3Provider({
  children,
}: {
  children: React.ReactNode
}) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // Simple MetaMask detection without error handling
    if (typeof window !== 'undefined') {
      try {
        const { ethereum } = window as any
        if (ethereum && ethereum.isMetaMask) {
          console.log('MetaMask detected successfully')
        }
      } catch (error) {
        // Suppress MetaMask detection errors
      }
    }
  }, [])

  if (!mounted) {
    return <>{children}</>
  }

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider 
          theme={customTheme}
          modalSize="compact"
          appInfo={{
            appName: 'Strawberry Catcher',
            learnMoreUrl: 'https://boundlessfruit.com',
          }}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
} 