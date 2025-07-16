'use client'

import { useEffect } from 'react'

export default function ErrorBoundary({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Global error suppression for MetaMask
    if (typeof window !== 'undefined') {
      // Store original console.error and console.warn
      const originalError = console.error;
      const originalWarn = console.warn;
      
      // More selective console.error override to avoid interfering with Next.js
      console.error = (...args) => {
        const message = args.join(' ');
        
        // Only suppress specific MetaMask errors, not all errors
        if (
          (message.includes('runtime.sendMessage') && message.includes('chrome-extension://')) ||
          (message.includes('Extension context invalidated') && message.includes('MetaMask')) ||
          (message.includes('Error in invocation of runtime.sendMessage') && message.includes('Extension ID')) ||
          (message.includes('inpage.js') && message.includes('chrome-extension://'))
        ) {
          // Suppress only verified MetaMask related errors
          return;
        }
        
        // Let all other errors through, including Next.js errors
        originalError.apply(console, args);
      };

      // More selective console.warn override
      console.warn = (...args) => {
        const message = args.join(' ');
        if (
          (message.includes('runtime.sendMessage') && message.includes('chrome-extension://')) ||
          (message.includes('Extension context invalidated') && message.includes('MetaMask'))
        ) {
          return;
        }
        originalWarn.apply(console, args);
      };

      // Intercept chrome.runtime if it exists (keep this as is)
      if (typeof window !== 'undefined' && (window as any).chrome && (window as any).chrome.runtime) {
        const chrome = (window as any).chrome;
        const originalSendMessage = chrome.runtime.sendMessage;
        chrome.runtime.sendMessage = function(...args: any[]) {
          try {
            return originalSendMessage.apply(this, args);
          } catch (error) {
            // Silently ignore chrome.runtime.sendMessage errors
            return Promise.resolve();
          }
        };
      }

      // More selective global error handler
      const handleGlobalError = (event: ErrorEvent) => {
        const message = event.message || '';
        const filename = event.filename || '';
        
        // Only handle MetaMask specific errors, not Next.js errors
        if (
          (message.includes('runtime.sendMessage') && filename.includes('chrome-extension://')) ||
          (message.includes('Extension context invalidated') && filename.includes('inpage.js')) ||
          (message.includes('Error in invocation of runtime.sendMessage') && message.includes('Extension ID')) ||
          filename.includes('chrome-extension://inpage.js')
        ) {
          event.preventDefault();
          event.stopPropagation();
          return false;
        }
        
        // Let Next.js and other legitimate errors bubble up
        return true;
      };

      // More selective unhandled promise rejection handler
      const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
        const message = event.reason?.message || String(event.reason);
        
        // Only handle MetaMask specific rejections
        if (
          (message.includes('runtime.sendMessage') && message.includes('chrome-extension://')) ||
          (message.includes('Extension context invalidated') && message.includes('MetaMask')) ||
          (message.includes('Error in invocation of runtime.sendMessage') && message.includes('Extension ID'))
        ) {
          event.preventDefault();
          return false;
        }
        
        // Let Next.js and other legitimate promise rejections bubble up
        return true;
      };

      // Add event listeners with lower priority to avoid interfering with Next.js
      window.addEventListener('error', handleGlobalError, { capture: false, passive: false });
      window.addEventListener('unhandledrejection', handleUnhandledRejection, { capture: false, passive: false });

      // Cleanup function
      return () => {
        window.removeEventListener('error', handleGlobalError);
        window.removeEventListener('unhandledrejection', handleUnhandledRejection);
        console.error = originalError;
        console.warn = originalWarn;
      };
    }
  }, []);

  return <>{children}</>;
} 