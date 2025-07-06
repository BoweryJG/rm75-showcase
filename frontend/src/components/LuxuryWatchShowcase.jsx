import { useRef, useMemo, useEffect, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { 
  Environment, 
  PresentationControls, 
  ContactShadows,
  Float
} from '@react-three/drei'
import * as THREE from 'three'

// iPhone-optimized lighting setup
function OptimizedLighting() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[5, 5, 5]}
        intensity={0.8}
        castShadow
        shadow-mapSize={1024}
        shadow-camera-far={20}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
      />
      <pointLight
        position={[0, 3, 2]}
        intensity={0.3}
        color="#ffffff"
      />
    </>
  )
}

// Device capability detection
function useDeviceCapabilities() {
  const [isMobile, setIsMobile] = useState(false)
  const [isLowEnd, setIsLowEnd] = useState(false)
  
  useEffect(() => {
    const checkDevice = () => {
      const userAgent = navigator.userAgent.toLowerCase()
      const isMobileDevice = /mobile|android|iphone|ipad|tablet/.test(userAgent)
      const isLowEndDevice = navigator.hardwareConcurrency < 4 || 
                           navigator.deviceMemory < 4
      
      setIsMobile(isMobileDevice)
      setIsLowEnd(isLowEndDevice)
    }
    
    checkDevice()
  }, [])
  
  return { isMobile, isLowEnd }
}

// Emergency Ultra-Minimal RM 75-01 - GPU Safe
function RichardMilleRM75({ variant }) {
  const watchRef = useRef()
  
  // Ultra-simple materials to prevent GPU overload
  const variantColors = {
    'clear-sapphire': '#f0f0f0',
    'lilac-pink': '#ffb3d9', 
    'sapphire-blue': '#6bb6ff'
  }

  // Minimal animation
  useFrame((state) => {
    if (watchRef.current) {
      watchRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1
    }
  })

  return (
    <group ref={watchRef}>
      {/* Ultra-simple tonneau case */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[3, 4.5, 1]} />
        <meshStandardMaterial
          color="#333333"
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      
      {/* Simple crystal - no transmission material */}
      <mesh position={[0, 0, 0.6]}>
        <boxGeometry args={[2.6, 4.2, 0.2]} />
        <meshStandardMaterial
          color={variantColors[variant]}
          transparent
          opacity={0.7}
          metalness={0.1}
          roughness={0.1}
        />
      </mesh>
      
      {/* Simplified tourbillon placeholder */}
      <mesh position={[0, -1.2, 0.5]}>
        <cylinderGeometry args={[0.3, 0.3, 0.1, 12]} />
        <meshStandardMaterial
          color="#gold"
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
      
      {/* Minimal hour markers - only 4 instead of 12 */}
      {[0, 90, 180, 270].map((angle, i) => {
        const rad = (angle * Math.PI) / 180
        const x = Math.sin(rad) * 1.6
        const y = Math.cos(rad) * 1.8
        
        return (
          <mesh key={i} position={[x, y, 0.4]}>
            <boxGeometry args={[0.1, 0.1, 0.05]} />
            <meshStandardMaterial
              color="#ffffff"
              emissive="#ffffff"
              emissiveIntensity={0.1}
            />
          </mesh>
        )
      })}
    </group>
  )
}

// Main showcase component - iPhone optimized
export default function LuxuryWatchShowcase({ variant = 'clear-sapphire' }) {
  const { isMobile, isLowEnd } = useDeviceCapabilities()

  return (
    <>
      <color attach="background" args={['#0a0a0a']} />
      
      <OptimizedLighting />
      
      <Environment
        preset="city"
        resolution={isMobile ? 512 : 1024}
        background={false}
      />
      
      <PresentationControls
        global
        zoom={isMobile ? 1.2 : 0.8}
        rotation={[0, -Math.PI / 6, 0]}
        polar={[-Math.PI / 3, Math.PI / 3]}
        azimuth={[-Math.PI / 3, Math.PI / 3]}
        config={{ mass: 1, tension: 300 }}
        snap={{ mass: 2, tension: 300 }}
      >
        <Float
          speed={1}
          rotationIntensity={0.1}
          floatIntensity={0.2}
          floatingRange={[-0.05, 0.05]}
        >
          <RichardMilleRM75 variant={variant} />
        </Float>
      </PresentationControls>
      
      {/* Simple contact shadows for iPhone performance */}
      <ContactShadows
        position={[0, -3, 0]}
        opacity={0.4}
        scale={10}
        blur={1.5}
        far={4}
      />
      
      {/* Simplified display surface */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial
          color="#111111"
          metalness={0.3}
          roughness={0.7}
        />
      </mesh>
    </>
  )
}