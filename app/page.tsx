import dynamic from 'next/dynamic'
import { Suspense } from 'react'

const WatchDashboard = dynamic(() => import('../components/watches/WatchDashboard'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-black">
      <div className="text-center">
        <div className="relative">
          {/* Richard Mille style loading animation */}
          <div className="w-20 h-20 border-2 border-white/20 rounded-full animate-spin mx-auto mb-6">
            <div className="w-4 h-4 bg-orange-500 rounded-full absolute top-0 left-1/2 transform -translate-x-1/2"></div>
          </div>
          <div className="w-16 h-16 border-2 border-green-500/30 rounded-full animate-spin absolute top-2 left-1/2 transform -translate-x-1/2" style={{ animationDirection: 'reverse' }}></div>
        </div>
        <h1 className="text-white text-2xl font-light mb-2">RICHARD MILLE</h1>
        <p className="text-white/80 text-lg font-medium">Digital Horological Masterpiece</p>
        <p className="text-white/60 text-sm mt-2">Precision Engineering • McLaren F1 • Yohan Blake</p>
        <div className="mt-6 flex items-center justify-center gap-2">
          <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse delay-200"></div>
          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse delay-400"></div>
        </div>
      </div>
    </div>
  )
})

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black overflow-hidden">
      <div className="relative">
        {/* Richard Mille Brand Signature Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-black to-slate-800" />
        
        {/* Ambient lighting effects - McLaren Orange & Jamaica Green */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-500/15 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-amber-500/10 rounded-full blur-2xl animate-pulse delay-500" />
        
        {/* Luxury carbon fiber texture overlay */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              linear-gradient(45deg, #333 25%, transparent 25%),
              linear-gradient(-45deg, #333 25%, transparent 25%),
              linear-gradient(45deg, transparent 75%, #333 75%),
              linear-gradient(-45deg, transparent 75%, #333 75%)
            `,
            backgroundSize: '2px 2px',
            backgroundPosition: '0 0, 0 1px, 1px -1px, -1px 0px'
          }}
        />
        
        {/* Main Richard Mille Dashboard */}
        <div className="relative z-10">
          <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
              <div className="text-center">
                <div className="relative">
                  {/* Richard Mille style loading animation */}
                  <div className="w-20 h-20 border-2 border-white/20 rounded-full animate-spin mx-auto mb-6">
                    <div className="w-4 h-4 bg-orange-500 rounded-full absolute top-0 left-1/2 transform -translate-x-1/2"></div>
                  </div>
                  <div className="w-16 h-16 border-2 border-green-500/30 rounded-full animate-spin absolute top-2 left-1/2 transform -translate-x-1/2" style={{ animationDirection: 'reverse' }}></div>
                </div>
                <h1 className="text-white text-2xl font-light mb-2">RICHARD MILLE</h1>
                <p className="text-white/80 text-lg font-medium">Digital Horological Masterpiece</p>
                <p className="text-white/60 text-sm mt-2">Precision Engineering • McLaren F1 • Yohan Blake</p>
                <div className="mt-6 flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse delay-200"></div>
                  <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse delay-400"></div>
                </div>
              </div>
            </div>
          }>
            <WatchDashboard 
              initialWatch="rm-11-03-mclaren"
              enableAudio={true}
              enableAnimations={true}
              performanceMode="auto"
              className="richard-mille-dashboard"
            />
          </Suspense>
        </div>

        {/* Signature branding footer */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-50 text-center">
          <p className="text-white/40 text-xs font-light tracking-wider">
            A RACING MACHINE ON THE WRIST
          </p>
        </div>
      </div>
    </main>
  )
}