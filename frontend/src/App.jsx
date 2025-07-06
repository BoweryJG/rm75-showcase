import { Suspense, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { Loader } from '@react-three/drei'
import LuxuryWatchShowcase from './components/LuxuryWatchShowcase'
import SupabaseDataLayer from './components/SupabaseDataLayer'
import './App.css'

function App() {
  const [dataMode, setDataMode] = useState(false)
  const [selectedVariant, setSelectedVariant] = useState('clear-sapphire')

  return (
    <div className="app-container">
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 0, 5], fov: 35 }}
        gl={{
          powerPreference: "high-performance",
          alpha: true,
          antialias: true,
          stencil: false,
          depth: true,
          logarithmicDepthBuffer: true,
        }}
      >
        <Suspense fallback={null}>
          <LuxuryWatchShowcase 
            variant={selectedVariant}
            dataMode={dataMode}
          />
          {dataMode && <SupabaseDataLayer variant={selectedVariant} />}
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
      </div>
      
      <Loader />
    </div>
  )
}

export default App