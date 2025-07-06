import { Suspense, useState, lazy } from 'react'
import { Canvas } from '@react-three/fiber'
import { Loader } from '@react-three/drei'
import ErrorBoundary from './components/ErrorBoundary'
import LoadingPlaceholder from './components/LoadingPlaceholder'
import './App.css'

// Lazy load heavy components for better initial load on iPhones
const LuxuryWatchShowcase = lazy(() => import('./components/LuxuryWatchShowcase'))
const SupabaseDataLayer = lazy(() => import('./components/SupabaseDataLayer'))
const PerformanceMonitor = lazy(() => import('./components/PerformanceMonitor'))

function App() {
  const [dataMode, setDataMode] = useState(false)
  const [selectedVariant, setSelectedVariant] = useState('clear-sapphire')
  const [showPerformance, setShowPerformance] = useState(true)

  return (
    <ErrorBoundary>
      <div className="app-container">
        <Canvas
        shadows
        dpr={[1, Math.min(window.devicePixelRatio, 2)]}
        camera={{ position: [0, 1, 8], fov: 45 }}
        gl={{
          powerPreference: "high-performance",
          alpha: false,
          antialias: window.innerWidth < 768 ? false : true,
          stencil: false,
          depth: true,
          logarithmicDepthBuffer: false,
        }}
        performance={{ min: 0.5 }}
      >
        <Suspense fallback={<LoadingPlaceholder />}>
          <LuxuryWatchShowcase 
            variant={selectedVariant}
          />
          {dataMode && <SupabaseDataLayer variant={selectedVariant} />}
          {showPerformance && <PerformanceMonitor />}
        </Suspense>
      </Canvas>
      
      <div className="controls-overlay">
        <div className="variant-selector">
          <button 
            className={selectedVariant === 'clear-sapphire' ? 'active' : ''}
            onClick={() => setSelectedVariant('clear-sapphire')}
          >
            Clear Sapphire
          </button>
          <button 
            className={selectedVariant === 'lilac-pink' ? 'active' : ''}
            onClick={() => setSelectedVariant('lilac-pink')}
          >
            Lilac Pink
          </button>
          <button 
            className={selectedVariant === 'sapphire-blue' ? 'active' : ''}
            onClick={() => setSelectedVariant('sapphire-blue')}
          >
            Sapphire Blue
          </button>
        </div>
        
        <div className="mode-toggle">
          <label>
            <input 
              type="checkbox" 
              checked={dataMode}
              onChange={(e) => setDataMode(e.target.checked)}
            />
            <span>Data Enhancement Mode</span>
          </label>
        </div>
        
        <div className="mode-toggle" style={{ marginTop: '10px' }}>
          <label>
            <input 
              type="checkbox" 
              checked={showPerformance}
              onChange={(e) => setShowPerformance(e.target.checked)}
            />
            <span>Show Performance</span>
          </label>
        </div>
      </div>
      
      <Loader />
    </div>
    </ErrorBoundary>
  )
}

export default App