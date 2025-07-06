import { useRef, Suspense } from 'react'
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

// Cohesive Richard Mille RM-75-01 Watch with unified architecture
function RichardMilleWatch({ variant }) {
  const watchRef = useRef()
  const crystalRef = useRef()
  
  // Refined material variants for Richard Mille aesthetic
  const materials = {
    'clear-sapphire': {
      caseColor: '#2C2C2E', // Titanium gray
      crystalTint: '#f0f8ff', // Very slight blue
      crystalOpacity: 0.1,
      tourbillonAccent: '#4169E1' // Royal blue
    },
    'lilac-pink': {
      caseColor: '#3A2A3A', // Dark purple-gray titanium
      crystalTint: '#FFE4E1', // Misty rose
      crystalOpacity: 0.15,
      tourbillonAccent: '#DA70D6' // Orchid
    },
    'sapphire-blue': {
      caseColor: '#1C2951', // Navy titanium
      crystalTint: '#B0E0E6', // Powder blue
      crystalOpacity: 0.2,
      tourbillonAccent: '#4682B4' // Steel blue
    }
  }
  
  const mat = materials[variant] || materials['clear-sapphire']
  
  // Subtle continuous rotation
  useFrame((state) => {
    if (watchRef.current) {
      watchRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.15
    }
  })
  
  return (
    <group ref={watchRef} scale={3}>
      {/* UNIFIED CASE STRUCTURE - Main outer case */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.2, 1.15, 0.3, 64, 1]} />
        <meshPhysicalMaterial 
          color={mat.caseColor}
          metalness={0.95}
          roughness={0.05}
          clearcoat={1}
          clearcoatRoughness={0.02}
          envMapIntensity={1.5}
        />
      </mesh>
      
      {/* INTEGRATED BEZEL - Ring at case top forming the crystal opening */}
      <mesh position={[0, 0.15, 0]} castShadow>
        <ringGeometry args={[1.0, 1.15, 64]} />
        <meshPhysicalMaterial 
          color={mat.caseColor}
          metalness={0.9}
          roughness={0.1}
          clearcoat={1}
          clearcoatRoughness={0.02}
        />
      </mesh>
      
      {/* INNER CASE WALL - Creates recessed area for dial */}
      <mesh position={[0, 0, 0]} receiveShadow>
        <cylinderGeometry args={[0.95, 0.95, 0.25, 64, 1]} />
        <meshPhysicalMaterial 
          color={mat.caseColor}
          metalness={0.9}
          roughness={0.1}
          side={THREE.BackSide}
        />
      </mesh>
      
      {/* WATCH DIAL - Properly recessed in case */}
      <mesh position={[0, -0.05, 0]} receiveShadow>
        <cylinderGeometry args={[0.9, 0.9, 0.01, 64]} />
        <meshStandardMaterial 
          color="#0A0A0A"
          metalness={0.3}
          roughness={0.7}
        />
      </mesh>
      
      {/* MINIMAL HOUR MARKERS - At dial level */}
      {[0, 3, 6, 9].map((hour) => {
        const angle = (hour / 12) * Math.PI * 2 - Math.PI / 2
        const x = Math.cos(angle) * 0.75
        const z = Math.sin(angle) * 0.75
        return (
          <mesh key={hour} position={[x, -0.045, z]}>
            <boxGeometry args={[hour === 0 ? 0.08 : 0.06, 0.005, 0.03]} />
            <meshPhysicalMaterial 
              color="#FFFFFF"
              metalness={0.5}
              roughness={0.3}
              emissive="#FFFFFF"
              emissiveIntensity={0.1}
            />
          </mesh>
        )
      })}
      
      {/* TOURBILLON - Sitting on dial, visible through crystal */}
      <Suspense fallback={null}>
        <TourbillonMechanism 
          position={[0, -0.03, 0]} 
          scale={0.7}
          hyperDetail={false}
          accentColor={mat.tourbillonAccent}
        />
      </Suspense>
      
      {/* SAPPHIRE CRYSTAL - Sitting flush in bezel opening */}
      <mesh ref={crystalRef} position={[0, 0.15, 0]} castShadow>
        <sphereGeometry args={[1.0, 64, 32, 0, Math.PI * 2, 0, Math.PI / 2.2]} />
        <meshPhysicalMaterial
          color={mat.crystalTint}
          transparent
          opacity={mat.crystalOpacity}
          transmission={0.95}
          thickness={1.5}
          roughness={0}
          metalness={0}
          clearcoat={1}
          clearcoatRoughness={0}
          ior={1.77} // Real sapphire IOR
          reflectivity={0.5}
          envMapIntensity={3}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* CROWN - Integrated with case side */}
      <mesh position={[1.25, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.1, 0.08, 0.2, 32]} />
        <meshPhysicalMaterial 
          color={mat.caseColor}
          metalness={0.9}
          roughness={0.1}
          clearcoat={1}
        />
      </mesh>
      
      {/* CROWN GUARD - Part of case architecture */}
      <mesh position={[1.15, 0, 0]} castShadow>
        <boxGeometry args={[0.15, 0.25, 0.15]} />
        <meshPhysicalMaterial 
          color={mat.caseColor}
          metalness={0.9}
          roughness={0.05}
        />
      </mesh>
      
      {/* CASE BACK DETAIL */}
      <mesh position={[0, -0.15, 0]} receiveShadow>
        <cylinderGeometry args={[1.1, 1.1, 0.02, 64]} />
        <meshPhysicalMaterial 
          color={mat.caseColor}
          metalness={0.95}
          roughness={0.02}
          clearcoat={1}
        />
      </mesh>
    </group>
  )
}

