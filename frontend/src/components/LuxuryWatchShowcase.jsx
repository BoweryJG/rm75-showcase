import { useRef, useMemo, useEffect, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { 
  Environment, 
  PresentationControls, 
  ContactShadows,
  MeshTransmissionMaterial,
  Float,
  useDetectGPU
} from '@react-three/drei'
import * as THREE from 'three'
import TourbillonMechanism from './TourbillonMechanism'

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

// RM 75-01 Authentic Watch Component
function RichardMilleRM75({ variant }) {
  const watchRef = useRef()
  const crystalRef = useRef()
  const tourbillonRef = useRef()
  const { isMobile, isLowEnd } = useDeviceCapabilities()
  
  // iPhone-optimized material variants
  const materials = useMemo(() => ({
    'clear-sapphire': {
      transmission: 0.95,
      thickness: 1.0,
      roughness: 0.02,
      ior: 1.77,
      color: new THREE.Color(0.98, 0.98, 1.0),
      envMapIntensity: 1.0,
    },
    'lilac-pink': {
      transmission: 0.9,
      thickness: 1.0,
      roughness: 0.03,
      ior: 1.77,
      color: new THREE.Color(1.0, 0.85, 0.95),
      envMapIntensity: 0.8,
    },
    'sapphire-blue': {
      transmission: 0.85,
      thickness: 1.0,
      roughness: 0.025,
      ior: 1.77,
      color: new THREE.Color(0.7, 0.85, 1.0),
      envMapIntensity: 0.9,
    }
  }), [])

  const currentMaterial = materials[variant]
  
  // Optimized geometry LOD based on device
  const geometry = useMemo(() => {
    const segments = isMobile ? 16 : isLowEnd ? 24 : 32
    return {
      case: [1.8, 1.6, 0.6, segments],       // Tonneau-shaped case (RM signature)
      crystal: [1.7, 1.5, 0.2, segments],    // Sapphire crystal
      bezel: [1.9, 1.8, 0.1, segments]       // Bezel ring
    }
  }, [isMobile, isLowEnd])

  // Smooth animations optimized for 30fps on mobile
  useFrame((state) => {
    if (watchRef.current) {
      // Gentle breathing animation
      const time = state.clock.elapsedTime
      watchRef.current.position.y = Math.sin(time * 0.5) * 0.01
      watchRef.current.rotation.y = Math.sin(time * 0.2) * 0.02
    }
  })

  return (
    <group ref={watchRef}>
      {/* RM 75-01 Tonneau Case (Signature RM shape) */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.2, 4.8, 1.2]} />
        <meshPhysicalMaterial
          color="#2a2a2a"
          metalness={0.9}
          roughness={0.1}
          clearcoat={0.8}
          clearcoatRoughness={0.1}
          envMapIntensity={1.5}
        />
      </mesh>
      
      {/* Rounded corners for tonneau shape */}
      <mesh position={[1.4, 2.0, 0]} castShadow receiveShadow>
        <sphereGeometry args={[0.4, geometry.case[3], geometry.case[3]]} />
        <meshPhysicalMaterial
          color="#2a2a2a"
          metalness={0.9}
          roughness={0.1}
          clearcoat={0.8}
          clearcoatRoughness={0.1}
          envMapIntensity={1.5}
        />
      </mesh>
      <mesh position={[-1.4, 2.0, 0]} castShadow receiveShadow>
        <sphereGeometry args={[0.4, geometry.case[3], geometry.case[3]]} />
        <meshPhysicalMaterial
          color="#2a2a2a"
          metalness={0.9}
          roughness={0.1}
          clearcoat={0.8}
          clearcoatRoughness={0.1}
          envMapIntensity={1.5}
        />
      </mesh>
      <mesh position={[1.4, -2.0, 0]} castShadow receiveShadow>
        <sphereGeometry args={[0.4, geometry.case[3], geometry.case[3]]} />
        <meshPhysicalMaterial
          color="#2a2a2a"
          metalness={0.9}
          roughness={0.1}
          clearcoat={0.8}
          clearcoatRoughness={0.1}
          envMapIntensity={1.5}
        />
      </mesh>
      <mesh position={[-1.4, -2.0, 0]} castShadow receiveShadow>
        <sphereGeometry args={[0.4, geometry.case[3], geometry.case[3]]} />
        <meshPhysicalMaterial
          color="#2a2a2a"
          metalness={0.9}
          roughness={0.1}
          clearcoat={0.8}
          clearcoatRoughness={0.1}
          envMapIntensity={1.5}
        />
      </mesh>
      
      {/* Sapphire Crystal - Proper RM 75-01 form */}
      <mesh ref={crystalRef} position={[0, 0, 0.65]} castShadow>
        <boxGeometry args={[2.8, 4.4, 0.3]} />
        <MeshTransmissionMaterial
          {...currentMaterial}
          samples={isMobile ? 4 : 8}
          resolution={isMobile ? 256 : 512}
        />
      </mesh>
      
      {/* Flying Tourbillon at 6 o'clock position (RM 75-01 layout) */}
      <TourbillonMechanism 
        ref={tourbillonRef} 
        position={[0, -1.2, 0.4]} 
        scale={isMobile ? 0.8 : 1.0}
        simplified={isMobile || isLowEnd}
      />
      
      {/* Movement bridges - Gothic architecture inspired */}
      <mesh position={[0, 0.8, 0.4]}>
        <boxGeometry args={[2.4, 0.2, 0.1]} />
        <meshPhysicalMaterial
          color="#1a1a1a"
          metalness={0.95}
          roughness={0.05}
        />
      </mesh>
      <mesh position={[0, -0.4, 0.4]}>
        <boxGeometry args={[2.4, 0.2, 0.1]} />
        <meshPhysicalMaterial
          color="#1a1a1a"
          metalness={0.95}
          roughness={0.05}
        />
      </mesh>
      
      {/* SuperLuminova hour markers */}
      {[...Array(12)].map((_, i) => {
        const angle = (i * Math.PI * 2) / 12
        const radius = 1.8
        const x = Math.sin(angle) * radius
        const y = Math.cos(angle) * radius
        
        return (
          <mesh key={i} position={[x, y, 0.5]}>
            <cylinderGeometry args={[0.05, 0.05, 0.02, 8]} />
            <meshBasicMaterial
              color={variant === 'lilac-pink' ? '#ff69b4' : 
                     variant === 'sapphire-blue' ? '#4169e1' : '#ffffff'}
              emissive={variant === 'lilac-pink' ? '#ff1493' : 
                       variant === 'sapphire-blue' ? '#1e90ff' : '#ffffff'}
              emissiveIntensity={0.3}
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