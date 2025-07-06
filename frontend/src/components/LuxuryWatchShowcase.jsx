import { useRef, useMemo, useEffect, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { PresentationControls, Environment } from '@react-three/drei'
import * as THREE from 'three'

// Custom Tonneau Geometry for authentic RM case shape
function createTonneauGeometry(width = 1.8, height = 2.4, depth = 0.5, curve = 0.3) {
  const shape = new THREE.Shape()
  
  // Create curved tonneau shape (barrel shape)
  const hw = width / 2
  const hh = height / 2
  
  shape.moveTo(-hw + curve, -hh)
  shape.bezierCurveTo(-hw, -hh, -hw, -hh + curve, -hw, 0)
  shape.bezierCurveTo(-hw, hh - curve, -hw, hh, -hw + curve, hh)
  shape.lineTo(hw - curve, hh)
  shape.bezierCurveTo(hw, hh, hw, hh - curve, hw, 0)
  shape.bezierCurveTo(hw, -hh + curve, hw, -hh, hw - curve, -hh)
  shape.closePath()
  
  const extrudeSettings = {
    depth: depth,
    bevelEnabled: true,
    bevelThickness: 0.02,
    bevelSize: 0.02,
    bevelSegments: 3
  }
  
  return new THREE.ExtrudeGeometry(shape, extrudeSettings)
}

// Optimized Flying Tourbillon Component
function FlyingTourbillon({ simplified = false }) {
  const groupRef = useRef()
  const cageRef = useRef()
  const balanceRef = useRef()
  
  useFrame((state) => {
    if (cageRef.current) {
      cageRef.current.rotation.z = state.clock.elapsedTime * 0.1047 // 1 RPM
    }
    if (balanceRef.current) {
      balanceRef.current.rotation.z = -state.clock.elapsedTime * 4 // Balance wheel speed
    }
  })
  
  const segments = simplified ? 8 : 16
  
  return (
    <group ref={groupRef} position={[0, -0.6, 0.15]}>
      {/* Tourbillon Cage */}
      <group ref={cageRef}>
        <mesh>
          <torusGeometry args={[0.25, 0.015, 4, segments]} />
          <meshPhongMaterial color="#1a1a1a" metalness={0.9} />
        </mesh>
        
        {/* Cage Arms */}
        {[0, 60, 120].map((angle) => (
          <mesh key={angle} rotation={[0, 0, (angle * Math.PI) / 180]}>
            <boxGeometry args={[0.4, 0.01, 0.01]} />
            <meshPhongMaterial color="#2a2a2a" />
          </mesh>
        ))}
        
        {/* Balance Wheel */}
        <group ref={balanceRef}>
          <mesh>
            <ringGeometry args={[0.08, 0.1, segments]} />
            <meshPhongMaterial color="#b8860b" metalness={0.8} />
          </mesh>
          <mesh>
            <cylinderGeometry args={[0.005, 0.005, 0.1, 6]} />
            <meshPhongMaterial color="#4169e1" metalness={0.95} />
          </mesh>
        </group>
      </group>
      
      {/* Ruby Jewels - simplified for performance */}
      {!simplified && (
        <>
          <mesh position={[0, 0, 0.05]}>
            <sphereGeometry args={[0.02, 6, 6]} />
            <meshPhongMaterial color="#dc143c" emissive="#8b0000" emissiveIntensity={0.3} />
          </mesh>
        </>
      )}
    </group>
  )
}

// Device detection with iPhone model specifics
function useDeviceOptimization() {
  const [quality, setQuality] = useState('high')
  
  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase()
    const isIPhone = /iphone/.test(ua)
    const deviceMemory = navigator.deviceMemory || 4
    
    if (isIPhone) {
      // iPhone 12 and newer can handle high quality
      if (/iphone\s?(1[2-9]|[2-9]\d)/.test(ua) || deviceMemory >= 4) {
        setQuality('high')
      }
      // iPhone X, 11
      else if (/iphone\s?(x|1[01])/.test(ua) || deviceMemory >= 3) {
        setQuality('medium')
      }
      // Older iPhones
      else {
        setQuality('low')
      }
    } else {
      setQuality(deviceMemory >= 8 ? 'ultra' : 'high')
    }
  }, [])
  
  return quality
}

