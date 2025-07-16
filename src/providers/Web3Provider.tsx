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
    
    // MetaMask detection and error prevention
    if (typeof window !== 'undefined') {
      // Check if MetaMask is available
      const { ethereum } = window as any
      if (ethereum && ethereum.isMetaMask) {
        console.log('MetaMask detected')
      }
      
      // Prevent runtime.sendMessage errors
      window.addEventListener('error', (event) => {
        if (event.message.includes('runtime.sendMessage')) {
          event.preventDefault()
          console.warn('Prevented MetaMask runtime.sendMessage error')
        }
      })

      // Prevent unhandled promise rejections from MetaMask
      window.addEventListener('unhandledrejection', (event) => {
        if (event.reason && event.reason.message && 
            event.reason.message.includes('runtime.sendMessage')) {
          event.preventDefault()
          console.warn('Prevented MetaMask unhandled rejection')
        }
      })
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