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
    
    // Kapsamlı MetaMask error prevention
    if (typeof window !== 'undefined') {
      // Store original console.error
      const originalConsoleError = console.error
      
      // Override console.error to filter MetaMask errors
      console.error = (...args) => {
        const message = args.join(' ')
        if (
          message.includes('runtime.sendMessage') ||
          message.includes('Extension context invalidated') ||
          message.includes('chrome-extension://') ||
          message.includes('Cannot access a chrome-extension://')
        ) {
          // Suppress MetaMask related errors
          return
        }
        // Call original console.error for other errors
        originalConsoleError.apply(console, args)
      }

      // Global error event listener
      const handleError = (event: ErrorEvent) => {
        if (
          event.message?.includes('runtime.sendMessage') ||
          event.message?.includes('Extension context invalidated') ||
          event.message?.includes('chrome-extension://')
        ) {
          event.preventDefault()
          event.stopPropagation()
          return false
        }
      }

      // Unhandled promise rejection handler
      const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
        const message = event.reason?.message || String(event.reason)
        if (
          message.includes('runtime.sendMessage') ||
          message.includes('Extension context invalidated') ||
          message.includes('chrome-extension://')
        ) {
          event.preventDefault()
          return false
        }
      }

      // Add event listeners
      window.addEventListener('error', handleError, true)
      window.addEventListener('unhandledrejection', handleUnhandledRejection, true)

      // MetaMask detection with error suppression
      try {
        const { ethereum } = window as any
        if (ethereum && ethereum.isMetaMask) {
          console.log('MetaMask detected successfully')
        }
      } catch (error) {
        // Suppress MetaMask detection errors
      }

      // Cleanup function
      return () => {
        window.removeEventListener('error', handleError, true)
        window.removeEventListener('unhandledrejection', handleUnhandledRejection, true)
        console.error = originalConsoleError
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