export default function SimpleWatchShowcase({ variant = 'clear-sapphire' }) {
  return (
    <>
      {/* Premium gradient background */}
      <color attach="background" args={['#0a0a0a']} />
      <fog attach="fog" args={['#1a1a1a', 15, 40]} />
      
      {/* Optimized three-point lighting */}
      <ambientLight intensity={0.3} />
      
      {/* Key light - highlights crystal and case */}
      <directionalLight 
        position={[5, 8, 5]} 
        intensity={2.5} 
        castShadow 
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={1}
        shadow-camera-far={20}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
        shadow-bias={-0.0001}
      />
      
      {/* Fill light - softens shadows */}
      <directionalLight 
        position={[-5, 3, 2]} 
        intensity={0.8} 
        color="#B0C4DE"
      />
      
      {/* Rim light - defines edges */}
      <spotLight 
        position={[0, 6, -8]} 
        intensity={1.5} 
        angle={0.4} 
        penumbra={0.5} 
        color="#E6E6FA"
        castShadow
      />
      
      {/* Top light - illuminates crystal dome */}
      <pointLight 
        position={[0, 10, 0]} 
        intensity={1} 
        color="#FFFFFF"
      />
      
      {/* Studio environment for reflections */}
      <Environment preset="studio" resolution={512} background={false} blur={0.5} />
      
      {/* Hero presentation - perfectly framed */}
      <PresentationControls
        global
        zoom={0.7}
        rotation={[0.2, -0.3, 0]}
        polar={[-Math.PI / 3, Math.PI / 3]}
        azimuth={[-Math.PI / 2, Math.PI / 2]}
        config={{ mass: 2, tension: 120 }}
      >
        <Float
          speed={1}
          rotationIntensity={0.2}
          floatIntensity={0.3}
          floatingRange={[-0.03, 0.03]}
        >
          <RichardMilleWatch variant={variant} />
        </Float>
      </PresentationControls>
      
      {/* Refined shadow */}
      <ContactShadows 
        position={[0, -1.8, 0]} 
        opacity={0.6} 
        scale={12} 
        blur={2.5} 
        far={4} 
        resolution={512}
        color="#000000"
      />
      
      {/* Premium display surface */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.8, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <MeshReflectorMaterial
          blur={[300, 100]}
          resolution={2048}
          mixBlur={1}
          mixStrength={40}
          roughness={0.9}
          depthScale={1.2}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#0f0f0f"
          metalness={0.6}
          mirror={0.4}
        />
      </mesh>
    </>
  )
}