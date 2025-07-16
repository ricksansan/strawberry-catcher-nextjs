'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount } from 'wagmi'

export default function RainbowWallet() {
  const { address, isConnected } = useAccount()

  const handleTwitterClick = () => {
    window.open('https://twitter.com/ex_machinam', '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="flex flex-col items-end gap-3 min-w-[200px]">
      {/* Sabit yükseklikli container - Layout kaymasını önler */}
      <div className="min-h-[40px] flex items-center justify-end">
        <div className="rainbow-button-container">
          <ConnectButton 
            label="Connect Wallet"
            chainStatus="icon"
            accountStatus={{
              smallScreen: 'avatar',
              largeScreen: 'full',
            }}
            showBalance={{
              smallScreen: false,
              largeScreen: false,
            }}
          />
        </div>
      </div>

      {/* Twitter Button - Sadece ikon */}
      <button
        onClick={handleTwitterClick}
        className="flex items-center justify-center w-10 h-10 bg-blue-500/80 hover:bg-blue-500 text-white rounded-lg transition-all duration-300 hover:scale-105 backdrop-blur-sm border border-blue-400/30 shadow-lg"
        title="@ex_machinam"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      </button>

      {/* Rainbow Kit özel stil - Orijinal boyutları koruma */}
      <style jsx global>{`
        .rainbow-button-container button {
          background: linear-gradient(135deg, #FF6B9D 0%, #8B5CF6 100%) !important;
          border: none !important;
          border-radius: 10px !important;
          padding: 8px 16px !important;
          font-weight: 600 !important;
          font-size: 14px !important;
          color: white !important;
          transition: all 0.3s ease !important;
          box-shadow: 0 4px 20px rgba(255, 107, 157, 0.25) !important;
          min-height: 40px !important;
          min-width: 140px !important;
        }
        
        .rainbow-button-container button:hover {
          transform: translateY(-1px) !important;
          box-shadow: 0 6px 25px rgba(255, 107, 157, 0.35) !important;
          background: linear-gradient(135deg, #FF5A8A 0%, #7C3AED 100%) !important;
        }
        
        .rainbow-button-container [data-rk] {
          background: transparent !important;
          backdrop-filter: none !important;
          border: none !important;
          border-radius: 10px !important;
          font-size: 14px !important;
          min-height: 40px !important;
          min-width: 140px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }

        /* Bağlı durumda buton stilleri - Orijinal boyutları koru */
        .rainbow-button-container div[data-rk] > div {
          padding: 8px 12px !important;
          gap: 8px !important;
          display: flex !important;
          align-items: center !important;
          white-space: nowrap !important;
        }

        /* Avatar boyutunu orijinal Rainbow Kit boyutlarına çevir */
        .rainbow-button-container img {
          width: 24px !important;
          height: 24px !important;
          flex-shrink: 0 !important;
        }

        /* Chain icon boyutunu orijinal Rainbow Kit boyutlarına çevir */
        .rainbow-button-container [data-rk] img[alt*="Chain"], 
        .rainbow-button-container [data-rk] img[src*="chain"] {
          width: 24px !important;
          height: 24px !important;
          flex-shrink: 0 !important;
        }

        /* Ethereum ve diğer network iconları için orijinal boyut */
        .rainbow-button-container [data-rk] > div > img:first-child {
          width: 24px !important;
          height: 24px !important;
          margin-right: 8px !important;
        }

        /* Text overflow kontrolü */
        .rainbow-button-container [data-rk] > div > div {
          overflow: hidden !important;
          text-overflow: ellipsis !important;
          max-width: 80px !important;
        }

        /* Network seçici dropdown için */
        .rainbow-button-container [data-rk] [role="button"] img {
          width: 24px !important;
          height: 24px !important;
        }
      `}</style>
    </div>
  )
} 