import { useRef, useMemo, useState, useEffect } from 'react'
import * as THREE from 'three'
import { Text } from '@react-three/drei'

// Data visualization components for Three.js Canvas
function DataParticles({ count, color }) {
  const mesh = useRef()
  const particlesData = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const velocities = new Float32Array(count * 3)
    
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 10
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10
      positions[i * 3 + 2] = (Math.random() - 0.5) * 5
      
      velocities[i * 3] = (Math.random() - 0.5) * 0.02
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.02
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.02
    }
    
    return { positions, velocities }
  }, [count])
  
  useEffect(() => {
    if (!mesh.current) return
    
    const animate = () => {
      const positions = mesh.current.geometry.attributes.position.array
      const velocities = particlesData.velocities
      
      for (let i = 0; i < count; i++) {
        positions[i * 3] += velocities[i * 3]
        positions[i * 3 + 1] += velocities[i * 3 + 1]
        positions[i * 3 + 2] += velocities[i * 3 + 2]
        
        // Wrap around
        if (Math.abs(positions[i * 3]) > 5) velocities[i * 3] *= -1
        if (Math.abs(positions[i * 3 + 1]) > 5) velocities[i * 3 + 1] *= -1
        if (Math.abs(positions[i * 3 + 2]) > 2.5) velocities[i * 3 + 2] *= -1
      }
      
      mesh.current.geometry.attributes.position.needsUpdate = true
    }
    
    const interval = setInterval(animate, 50)
    return () => clearInterval(interval)
  }, [count, particlesData])
  
  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={particlesData.positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.02}
        color={color}
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  )
}

function DataPanel({ position, rotation, data, theme }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh>
        <planeGeometry args={[2, 1.5]} />
        <meshPhysicalMaterial
          color={theme.background}
          transparent
          opacity={0.2}
          metalness={0.1}
          roughness={0.9}
          clearcoat={0.5}
        />
      </mesh>
      
      <Text
        position={[0, 0.5, 0.01]}
        fontSize={0.1}
        color={theme.text}
        anchorX="center"
        anchorY="middle"
      >
        {data.title}
      </Text>
      
      <Text
        position={[0, 0, 0.01]}
        fontSize={0.08}
        color={theme.text}
        anchorX="center"
        anchorY="middle"
      >
        {data.value}
      </Text>
    </group>
  )
}

function HolographicProjection({ position, data }) {
  const groupRef = useRef()
  
  useEffect(() => {
    if (!groupRef.current) return
    
    const animate = () => {
      groupRef.current.rotation.y += 0.005
    }
    
    const interval = setInterval(animate, 16)
    return () => clearInterval(interval)
  }, [])
  
  return (
    <group ref={groupRef} position={position}>
      <mesh>
        <cylinderGeometry args={[0.5, 0.5, 0.01, 32]} />
        <meshPhysicalMaterial
          color="#00ffff"
          emissive="#00ffff"
          emissiveIntensity={0.5}
          transparent
          opacity={0.3}
        />
      </mesh>
      
      {/* Data visualization lines */}
      {data.points.map((point, i) => (
        <mesh key={i} position={[
          Math.cos(i * Math.PI / 6) * 0.4,
          point.y * 0.3,
          Math.sin(i * Math.PI / 6) * 0.4
        ]}>
          <boxGeometry args={[0.02, point.y * 0.3, 0.02]} />
          <meshPhysicalMaterial
            color="#00ff00"
            emissive="#00ff00"
            emissiveIntensity={0.3}
          />
        </mesh>
      ))}
    </group>
  )
}

// Main component - now works inside Canvas
export default function SupabaseDataLayerFixed({ variant = 'clear-sapphire' }) {
  const [panels, setPanels] = useState([])
  
  const themes = {
    'clear-sapphire': {
      particleColor: '#ffffff',
      panelTheme: {
        background: '#1a1a1a',
        text: '#ffffff',
        accent: '#4169e1'
      }
    },
    'lilac-pink': {
      particleColor: '#ffb3d9',
      panelTheme: {
        background: '#2a1a2a',
        text: '#ffccee',
        accent: '#ff69b4'
      }
    },
    'sapphire-blue': {
      particleColor: '#4169e1',
      panelTheme: {
        background: '#1a1a3a',
        text: '#aaccff',
        accent: '#00bfff'
      }
    }
  }
  
  const currentTheme = themes[variant] || themes['clear-sapphire']
  
  useEffect(() => {
    // Initialize panels with sample data
    setPanels([
      {
        position: [-3, 2, -2],
        rotation: [0, 0.3, 0],
        data: {
          title: 'Market Value',
          value: '$1.2M USD'
        }
      },
      {
        position: [3, 2, -2],
        rotation: [0, -0.3, 0],
        data: {
          title: 'Authentication',
          value: 'Verified ✓'
        }
      },
      {
        position: [0, -2, -1],
        rotation: [0, 0, 0],
        data: {
          title: 'Time Precision',
          value: '±0.5s/day'
        }
      }
    ])
  }, [])
  
  return (
    <group position={[0, 0, -1]}>
      <DataParticles
        count={300}
        color={currentTheme.particleColor}
      />
      
      {panels.map((panel, index) => (
        <DataPanel
          key={index}
          position={panel.position}
          rotation={panel.rotation}
          data={panel.data}
          theme={currentTheme.panelTheme}
        />
      ))}
      
      <HolographicProjection
        position={[0, 0, 0]}
        data={{
          points: Array.from({ length: 12 }, (_, i) => ({
            y: Math.random() * 2 + 0.5
          }))
        }}
      />
    </group>
  )
}