import React, { useRef, forwardRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Constants for physically accurate movement
const TOURBILLON_RPM = 1; // 1 rotation per minute
const BALANCE_WHEEL_FREQUENCY = 8; // Simplified for visual appeal

// Simplified Flying Tourbillon Mechanism - iPhone Optimized
const TourbillonMechanism = forwardRef(({ position = [0, 0, 0], scale = 1, simplified = false }, ref) => {
  const tourbillonRef = useRef()
  const balanceWheelRef = useRef()
  const escapementRef = useRef()
  const cageRef = useRef()

  // Authentic RM 75-01 animations optimized for mobile
  useFrame((state) => {
    const time = state.clock.elapsedTime
    
    if (cageRef.current) {
      // Tourbillon cage rotation: 1 RPM
      cageRef.current.rotation.z = (time / 60) * Math.PI * 2
    }
    
    if (balanceWheelRef.current) {
      // Balance wheel oscillation: 8 Hz for visual appeal
      balanceWheelRef.current.rotation.z = Math.sin(time * BALANCE_WHEEL_FREQUENCY * Math.PI * 2) * 0.3
    }
    
    if (escapementRef.current) {
      // Escapement tick: synchronized with balance wheel
      const tick = Math.floor(time * BALANCE_WHEEL_FREQUENCY) % 2
      escapementRef.current.rotation.z = tick * 0.1
    }
  })

  return (
    <group ref={ref} position={position} scale={scale}>
      {/* Tourbillon Cage - Signature RM 75-01 flying design */}
      <group ref={cageRef}>
        {/* Cage frame - minimalist for performance */}
        <mesh>
          <torusGeometry args={[0.4, 0.02, 6, simplified ? 12 : 16]} />
          <meshPhysicalMaterial
            color="#1a1a1a"
            metalness={0.95}
            roughness={0.05}
            clearcoat={1}
          />
        </mesh>
        
        {/* Cage spokes */}
        {[0, 120, 240].map((angle, index) => (
          <mesh key={index} rotation={[0, 0, (angle * Math.PI) / 180]}>
            <boxGeometry args={[0.6, 0.01, 0.01]} />
            <meshPhysicalMaterial
              color="#2a2a2a"
              metalness={0.9}
              roughness={0.1}
            />
          </mesh>
        ))}
        
        {/* Balance Wheel - Heart of the tourbillon */}
        <group ref={balanceWheelRef}>
          <mesh>
            <torusGeometry args={[0.15, 0.008, 4, simplified ? 8 : 12]} />
            <meshPhysicalMaterial
              color="#b8860b"
              metalness={0.8}
              roughness={0.2}
              clearcoat={0.8}
            />
          </mesh>
          
          {/* Balance wheel rim */}
          <mesh>
            <cylinderGeometry args={[0.15, 0.15, 0.005, simplified ? 16 : 24]} />
            <meshPhysicalMaterial
              color="#cd7f32"
              metalness={0.85}
              roughness={0.15}
            />
          </mesh>
          
          {/* Balance wheel spokes */}
          {[0, 90].map((angle, index) => (
            <mesh key={index} rotation={[0, 0, (angle * Math.PI) / 180]}>
              <boxGeometry args={[0.25, 0.005, 0.005]} />
              <meshPhysicalMaterial
                color="#daa520"
                metalness={0.9}
                roughness={0.1}
              />
            </mesh>
          ))}
        </group>
        
        {/* Escapement mechanism */}
        <group ref={escapementRef} position={[0.2, 0, 0]}>
          <mesh>
            <boxGeometry args={[0.08, 0.02, 0.01]} />
            <meshPhysicalMaterial
              color="#ff0000"
              metalness={0.7}
              roughness={0.3}
              emissive="#330000"
              emissiveIntensity={0.1}
            />
          </mesh>
        </group>
        
        {/* Ruby jewel bearings - RM signature red */}
        {!simplified && [
          [0, 0, 0.02],
          [0, 0, -0.02],
          [0.25, 0, 0],
          [-0.25, 0, 0]
        ].map((pos, index) => (
          <mesh key={index} position={pos}>
            <sphereGeometry args={[0.015, 8, 8]} />
            <meshPhysicalMaterial
              color="#dc143c"
              metalness={0.1}
              roughness={0.1}
              transmission={0.8}
              thickness={0.5}
              ior={1.77}
              clearcoat={1}
              emissive="#8b0000"
              emissiveIntensity={0.2}
            />
          </mesh>
        ))}
        
        {/* Central pivot */}
        <mesh>
          <cylinderGeometry args={[0.005, 0.005, 0.1, simplified ? 6 : 8]} />
          <meshPhysicalMaterial
            color="#4169e1"
            metalness={0.95}
            roughness={0.05}
            clearcoat={1}
          />
        </mesh>
      </group>
      
      {/* Base mechanism - visible through transparent case */}
      <mesh position={[0, 0, -0.1]}>
        <cylinderGeometry args={[0.5, 0.45, 0.05, simplified ? 12 : 16]} />
        <meshPhysicalMaterial
          color="#1a1a1a"
          metalness={0.9}
          roughness={0.1}
          clearcoat={0.8}
        />
      </mesh>
      
      {/* Movement decoration - RM style */}
      <mesh position={[0, 0, -0.08]}>
        <ringGeometry args={[0.3, 0.35, simplified ? 8 : 12]} />
        <meshPhysicalMaterial
          color="#c0c0c0"
          metalness={0.95}
          roughness={0.05}
        />
      </mesh>
    </group>
  )
})

TourbillonMechanism.displayName = 'TourbillonMechanism'

export default TourbillonMechanism