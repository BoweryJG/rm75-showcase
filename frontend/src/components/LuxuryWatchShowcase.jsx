import { useRef, useMemo, useEffect } from 'react'
import { useFrame, useThree, extend } from '@react-three/fiber'
import { 
  Environment, 
  PresentationControls, 
  ContactShadows,
  MeshReflectorMaterial,
  useTexture,
  Stage,
  BakeShadows,
  AccumulativeShadows,
  RandomizedLight,
  Lightformer,
  Float,
  useGLTF,
  useAnimations,
  MeshTransmissionMaterial,
  useDetectGPU,
  PerformanceMonitor,
  Caustics,
  CubeCamera
} from '@react-three/drei'
import { 
  EffectComposer, 
  Bloom, 
  DepthOfField, 
  ChromaticAberration,
  ToneMapping,
  N8AO,
  TiltShift2,
  LUT
} from '@react-three/postprocessing'
import * as THREE from 'three'
import { useControls } from 'leva'
import HyperRealCrystal from './materials/HyperRealCrystal'
import TourbillonMechanism from './TourbillonMechanism'
import QuantumZoomControls from './QuantumZoomControls'
import { KernelSize, BlendFunction } from 'postprocessing'

// Hyper-reality lighting setup
function LuxuryLighting() {
  const { scene } = useThree()
  
  useEffect(() => {
    scene.environmentIntensity = 0.5
  }, [scene])

  return (
    <>
      <ambientLight intensity={0.1} />
      <spotLight
        position={[10, 10, 10]}
        angle={0.15}
        penumbra={1}
        decay={0}
        intensity={1}
        castShadow
        shadow-mapSize={4096}
        shadow-bias={-0.0005}
      />
      <spotLight
        position={[-10, -10, -10]}
        angle={0.15}
        penumbra={1}
        decay={0}
        intensity={0.5}
        color="#4080ff"
      />
      <directionalLight
        position={[0, 10, 0]}
        intensity={0.5}
        castShadow
        shadow-mapSize={8192}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        shadow-bias={-0.0001}
      />
    </>
  )
}

