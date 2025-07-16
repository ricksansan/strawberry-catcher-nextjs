'use client'

import { useEffect } from 'react'

export default function ErrorBoundary({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Global error suppression for MetaMask
    if (typeof window !== 'undefined') {
      // Store original console.error and console.warn
      const originalError = console.error;
      const originalWarn = console.warn;
      
      // Override console.error to filter MetaMask errors
      console.error = (...args) => {
        const message = args.join(' ');
        if (
          message.includes('runtime.sendMessage') ||
          message.includes('Extension context invalidated') ||
          message.includes('chrome-extension://') ||
          message.includes('Cannot access a chrome-extension://') ||
          message.includes('Error in invocation of runtime.sendMessage') ||
          message.includes('chrome.runtime.sendMessage()') ||
          message.includes('Extension ID') ||
          message.includes('inpage.js')
        ) {
          // Suppress MetaMask related errors silently
          return;
        }
        originalError.apply(console, args);
      };

      // Override console.warn to filter MetaMask warnings
      console.warn = (...args) => {
        const message = args.join(' ');
        if (
          message.includes('runtime.sendMessage') ||
          message.includes('Extension context invalidated') ||
          message.includes('chrome-extension://') ||
          message.includes('inpage.js')
        ) {
          return;
        }
        originalWarn.apply(console, args);
      };

      // Intercept chrome.runtime if it exists
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

      // Global error handler
      const handleGlobalError = (event: ErrorEvent) => {
        const message = event.message || '';
        if (
          message.includes('runtime.sendMessage') ||
          message.includes('Extension context invalidated') ||
          message.includes('chrome-extension://') ||
          message.includes('Error in invocation of runtime.sendMessage') ||
          message.includes('chrome.runtime.sendMessage()') ||
          message.includes('Extension ID') ||
          event.filename?.includes('chrome-extension://') ||
          event.filename?.includes('inpage.js')
        ) {
          event.preventDefault();
          event.stopPropagation();
          event.stopImmediatePropagation();
          return false;
        }
      };

      // Unhandled promise rejection handler
      const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
        const message = event.reason?.message || String(event.reason);
        if (
          message.includes('runtime.sendMessage') ||
          message.includes('Extension context invalidated') ||
          message.includes('chrome-extension://') ||
          message.includes('Error in invocation of runtime.sendMessage') ||
          message.includes('Extension ID')
        ) {
          event.preventDefault();
          event.stopImmediatePropagation();
          return false;
        }
      };

      // Add event listeners with capture=true for early intervention
      window.addEventListener('error', handleGlobalError, { capture: true, passive: false });
      window.addEventListener('unhandledrejection', handleUnhandledRejection, { capture: true, passive: false });

      // Additional error suppression for document level
      document.addEventListener('error', handleGlobalError, { capture: true, passive: false });

      // Cleanup function
      return () => {
        window.removeEventListener('error', handleGlobalError, { capture: true });
        window.removeEventListener('unhandledrejection', handleUnhandledRejection, { capture: true });
        document.removeEventListener('error', handleGlobalError, { capture: true });
        console.error = originalError;
        console.warn = originalWarn;
      };
    }
  }, []);

  return <>{children}</>;
} 