// Main RM 75-01 Component with exact proportions
function RichardMilleRM75({ variant }) {
  const watchRef = useRef()
  const quality = useDeviceOptimization()
  
  const tonneauGeometry = useMemo(() => createTonneauGeometry(), [])
  
  const materials = useMemo(() => ({
    case: new THREE.MeshPhongMaterial({
      color: '#1a1a1a',
      shininess: 100,
      specular: new THREE.Color(0.2, 0.2, 0.2)
    }),
    crystal: {
      'clear-sapphire': new THREE.MeshPhongMaterial({
        color: '#ffffff',
        transparent: true,
        opacity: 0.15,
        shininess: 200,
        specular: new THREE.Color(1, 1, 1),
        side: THREE.DoubleSide
      }),
      'lilac-pink': new THREE.MeshPhongMaterial({
        color: '#ffb3d9',
        transparent: true,
        opacity: 0.25,
        shininess: 200,
        specular: new THREE.Color(1, 0.8, 0.9)
      }),
      'sapphire-blue': new THREE.MeshPhongMaterial({
        color: '#4169e1',
        transparent: true,
        opacity: 0.25,
        shininess: 200,
        specular: new THREE.Color(0.4, 0.6, 1)
      })
    }
  }), [])
  
  // Subtle rotation for visual interest
  useFrame((state) => {
    if (watchRef.current) {
      watchRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.05
    }
  })
  
  return (
    <group ref={watchRef} scale={0.35}>
      {/* Main Case - Authentic Tonneau Shape */}
      <mesh geometry={tonneauGeometry} material={materials.case} />
      
      {/* Case Back */}
      <mesh position={[0, 0, -0.25]}>
        <extrudeGeometry args={[
          (() => {
            const shape = new THREE.Shape()
            const hw = 0.85
            const hh = 1.15
            const curve = 0.15
            shape.moveTo(-hw + curve, -hh)
            shape.bezierCurveTo(-hw, -hh, -hw, -hh + curve, -hw, 0)
            shape.bezierCurveTo(-hw, hh - curve, -hw, hh, -hw + curve, hh)
            shape.lineTo(hw - curve, hh)
            shape.bezierCurveTo(hw, hh, hw, hh - curve, hw, 0)
            shape.bezierCurveTo(hw, -hh + curve, hw, -hh, hw - curve, -hh)
            shape.closePath()
            return shape
          })(),
          { depth: 0.1, bevelEnabled: false }
        ]} />
        <meshPhongMaterial color="#2a2a2a" />
      </mesh>
      
      {/* Multi-layer Sapphire Crystal */}
      <mesh position={[0, 0, 0.28]}>
        <extrudeGeometry args={[
          (() => {
            const shape = new THREE.Shape()
            const hw = 0.8
            const hh = 1.1
            const curve = 0.12
            shape.moveTo(-hw + curve, -hh)
            shape.bezierCurveTo(-hw, -hh, -hw, -hh + curve, -hw, 0)
            shape.bezierCurveTo(-hw, hh - curve, -hw, hh, -hw + curve, hh)
            shape.lineTo(hw - curve, hh)
            shape.bezierCurveTo(hw, hh, hw, hh - curve, hw, 0)
            shape.bezierCurveTo(hw, -hh + curve, hw, -hh, hw - curve, -hh)
            shape.closePath()
            return shape
          })(),
          { depth: 0.15, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02 }
        ]} />
        {materials.crystal[variant]}
      </mesh>
      
      {/* Movement Architecture */}
      <group position={[0, 0, 0.1]}>
        {/* Main Bridge */}
        <mesh position={[0, 0.3, 0]}>
          <boxGeometry args={[1.2, 0.08, 0.02]} />
          <meshPhongMaterial color="#1a1a1a" metalness={0.9} />
        </mesh>
        
        {/* Secondary Bridges */}
        <mesh position={[0, -0.2, 0]}>
          <boxGeometry args={[1.0, 0.06, 0.02]} />
          <meshPhongMaterial color="#1a1a1a" metalness={0.9} />
        </mesh>
      </group>
      
      {/* Flying Tourbillon */}
      <FlyingTourbillon simplified={quality === 'low'} />
      
      {/* Hour Indices */}
      {quality !== 'low' && [12, 3, 6, 9].map((hour) => {
        const angle = ((hour * 30 - 90) * Math.PI) / 180
        const radius = 0.7
        return (
          <mesh key={hour} position={[
            Math.cos(angle) * radius,
            Math.sin(angle) * radius * 1.2,
            0.25
          ]}>
            <boxGeometry args={[0.08, 0.02, 0.02]} />
            <meshPhongMaterial
              color="#ffffff"
              emissive="#ffffff"
              emissiveIntensity={0.2}
            />
          </mesh>
        )
      })}
      
      {/* RM Signature Screws */}
      {quality === 'ultra' && [
        [-0.8, 1.0], [0.8, 1.0], [-0.8, -1.0], [0.8, -1.0]
      ].map(([x, y], i) => (
        <mesh key={i} position={[x, y, 0.26]}>
          <cylinderGeometry args={[0.03, 0.03, 0.02, 6]} />
          <meshPhongMaterial color="#c0c0c0" metalness={0.95} />
        </mesh>
      ))}
      
      {/* Crown */}
      <mesh position={[1.0, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.15, 12]} />
        <meshPhongMaterial color="#1a1a1a" />
      </mesh>
    </group>
  )
}

// Optimized Main Showcase
export default function LuxuryWatchShowcase({ variant = 'clear-sapphire' }) {
  const quality = useDeviceOptimization()
  
  return (
    <>
      <color attach="background" args={['#0a0a0a']} />
      
      {/* Adaptive Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[5, 5, 5]}
        intensity={1}
        castShadow={quality !== 'low'}
        shadow-mapSize={quality === 'low' ? 512 : 1024}
      />
      <pointLight position={[-5, 5, -5]} intensity={0.5} color="#ffffff" />
      
      {/* Minimal environment for reflections */}
      {quality !== 'low' && (
        <Environment
          preset="studio"
          resolution={quality === 'ultra' ? 512 : 256}
          background={false}
        />
      )}
      
      <PresentationControls
        global
        zoom={1.2}
        rotation={[0, 0, 0]}
        polar={[-Math.PI / 6, Math.PI / 6]}
        azimuth={[-Math.PI / 6, Math.PI / 6]}
        config={{ mass: 1, tension: 200 }}
      >
        <RichardMilleRM75 variant={variant} />
      </PresentationControls>
    </>
  )
}