import { useRef } from 'react'
import { PresentationControls } from '@react-three/drei'

// Absolutely Minimal Working Watch - Proper Scale
function RichardMilleRM75({ variant }) {
  const watchRef = useRef()
  
  // Realistic watch scale (actual RM size ~45mm = 0.45 units)
  const scale = 0.4
  
  const variantColors = {
    'clear-sapphire': '#ffffff',
    'lilac-pink': '#ffc0cb', 
    'sapphire-blue': '#4169e1'
  }

  return (
    <group ref={watchRef} scale={scale}>
      {/* Main case - proper tonneau proportions */}
      <mesh>
        <boxGeometry args={[1.8, 2.4, 0.5]} />
        <meshBasicMaterial color="#2a2a2a" />
      </mesh>
      
      {/* Crystal */}
      <mesh position={[0, 0, 0.26]}>
        <boxGeometry args={[1.6, 2.2, 0.1]} />
        <meshBasicMaterial 
          color={variantColors[variant]}
          transparent
          opacity={0.5}
        />
      </mesh>
      
      {/* Simple tourbillon */}
      <mesh position={[0, -0.6, 0.28]}>
        <cylinderGeometry args={[0.15, 0.15, 0.05, 8]} />
        <meshBasicMaterial color="#ffd700" />
      </mesh>
    </group>
  )
}

// Ultra-Simple Showcase - Just Works
export default function LuxuryWatchShowcase({ variant = 'clear-sapphire' }) {
  return (
    <>
      <color attach="background" args={['#111111']} />
      
      {/* Basic lighting only */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[2, 2, 2]} intensity={1} />
      
      <PresentationControls
        global
        zoom={2}
        rotation={[0, 0, 0]}
        polar={[-Math.PI / 4, Math.PI / 4]}
        azimuth={[-Math.PI / 4, Math.PI / 4]}
      >
        <RichardMilleRM75 variant={variant} />
      </PresentationControls>
    </>
  )
}