// Ultra-high detail watch component
function RichardMilleWatch({ variant, dataMode }) {
  const watchRef = useRef()
  const crystalRef = useRef()
  const tourbillonRef = useRef()
  const gpu = useDetectGPU()
  
  // Material variants with hyper-realistic properties
  const materials = useMemo(() => ({
    'clear-sapphire': {
      transmission: 1,
      thickness: 2.5,
      roughness: 0.01,
      chromaticAberration: 0.05,
      ior: 1.77, // Actual sapphire IOR
      color: new THREE.Color(0.98, 0.98, 1.0),
      attenuationColor: new THREE.Color(0.95, 0.95, 1.0),
      attenuationDistance: 0.5,
    },
    'lilac-pink': {
      transmission: 0.95,
      thickness: 2.5,
      roughness: 0.02,
      chromaticAberration: 0.08,
      ior: 1.77,
      color: new THREE.Color(1.0, 0.85, 0.95),
      attenuationColor: new THREE.Color(0.9, 0.6, 0.8),
      attenuationDistance: 0.3,
    },
    'sapphire-blue': {
      transmission: 0.9,
      thickness: 2.5,
      roughness: 0.015,
      chromaticAberration: 0.1,
      ior: 1.77,
      color: new THREE.Color(0.7, 0.85, 1.0),
      attenuationColor: new THREE.Color(0.2, 0.4, 0.8),
      attenuationDistance: 0.4,
    }
  }), [])

  const currentMaterial = materials[variant]

  // Hyper-detailed animations
  useFrame((state) => {
    if (watchRef.current) {
      // Subtle floating animation
      watchRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.02
      watchRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.05
    }
    
    if (crystalRef.current && gpu.tier > 2) {
      // Dynamic refraction based on viewing angle
      const cameraDir = state.camera.position.clone().normalize()
      crystalRef.current.material.ior = 1.77 + Math.abs(cameraDir.y) * 0.05
    }
  })

  return (
    <group ref={watchRef}>
      {/* Ultra-high poly watch case */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[2.2, 2.0, 0.8, 128, 64]} />
        <meshPhysicalMaterial
          color="#1a1a1a"
          metalness={0.95}
          roughness={0.05}
          clearcoat={1}
          clearcoatRoughness={0.01}
          envMapIntensity={2}
        />
      </mesh>
      
      {/* Hyper-realistic sapphire crystal */}
      <mesh ref={crystalRef} position={[0, 0.4, 0]} castShadow>
        <cylinderGeometry args={[2.0, 1.95, 0.3, 128, 64]} />
        <MeshTransmissionMaterial
          {...currentMaterial}
          samples={32}
          resolution={2048}
          temporalDistortion={0.1}
          distortion={0.1}
          distortionScale={0.1}
          maxDepthThreshold={0.1}
          minDepthThreshold={0.0}
        />
      </mesh>
      
      {/* Flying tourbillon with real physics */}
      <TourbillonMechanism 
        ref={tourbillonRef} 
        position={[0, 0, 0]} 
        hyperDetail={gpu.tier > 2}
      />
      
      {/* Microscopic surface details */}
      {gpu.tier > 2 && (
        <mesh position={[0, 0.41, 0]}>
          <planeGeometry args={[4, 4, 512, 512]} />
          <meshPhysicalMaterial
            transparent
            opacity={0.1}
            normalScale={[0.05, 0.05]}
            roughness={0.3}
            metalness={0}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  )
}

// Main showcase component
export default function LuxuryWatchShowcase({ variant, dataMode }) {
  const gpu = useDetectGPU()
  
  // Leva controls for fine-tuning
  const { 
    bloomIntensity, 
    chromaticAberration,
    depthOfField,
    environmentPreset 
  } = useControls({
    bloomIntensity: { value: 1.5, min: 0, max: 5, step: 0.1 },
    chromaticAberration: { value: 0.002, min: 0, max: 0.01, step: 0.0001 },
    depthOfField: { value: 0.02, min: 0, max: 0.1, step: 0.001 },
    environmentPreset: { 
      value: 'luxury',
      options: ['luxury', 'studio', 'sunset', 'night']
    }
  })

  return (
    <>
      <color attach="background" args={['#000000']} />
      <fog attach="fog" args={['#000000', 10, 50]} />
      
      <LuxuryLighting />
      
      <Environment
        files="/textures/hdri/luxury_showroom_16k.hdr"
        resolution={gpu.tier > 2 ? 2048 : 1024}
        background={false}
      >
        <Lightformer
          intensity={4}
          rotation-x={Math.PI / 2}
          position={[0, 5, -9]}
          scale={[10, 10, 1]}
        />
        <Lightformer
          intensity={2}
          rotation-y={Math.PI / 2}
          position={[-5, 1, -1]}
          scale={[20, 0.1, 1]}
        />
      </Environment>
      
      <PresentationControls
        global
        zoom={0.8}
        rotation={[0, -Math.PI / 4, 0]}
        polar={[-Math.PI / 4, Math.PI / 4]}
        azimuth={[-Math.PI / 4, Math.PI / 4]}
        config={{ mass: 2, tension: 400 }}
        snap={{ mass: 4, tension: 400 }}
      >
        <Float
          speed={2}
          rotationIntensity={0.2}
          floatIntensity={0.3}
          floatingRange={[-0.1, 0.1]}
        >
          <RichardMilleWatch variant={variant} dataMode={dataMode} />
        </Float>
      </PresentationControls>
      
      {/* Ultra-realistic shadows */}
      <AccumulativeShadows
        temporal
        frames={100}
        color="#000000"
        colorBlend={2}
        toneMapped={true}
        alphaTest={0.85}
        opacity={0.8}
        scale={12}
        position={[0, -0.5, 0]}
      >
        <RandomizedLight
          amount={8}
          radius={4}
          ambient={0.5}
          intensity={1}
          position={[5, 8, -5]}
          bias={0.001}
        />
      </AccumulativeShadows>
      
      {/* Luxury display surface */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <MeshReflectorMaterial
          blur={[1024, 1024]}
          resolution={2048}
          mixBlur={1}
          mixStrength={100}
          roughness={0.1}
          depthScale={1.2}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#050505"
          metalness={0.8}
          mirror={0.8}
        />
      </mesh>
      
      {/* Hyper-realistic post-processing */}
      <EffectComposer multisampling={gpu.tier > 2 ? 8 : 4}>
        <Bloom
          intensity={bloomIntensity}
          kernelSize={KernelSize.VERY_LARGE}
          luminanceThreshold={0.5}
          luminanceSmoothing={0.9}
          mipmapBlur
        />
        <ChromaticAberration
          offset={[chromaticAberration, chromaticAberration]}
          radialModulation
          modulationOffset={0.5}
        />
        <DepthOfField
          focusDistance={0.01}
          focalLength={depthOfField}
          bokehScale={4}
          height={480}
        />
        <ToneMapping
          blendFunction={BlendFunction.NORMAL}
          adaptive
          resolution={256}
          middleGrey={0.6}
          maxLuminance={16.0}
          averageLuminance={1.0}
          adaptationRate={1.0}
        />
        {gpu.tier > 2 && <N8AO aoRadius={0.5} intensity={1} />}
      </EffectComposer>
      
      <QuantumZoomControls />
    </>
  )
}