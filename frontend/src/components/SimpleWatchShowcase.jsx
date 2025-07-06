import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { 
  PresentationControls, 
  Environment,
  ContactShadows,
  MeshReflectorMaterial,
  Float
} from '@react-three/drei'
import * as THREE from 'three'
import TourbillonMechanism from './TourbillonMechanism'

// Watch component with proper scale
function Watch({ variant }) {
  const watchRef = useRef()
  const crystalRef = useRef()
  
  // Material variants
  const materials = {
    'clear-sapphire': {
      caseColor: '#1a1a1a',
      crystalColor: '#ffffff',
      crystalOpacity: 0.3,
      emissive: '#000000'
    },
    'lilac-pink': {
      caseColor: '#2d1a2d',
      crystalColor: '#ffb3d9',
      crystalOpacity: 0.4,
      emissive: '#4a0e4e'
    },
    'sapphire-blue': {
      caseColor: '#0a1929',
      crystalColor: '#64b5f6',
      crystalOpacity: 0.4,
      emissive: '#001e3c'
    }
  }
  
  const currentMaterial = materials[variant] || materials['clear-sapphire']
  
  // Subtle rotation
  useFrame((state) => {
    if (watchRef.current) {
      watchRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1
    }
  })
  
  return (
    <group ref={watchRef} scale={2}>
      {/* Watch case - smaller for better initial view */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1, 0.95, 0.3, 64, 1]} />
        <meshPhysicalMaterial 
          color={currentMaterial.caseColor}
          metalness={0.9}
          roughness={0.1}
          clearcoat={1}
          clearcoatRoughness={0.01}
          emissive={currentMaterial.emissive}
          emissiveIntensity={0.1}
        />
      </mesh>
      
      {/* Watch bezel */}
      <mesh position={[0, 0.15, 0]} castShadow>
        <torusGeometry args={[0.95, 0.05, 16, 64]} />
        <meshStandardMaterial 
          color="#FFD700"
          metalness={0.95}
          roughness={0.05}
        />
      </mesh>
      
      {/* Crystal */}
      <mesh ref={crystalRef} position={[0, 0.15, 0]} castShadow>
        <cylinderGeometry args={[0.9, 0.9, 0.05, 64]} />
        <meshPhysicalMaterial
          color={currentMaterial.crystalColor}
          transparent
          opacity={currentMaterial.crystalOpacity}
          transmission={0.9}
          thickness={0.5}
          roughness={0}
          metalness={0}
          clearcoat={1}
          clearcoatRoughness={0}
          ior={1.5}
          reflectivity={0.5}
        />
      </mesh>
      
      {/* Watch face */}
      <mesh position={[0, 0.1, 0]} receiveShadow>
        <cylinderGeometry args={[0.89, 0.89, 0.01, 64]} />
        <meshStandardMaterial 
          color="#000000"
          metalness={0.5}
          roughness={0.5}
        />
      </mesh>
      
      {/* Hour markers */}
      {Array.from({ length: 12 }, (_, i) => {
        const angle = (i / 12) * Math.PI * 2
        const x = Math.sin(angle) * 0.75
        const z = Math.cos(angle) * 0.75
        return (
          <mesh key={i} position={[x, 0.11, z]}>
            <boxGeometry args={[0.05, 0.01, 0.02]} />
            <meshStandardMaterial 
              color="#FFD700"
              metalness={0.9}
              roughness={0.1}
              emissive="#FFD700"
              emissiveIntensity={0.3}
            />
          </mesh>
        )
      })}
      
      {/* Simplified tourbillon at center */}
      <TourbillonMechanism 
        position={[0, 0.12, 0]} 
        scale={0.5}
        hyperDetail={false}
      />
      
      {/* Watch crown */}
      <mesh position={[1.05, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.08, 0.08, 0.15, 32]} />
        <meshStandardMaterial 
          color="#FFD700"
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
    </group>
  )
}

export default function SimpleWatchShowcase({ variant = 'clear-sapphire' }) {
  return (
    <>
      <color attach="background" args={['#0a0a0a']} />
      <fog attach="fog" args={['#0a0a0a', 20, 50]} />
      
      {/* Lighting setup */}
      <ambientLight intensity={0.5} />
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={1.5} 
        castShadow 
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      <spotLight 
        position={[0, 15, 0]} 
        intensity={0.5} 
        angle={0.3} 
        penumbra={1} 
        castShadow 
      />
      <pointLight position={[-10, 5, -10]} intensity={0.3} color="#88ccff" />
      
      {/* Environment for reflections */}
      <Environment preset="city" resolution={256} background={false} />
      
      {/* Watch with presentation controls */}
      <PresentationControls
        global
        zoom={0.8}
        rotation={[0.2, -0.2, 0]}
        polar={[-Math.PI / 3, Math.PI / 3]}
        azimuth={[-Math.PI / 3, Math.PI / 3]}
        config={{ mass: 1, tension: 200 }}
      >
        <Float
          speed={1.5}
          rotationIntensity={0.3}
          floatIntensity={0.5}
          floatingRange={[-0.05, 0.05]}
        >
          <Watch variant={variant} />
        </Float>
      </PresentationControls>
      
      {/* Shadows */}
      <ContactShadows 
        position={[0, -2, 0]} 
        opacity={0.6} 
        scale={10} 
        blur={2} 
        far={4} 
        resolution={256}
        color="#000000"
      />
      
      {/* Display surface */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <MeshReflectorMaterial
          blur={[300, 100]}
          resolution={1024}
          mixBlur={1}
          mixStrength={80}
          roughness={0.9}
          depthScale={1.2}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#0a0a0a"
          metalness={0.5}
        />
      </mesh>
    </>
  )
}