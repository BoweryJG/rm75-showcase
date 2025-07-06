import { useRef, Suspense } from 'react'
import { useFrame } from '@react-three/fiber'
import { 
  PresentationControls, 
  Environment,
  ContactShadows,
  MeshReflectorMaterial,
  Float,
  Sphere
} from '@react-three/drei'
import * as THREE from 'three'
import TourbillonMechanism from './TourbillonMechanism'

// Cohesive Richard Mille RM-75-01 Watch
function RichardMilleWatch({ variant }) {
  const watchRef = useRef()
  const crystalRef = useRef()
  
  // Refined material variants for Richard Mille aesthetic
  const materials = {
    'clear-sapphire': {
      caseColor: '#2C2C2E', // Titanium gray
      crystalTint: '#f0f8ff', // Very slight blue
      crystalOpacity: 0.15,
      tourbillonAccent: '#4169E1' // Royal blue
    },
    'lilac-pink': {
      caseColor: '#3A2A3A', // Dark purple-gray titanium
      crystalTint: '#FFE4E1', // Misty rose
      crystalOpacity: 0.2,
      tourbillonAccent: '#DA70D6' // Orchid
    },
    'sapphire-blue': {
      caseColor: '#1C2951', // Navy titanium
      crystalTint: '#B0E0E6', // Powder blue
      crystalOpacity: 0.25,
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
      {/* Richard Mille Tonneau Case Shape */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        {/* Wider, flatter case proportions */}
        <cylinderGeometry args={[1.2, 1.15, 0.2, 64, 1]} />
        <meshPhysicalMaterial 
          color={mat.caseColor}
          metalness={0.95}
          roughness={0.05}
          clearcoat={1}
          clearcoatRoughness={0.02}
          envMapIntensity={1.5}
        />
      </mesh>
      
      {/* Brushed titanium bezel */}
      <mesh position={[0, 0.1, 0]} castShadow>
        <torusGeometry args={[1.15, 0.08, 8, 64]} />
        <meshPhysicalMaterial 
          color={mat.caseColor}
          metalness={0.9}
          roughness={0.15} // More rough for brushed effect
          clearcoat={0.5}
        />
      </mesh>
      
      {/* Sapphire crystal dome - the star of the show */}
      <mesh ref={crystalRef} position={[0, 0.08, 0]} castShadow>
        <sphereGeometry args={[1.1, 64, 32, 0, Math.PI * 2, 0, Math.PI / 2.5]} />
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
      
      {/* Watch face - recessed for depth */}
      <mesh position={[0, -0.05, 0]} receiveShadow>
        <cylinderGeometry args={[1.05, 1.05, 0.01, 64]} />
        <meshStandardMaterial 
          color="#0A0A0A"
          metalness={0.3}
          roughness={0.7}
        />
      </mesh>
      
      {/* Minimal hour markers - Richard Mille style */}
      {[0, 3, 6, 9].map((hour) => {
        const angle = (hour / 12) * Math.PI * 2 - Math.PI / 2
        const x = Math.cos(angle) * 0.85
        const z = Math.sin(angle) * 0.85
        return (
          <mesh key={hour} position={[x, -0.04, z]}>
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
      
      {/* Central tourbillon - properly scaled and positioned */}
      <Suspense fallback={null}>
        <TourbillonMechanism 
          position={[0, -0.02, 0]} 
          scale={0.8}
          hyperDetail={false}
          accentColor={mat.tourbillonAccent}
        />
      </Suspense>
      
      {/* RM signature crown */}
      <mesh position={[1.25, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.1, 0.08, 0.2, 32]} />
        <meshPhysicalMaterial 
          color={mat.caseColor}
          metalness={0.9}
          roughness={0.1}
          clearcoat={1}
        />
      </mesh>
      
      {/* Crown guard */}
      <mesh position={[1.15, 0, 0]} castShadow>
        <boxGeometry args={[0.15, 0.25, 0.15]} />
        <meshPhysicalMaterial 
          color={mat.caseColor}
          metalness={0.9}
          roughness={0.05}
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
      
      {/* Three-point lighting setup */}
      <ambientLight intensity={0.3} />
      
      {/* Key light */}
      <directionalLight 
        position={[5, 8, 5]} 
        intensity={2} 
        castShadow 
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={1}
        shadow-camera-far={20}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
      />
      
      {/* Fill light */}
      <directionalLight 
        position={[-5, 3, 2]} 
        intensity={0.5} 
        color="#B0C4DE"
      />
      
      {/* Rim light */}
      <spotLight 
        position={[0, 5, -8]} 
        intensity={1} 
        angle={0.5} 
        penumbra={0.5} 
        color="#E6E6FA"
      />
      
      {/* Luxury environment */}
      <Environment preset="studio" resolution={512} background={false} blur={0.5} />
      
      {/* Hero watch presentation */}
      <PresentationControls
        global
        zoom={0.65}
        rotation={[0.3, -0.5, 0]}
        polar={[-Math.PI / 3, Math.PI / 3]}
        azimuth={[-Math.PI / 2, Math.PI / 2]}
        config={{ mass: 2, tension: 100 }}
      >
        <Float
          speed={1}
          rotationIntensity={0.3}
          floatIntensity={0.3}
          floatingRange={[-0.05, 0.05]}
        >
          <RichardMilleWatch variant={variant} />
        </Float>
      </PresentationControls>
      
      {/* Premium shadow */}
      <ContactShadows 
        position={[0, -1.5, 0]} 
        opacity={0.7} 
        scale={8} 
        blur={3} 
        far={3} 
        resolution={512}
        color="#000000"
      />
      
      {/* Luxury display surface */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <MeshReflectorMaterial
          blur={[400, 100]}
          resolution={2048}
          mixBlur={1}
          mixStrength={50}
          roughness={0.85}
          depthScale={1}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#101010"
          metalness={0.7}
          mirror={0.5}
        />
      </mesh>
    </>
  )
}