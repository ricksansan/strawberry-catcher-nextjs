'use client'

import dynamic from 'next/dynamic'

// Client component'leri dinamik olarak yükle
const GameComponent = dynamic(() => import('@/components/GameComponent'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center w-[700px] h-[500px] max-w-full bg-gradient-to-br from-pink-300 to-purple-300 rounded-2xl">
      <div className="text-2xl font-bold text-white animate-pulse">
        🍓 Loading Game...
      </div>
    </div>
  )
})

const RainbowWallet = dynamic(() => import('@/components/RainbowWallet'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center p-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-lg min-h-[40px] min-w-[200px]">
      <div className="text-sm text-white animate-pulse">
        🌈 Loading...
      </div>
    </div>
  )
})

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-600 animate-gradient-shift">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-r from-pink-400/20 via-purple-400/20 to-indigo-400/20 animate-pulse"></div>
      
      {/* Header - Sabit yükseklik */}
      <header className="relative z-10 flex justify-between items-start p-4 md:p-6 h-[80px] md:h-[100px]">
        {/* Logo - Sabit pozisyon */}
        <div className="flex items-center pt-2">
          <img 
            src="/assets/images/Boundless1.png" 
            alt="Boundless Logo" 
            className="w-10 h-10 md:w-12 md:h-12 rounded-lg shadow-lg"
          />
        </div>

        {/* Cüzdan Bağlantısı - Sağ Üst, Relative positioning */}
        <div className="relative">
          <RainbowWallet />
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex flex-col items-center justify-center gap-6 md:gap-8 p-4 md:p-6 pt-0">
        {/* Game Section */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-4 md:p-8 border border-white/20 shadow-2xl animate-border-glow w-full max-w-4xl">
          <div className="flex flex-col items-center gap-4 md:gap-6">
            <div className="rounded-2xl overflow-hidden shadow-2xl border-4 border-white/30 w-full max-w-[700px]">
              <div className="w-full overflow-x-auto">
                <GameComponent />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center text-white/60 text-xs md:text-sm px-4">
          <p>🌈 Rainbow Kit ile güçlendirildi • 🚀 Next.js 15 & Phaser.js ile yapıldı</p>
          <p className="mt-2">Boundless Fruit Games © 2024</p>
        </footer>
      </main>
    </div>
  )
}
