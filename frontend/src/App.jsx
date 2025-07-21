import { Suspense, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { Loader } from '@react-three/drei'
import LuxuryWatchShowcase from './components/LuxuryWatchShowcase'
import ErrorBoundary from './components/ErrorBoundary'
import './App.css'

function App() {
  const [selectedVariant, setSelectedVariant] = useState('clear-sapphire')

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
        <Suspense fallback={null}>
          <LuxuryWatchShowcase 
            variant={selectedVariant}
          />
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
      </div>
      
      <Loader />
    </div>
    </ErrorBoundary>
  )
}

export default App