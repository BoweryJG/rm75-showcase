import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, MeshTransmissionMaterial, useTexture, Environment } from '@react-three/drei';
import * as THREE from 'three';

// Constants for physically accurate movement
const TOURBILLON_RPM = 1; // 1 rotation per minute
const BALANCE_WHEEL_VPH = 28800; // Vibrations per hour
const BALANCE_WHEEL_FREQUENCY = BALANCE_WHEEL_VPH / 3600; // Hz
const ESCAPEMENT_TEETH = 15;
const GEAR_TEETH = 60;

// Ruby material with subsurface scattering
const RubyMaterial = ({ color = '#e0115f' }) => {
  return (
    <MeshTransmissionMaterial
      color={color}
      transmission={0.9}
      thickness={0.5}
      roughness={0.1}
      metalness={0.1}
      envMapIntensity={1}
      clearcoat={1}
      clearcoatRoughness={0}
      ior={1.77}
      attenuationColor={color}
      attenuationDistance={0.5}
    />
  );
};

// Individual gear tooth geometry
const GearTooth = ({ innerRadius, outerRadius, toothHeight, toothWidth }) => {
  const toothGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    
    // Create involute gear tooth profile
    const angle = toothWidth / innerRadius;
    const halfAngle = angle / 2;
    
    shape.moveTo(0, innerRadius);
    shape.lineTo(toothHeight * Math.sin(halfAngle), innerRadius + toothHeight * Math.cos(halfAngle));
    shape.lineTo(toothHeight * Math.sin(halfAngle), outerRadius);
    shape.lineTo(-toothHeight * Math.sin(halfAngle), outerRadius);
    shape.lineTo(-toothHeight * Math.sin(halfAngle), innerRadius + toothHeight * Math.cos(halfAngle));
    shape.lineTo(0, innerRadius);
    
    return new THREE.ExtrudeGeometry(shape, {
      depth: 0.02,
      bevelEnabled: true,
      bevelThickness: 0.002,
      bevelSize: 0.002,
      bevelSegments: 2
    });
  }, [innerRadius, outerRadius, toothHeight, toothWidth]);

  return <mesh geometry={toothGeometry} />;
};

// Gear wheel with individual teeth
const GearWheel = ({ radius = 0.5, teeth = 60, thickness = 0.02, toothHeight = 0.05 }) => {
  const gearRef = useRef();
  
  const gearTeeth = useMemo(() => {
    const teethArray = [];
    const angleStep = (Math.PI * 2) / teeth;
    
    for (let i = 0; i < teeth; i++) {
      const angle = i * angleStep;
      teethArray.push({ angle, index: i });
    }
    
    return teethArray;
  }, [teeth]);

  return (
    <group ref={gearRef}>
      {/* Gear body */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[radius, radius, thickness, 64]} />
        <meshPhysicalMaterial
          color="#c0c0c0"
          metalness={0.9}
          roughness={0.1}
          clearcoat={1}
          clearcoatRoughness={0.05}
        />
      </mesh>
      
      {/* Individual teeth */}
      {gearTeeth.map(({ angle, index }) => (
        <group key={index} rotation={[0, angle, 0]}>
          <mesh position={[radius, 0, 0]} castShadow>
            <boxGeometry args={[toothHeight, thickness, thickness / 2]} />
            <meshPhysicalMaterial
              color="#d4d4d4"
              metalness={0.95}
              roughness={0.05}
              clearcoat={1}
            />
          </mesh>
        </group>
      ))}
      
      {/* Center hole with decorative pattern */}
      <mesh>
        <cylinderGeometry args={[radius * 0.2, radius * 0.2, thickness * 1.1, 32]} />
        <meshPhysicalMaterial color="#1a1a1a" metalness={0.9} roughness={0.2} />
      </mesh>
    </group>
  );
};

