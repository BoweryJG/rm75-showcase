import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { 
  PresentationControls, 
  Environment,
  ContactShadows,
  Html,
  useGLTF,
  Box,
  Sphere,
  Cylinder
} from '@react-three/drei'
import * as THREE from 'three'

// Simple watch model component
function WatchModel({ variant }) {
  const meshRef = useRef()
  const [hovered, setHovered] = useState(false)

  // Rotate the watch continuously
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.002
    }
  })

  // Define colors for each variant
  const colors = {
    'clear-sapphire': {
      case: '#1a1a1a',
      crystal: '#e3f2fd',
      strap: '#263238'
    },
    'lilac-pink': {
      case: '#2d2d2d',
      crystal: '#fce4ec',
      strap: '#880e4f'
    },
    'sapphire-blue': {
      case: '#0d47a1',
      crystal: '#bbdefb',
      strap: '#1565c0'
    }
  }

  const currentColors = colors[variant] || colors['clear-sapphire']

  return (
    <group ref={meshRef} scale={hovered ? 1.1 : 1}>
      {/* Watch Case */}
      <mesh 
        castShadow 
        receiveShadow
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <cylinderGeometry args={[1.2, 1.1, 0.3, 64]} />
        <meshStandardMaterial 
          color={currentColors.case}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* Crystal */}
      <mesh position={[0, 0.16, 0]} castShadow>
        <cylinderGeometry args={[1.15, 1.15, 0.05, 64]} />
        <meshPhysicalMaterial
          color={currentColors.crystal}
          transmission={0.9}
          opacity={0.3}
          transparent
          roughness={0}
          metalness={0}
          clearcoat={1}
          clearcoatRoughness={0}
          ior={1.5}
          thickness={0.5}
        />
      </mesh>

      {/* Watch Face */}
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[1.1, 1.1, 0.01, 64]} />
        <meshStandardMaterial 
          color="#000000"
          metalness={0.5}
          roughness={0.5}
        />
      </mesh>

      {/* Hour markers */}
      {[...Array(12)].map((_, i) => {
        const angle = (i * Math.PI * 2) / 12
        return (
          <mesh
            key={i}
            position={[
              Math.sin(angle) * 0.9,
              0.11,
              Math.cos(angle) * 0.9
            ]}
          >
            <boxGeometry args={[0.05, 0.01, 0.15]} />
            <meshStandardMaterial color="#FFD700" metalness={0.9} roughness={0.1} />
          </mesh>
        )
      })}

      {/* Center */}
      <mesh position={[0, 0.12, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.05, 32]} />
        <meshStandardMaterial color="#FFD700" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Simple Tourbillon */}
      <group position={[0, 0.11, 0]}>
        <mesh>
          <torusGeometry args={[0.3, 0.02, 16, 32]} />
          <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.1} />
        </mesh>
      </group>

      {/* Strap */}
      <mesh position={[0, -0.15, 1.2]} castShadow>
        <boxGeometry args={[0.8, 0.1, 2.5]} />
        <meshStandardMaterial 
          color={currentColors.strap}
          roughness={0.8}
          metalness={0}
        />
      </mesh>
      <mesh position={[0, -0.15, -1.2]} castShadow>
        <boxGeometry args={[0.8, 0.1, 2.5]} />
        <meshStandardMaterial 
          color={currentColors.strap}
          roughness={0.8}
          metalness={0}
        />
      </mesh>

      {hovered && (
        <Html position={[0, 2, 0]} center>
          <div style={{
            background: 'rgba(0,0,0,0.8)',
            color: '#FFD700',
            padding: '10px 20px',
            borderRadius: '4px',
            fontFamily: 'Inter, sans-serif',
            whiteSpace: 'nowrap'
          }}>
            Richard Mille RM-75-01
          </div>
        </Html>
      )}
    </group>
  )
}

export default function SimpleWatchShowcase({ variant = 'clear-sapphire' }) {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <spotLight
        position={[10, 10, 10]}
        angle={0.15}
        penumbra={1}
        decay={0}
        intensity={1}
        castShadow
      />
      <directionalLight position={[-5, 5, -5]} intensity={0.5} />

      {/* Environment */}
      <Environment preset="city" />

      {/* Watch with presentation controls */}
      <PresentationControls
        global
        zoom={0.8}
        rotation={[0, -Math.PI / 4, 0]}
        polar={[-Math.PI / 3, Math.PI / 3]}
        azimuth={[-Math.PI / 4, Math.PI / 4]}
      >
        <WatchModel variant={variant} />
      </PresentationControls>

      {/* Shadows */}
      <ContactShadows
        position={[0, -1.4, 0]}
        opacity={0.75}
        scale={10}
        blur={2.5}
        far={4}
        color="#000000"
      />

      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.4, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#0a0a0a" />
      </mesh>
    </>
  )
}