// Escapement wheel with precise tooth geometry
const EscapementWheel = ({ radius = 0.3, teeth = ESCAPEMENT_TEETH }) => {
  const wheelRef = useRef();
  
  const toothAngle = (Math.PI * 2) / teeth;
  
  useFrame((state) => {
    // Synchronized with balance wheel oscillation
    const time = state.clock.getElapsedTime();
    const oscillation = Math.sin(time * BALANCE_WHEEL_FREQUENCY * Math.PI * 2);
    wheelRef.current.rotation.z += oscillation * 0.001;
  });

  return (
    <group ref={wheelRef}>
      {/* Wheel body */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[radius, radius, 0.01, teeth]} />
        <meshPhysicalMaterial
          color="#ffd700"
          metalness={0.8}
          roughness={0.2}
          clearcoat={1}
        />
      </mesh>
      
      {/* Escapement teeth with special profile */}
      {Array.from({ length: teeth }).map((_, i) => {
        const angle = i * toothAngle;
        return (
          <group key={i} rotation={[0, angle, 0]}>
            <mesh position={[radius + 0.02, 0, 0]} castShadow>
              <coneGeometry args={[0.015, 0.04, 4]} />
              <meshPhysicalMaterial
                color="#ffd700"
                metalness={0.9}
                roughness={0.1}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

// Balance wheel with hairspring
const BalanceWheel = ({ radius = 0.25 }) => {
  const balanceRef = useRef();
  const hairspringRef = useRef();
  
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const oscillation = Math.sin(time * BALANCE_WHEEL_FREQUENCY * Math.PI * 2);
    
    // Balance wheel oscillation
    balanceRef.current.rotation.z = oscillation * 0.3;
    
    // Hairspring deformation
    if (hairspringRef.current) {
      hairspringRef.current.scale.x = 1 + oscillation * 0.1;
      hairspringRef.current.scale.y = 1 - oscillation * 0.1;
    }
  });

  return (
    <group ref={balanceRef}>
      {/* Balance wheel rim */}
      <mesh castShadow receiveShadow>
        <torusGeometry args={[radius, 0.01, 8, 32]} />
        <meshPhysicalMaterial
          color="#8b7355"
          metalness={0.7}
          roughness={0.3}
          clearcoat={0.5}
        />
      </mesh>
      
      {/* Spokes */}
      {[0, Math.PI / 2].map((angle, i) => (
        <mesh key={i} rotation={[0, 0, angle]} castShadow>
          <boxGeometry args={[radius * 2, 0.005, 0.01]} />
          <meshPhysicalMaterial
            color="#8b7355"
            metalness={0.7}
            roughness={0.3}
          />
        </mesh>
      ))}
      
      {/* Center jewel */}
      <mesh>
        <cylinderGeometry args={[0.02, 0.02, 0.015, 16]} />
        <RubyMaterial />
      </mesh>
      
      {/* Hairspring (simplified spiral) */}
      <group ref={hairspringRef}>
        <mesh>
          <torusGeometry args={[radius * 0.7, 0.002, 4, 64]} />
          <meshPhysicalMaterial
            color="#4169e1"
            metalness={0.8}
            roughness={0.2}
            clearcoat={1}
          />
        </mesh>
      </group>
      
      {/* Balance weights */}
      {[0, Math.PI / 2, Math.PI, Math.PI * 1.5].map((angle, i) => (
        <mesh
          key={i}
          position={[
            Math.cos(angle) * radius * 0.9,
            0,
            Math.sin(angle) * radius * 0.9
          ]}
          castShadow
        >
          <cylinderGeometry args={[0.008, 0.008, 0.02, 8]} />
          <meshPhysicalMaterial
            color="#ffd700"
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>
      ))}
    </group>
  );
};

// Ruby jewel bearing with subsurface scattering
const JewelBearing = ({ position, size = 0.03 }) => {
  return (
    <group position={position}>
      {/* Outer setting */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[size * 1.2, size * 1.2, size * 0.5, 16]} />
        <meshPhysicalMaterial
          color="#ffd700"
          metalness={0.9}
          roughness={0.1}
          clearcoat={1}
        />
      </mesh>
      
      {/* Ruby jewel */}
      <mesh>
        <sphereGeometry args={[size, 16, 16]} />
        <RubyMaterial color="#dc143c" />
      </mesh>
      
      {/* Oil reservoir simulation */}
      <mesh position={[0, 0, size * 0.3]}>
        <cylinderGeometry args={[size * 0.5, size * 0.5, 0.001, 16]} />
        <meshPhysicalMaterial
          color="#ffebcd"
          transmission={0.9}
          thickness={0.1}
          roughness={0}
          metalness={0}
          ior={1.45}
        />
      </mesh>
    </group>
  );
};

// Main tourbillon cage
const TourbillonCage = ({ children }) => {
  const cageRef = useRef();
  
  useFrame((state) => {
    // 1 RPM rotation
    cageRef.current.rotation.y += (Math.PI * 2) / (60 * 60); // radians per frame at 60fps
  });

  return (
    <group ref={cageRef}>
      {/* Upper bridge */}
      <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.4, 0.4, 0.01, 3]} />
        <meshPhysicalMaterial
          color="#c0c0c0"
          metalness={0.9}
          roughness={0.05!
          clearcoat={1}
          clearcoatRoughness={0.02}
        />
      </mesh>
      
      {/* Pillars */}
      {[0, Math.PI * 2/3, Math.PI * 4/3].map((angle, i) => (
        <group key={i} rotation={[0, angle, 0]}>
          <mesh position={[0.35, 0, 0]} castShadow>
            <cylinderGeometry args={[0.01, 0.01, 0.6, 8]} />
            <meshPhysicalMaterial
              color="#d4d4d4"
              metalness={0.95}
              roughness={0.03}
              clearcoat={1}
            />
          </mesh>
        </group>
      ))}
      
      {/* Lower bridge */}
      <mesh position={[0, -0.3, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.4, 0.4, 0.01, 3]} />
        <meshPhysicalMaterial
          color="#c0c0c0"
          metalness={0.9}
          roughness={0.05}
          clearcoat={1}
        />
      </mesh>
      
      {/* Decorative engravings */}
      {[0, 0.1, 0.2].map((radius, i) => (
        <mesh key={i} position={[0, 0.305, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[radius, radius + 0.005, 64]} />
          <meshPhysicalMaterial
            color="#a0a0a0"
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
      ))}
      
      {children}
    </group>
  );
};

// Main component
const TourbillonMechanism = () => {
  const groupRef = useRef();

  return (
    <group ref={groupRef}>
      {/* Main lighting setup */}
      <ambientLight intensity={0.3} />
      <directionalLight
        position={[5, 5, 5]}
        intensity={1}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={20}
        shadow-camera-left={-2}
        shadow-camera-right={2}
        shadow-camera-top={2}
        shadow-camera-bottom={-2}
      />
      <pointLight position={[0, 2, 0]} intensity={0.5} />
      
      {/* Environment for reflections */}
      <Environment preset="studio" />
      
      {/* Flying tourbillon assembly */}
      <Float
        speed={0.5}
        rotationIntensity={0.1}
        floatIntensity={0.1}
      >
        <TourbillonCage>
          {/* Main gear train */}
          <group position={[0, -0.15, 0]}>
            <GearWheel radius={0.3} teeth={60} />
          </group>
          
          {/* Escapement wheel */}
          <group position={[0, 0, 0]}>
            <EscapementWheel />
          </group>
          
          {/* Balance wheel assembly */}
          <group position={[0, 0.1, 0]}>
            <BalanceWheel />
          </group>
          
          {/* Ruby jewel bearings */}
          <JewelBearing position={[0, 0.25, 0]} />
          <JewelBearing position={[0, -0.25, 0]} />
          <JewelBearing position={[0.2, 0, 0]} size={0.02} />
          <JewelBearing position={[-0.2, 0, 0]} size={0.02} />
          
          {/* Secondary gear */}
          <group position={[0.15, -0.1, 0]} scale={[0.5, 0.5, 0.5]}>
            <GearWheel radius={0.2} teeth={30} thickness={0.015} />
          </group>
          
          {/* Micro-finishing details */}
          <mesh position={[0, 0.31, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.8, 0.8, 128, 128]} />
            <meshPhysicalMaterial
              color="#e0e0e0"
              metalness={0.9}
              roughness={0.02}
              clearcoat={1}
              clearcoatRoughness={0}
              side={THREE.DoubleSide}
              transparent
              opacity={0.3}
            />
          </mesh>
        </TourbillonCage>
      </Float>
      
      {/* Shadow plane */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -1, 0]}
        receiveShadow
      >
        <planeGeometry args={[10, 10]} />
        <shadowMaterial opacity={0.3} />
      </mesh>
    </group>
  );
};

export default TourbillonMechanism;