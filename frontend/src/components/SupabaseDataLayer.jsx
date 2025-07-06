import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, Text, Box, Sphere, MeshTransmissionMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { useSupabase } from '../hooks/useSupabase';
import { useWatchContext } from '../contexts/WatchContext';

// Custom shader for holographic data projections
const holographicShader = {
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vNormal;
    
    void main() {
      vUv = uv;
      vPosition = position;
      vNormal = normal;
      
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    uniform float time;
    uniform vec3 color;
    uniform float opacity;
    uniform float aberration;
    
    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vNormal;
    
    vec3 chromaticAberration(vec2 uv, float amount) {
      vec3 col;
      col.r = texture2D(tDiffuse, uv + vec2(amount, 0.0)).r;
      col.g = texture2D(tDiffuse, uv).g;
      col.b = texture2D(tDiffuse, uv - vec2(amount, 0.0)).b;
      return col;
    }
    
    void main() {
      // Holographic scan lines
      float scanline = sin(vUv.y * 100.0 + time * 2.0) * 0.04;
      
      // Iridescent effect
      vec3 viewDirection = normalize(cameraPosition - vPosition);
      float fresnel = pow(1.0 - dot(viewDirection, vNormal), 2.0);
      
      // Color shift based on angle
      vec3 iridescentColor = vec3(
        sin(fresnel * 3.14159 + time) * 0.5 + 0.5,
        sin(fresnel * 3.14159 + time + 2.094) * 0.5 + 0.5,
        sin(fresnel * 3.14159 + time + 4.188) * 0.5 + 0.5
      );
      
      // Combine effects
      vec3 finalColor = mix(color, iridescentColor, fresnel * 0.7);
      finalColor += scanline;
      
      // Pulsing effect
      float pulse = sin(time * 1.5) * 0.1 + 0.9;
      
      gl_FragColor = vec4(finalColor, opacity * pulse);
    }
  `
};

// Data particle system
function DataParticles({ count = 1000, color = '#00ffff', speed = 0.5 }) {
  const mesh = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const t = Math.random() * 100;
      const factor = 20 + Math.random() * 100;
      const speed = 0.01 + Math.random() / 200;
      const xFactor = -50 + Math.random() * 100;
      const yFactor = -50 + Math.random() * 100;
      const zFactor = -50 + Math.random() * 100;
      temp.push({ t, factor, speed, xFactor, yFactor, zFactor, mx: 0, my: 0 });
    }
    return temp;
  }, [count]);

  useFrame((state) => {
    particles.forEach((particle, i) => {
      let { t, factor, speed, xFactor, yFactor, zFactor } = particle;
      t = particle.t += speed / 2;
      const a = Math.cos(t) + Math.sin(t * 1) / 10;
      const b = Math.sin(t) + Math.cos(t * 2) / 10;
      const s = Math.cos(t);
      
      dummy.position.set(
        (particle.mx / 10) * a + xFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 1) * factor) / 10,
        (particle.my / 10) * b + yFactor + Math.sin((t / 10) * factor) + (Math.cos(t * 2) * factor) / 10,
        (particle.my / 10) * b + zFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 3) * factor) / 10
      );
      dummy.scale.set(s, s, s);
      dummy.rotation.set(s * 5, s * 5, s * 5);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[null, null, count]}>
      <sphereGeometry args={[0.05]} />
      <meshBasicMaterial color={color} transparent opacity={0.6} />
    </instancedMesh>
  );
}

// Floating data panel component
function DataPanel({ position, rotation, data, theme }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  
  const glassTheme = {
    sapphire: {
      color: '#1e3a8a',
      emissive: '#3b82f6',
      transmission: 0.9,
      thickness: 0.5,
      roughness: 0.1,
      ior: 1.5
    },
    emerald: {
      color: '#064e3b',
      emissive: '#10b981',
      transmission: 0.85,
      thickness: 0.6,
      roughness: 0.15,
      ior: 1.4
    },
    obsidian: {
      color: '#111827',
      emissive: '#6b7280',
      transmission: 0.7,
      thickness: 0.8,
      roughness: 0.3,
      ior: 1.3
    }
  };
  
  const currentTheme = glassTheme[theme] || glassTheme.sapphire;
  
  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.elapsedTime;
      meshRef.current.rotation.y = Math.sin(time * 0.5) * 0.1;
      
      if (hovered) {
        meshRef.current.scale.lerp(new THREE.Vector3(1.1, 1.1, 1.1), 0.1);
      } else {
        meshRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
      }
    }
  });
  
  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <group position={position} rotation={rotation}>
        <mesh
          ref={meshRef}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
        >
          <boxGeometry args={[3, 2, 0.1]} />
          <MeshTransmissionMaterial
            backside
            samples={16}
            resolution={512}
            transmission={currentTheme.transmission}
            roughness={currentTheme.roughness}
            thickness={currentTheme.thickness}
            ior={currentTheme.ior}
            chromaticAberration={0.5}
            anisotropy={0.3}
            distortion={0.1}
            distortionScale={0.2}
            temporalDistortion={0.1}
            color={currentTheme.color}
            emissive={currentTheme.emissive}
            emissiveIntensity={hovered ? 0.5 : 0.2}
          />
        </mesh>
        
        {/* Data content */}
        <group position={[0, 0, 0.06]}>
          <Text
            position={[0, 0.5, 0]}
            fontSize={0.2}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
            font="/fonts/inter-bold.woff"
          >
            {data.title}
          </Text>
          <Text
            position={[0, 0, 0]}
            fontSize={0.15}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
            font="/fonts/inter-regular.woff"
          >
            {data.value}
          </Text>
          <Text
            position={[0, -0.5, 0]}
            fontSize={0.1}
            color="#888888"
            anchorX="center"
            anchorY="middle"
            font="/fonts/inter-regular.woff"
          >
            {data.subtitle}
          </Text>
        </group>
      </group>
    </Float>
  );
}

// Holographic data projection
function HolographicProjection({ position, data, color = '#00ffff' }) {
  const meshRef = useRef();
  const materialRef = useRef();
  
  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = state.clock.elapsedTime;
    }
  });
  
  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <cylinderGeometry args={[2, 2, 0.01, 64]} />
        <shaderMaterial
          ref={materialRef}
          vertexShader={holographicShader.vertexShader}
          fragmentShader={holographicShader.fragmentShader}
          uniforms={{
            time: { value: 0 },
            color: { value: new THREE.Color(color) },
            opacity: { value: 0.3 },
            aberration: { value: 0.1 }
          }}
          transparent
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Data visualization */}
      <group position={[0, 0.1, 0]}>
        {data.points && data.points.map((point, i) => (
          <Sphere
            key={i}
            position={[
              Math.cos((i / data.points.length) * Math.PI * 2) * 1.5,
              point.value * 2,
              Math.sin((i / data.points.length) * Math.PI * 2) * 1.5
            ]}
            args={[0.05]}
          >
            <meshBasicMaterial color={color} />
          </Sphere>
        ))}
      </group>
    </group>
  );
}

// Tourbillon rhythm pulse effect
function TourbillonPulse({ position, color = '#ffffff', intensity = 1 }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.elapsedTime;
      const scale = 1 + Math.sin(time * 2) * 0.2 * intensity;
      meshRef.current.scale.set(scale, scale, scale);
      meshRef.current.material.opacity = 0.3 + Math.sin(time * 2) * 0.2;
    }
  });
  
  return (
    <mesh ref={meshRef} position={position}>
      <ringGeometry args={[1, 1.2, 64]} />
      <meshBasicMaterial color={color} transparent side={THREE.DoubleSide} />
    </mesh>
  );
}

// Main SupabaseDataLayer component
export default function SupabaseDataLayer({ variant = 'sapphire' }) {
  const { currentWatch } = useWatchContext();
  const { data, subscribeToChanges } = useSupabase();
  const [panels, setPanels] = useState([]);
  
  // Define themes for different watch variants
  const themes = {
    sapphire: {
      particleColor: '#3b82f6',
      projectionColor: '#60a5fa',
      pulseColor: '#1e3a8a',
      panelTheme: 'sapphire'
    },
    emerald: {
      particleColor: '#10b981',
      projectionColor: '#34d399',
      pulseColor: '#064e3b',
      panelTheme: 'emerald'
    },
    obsidian: {
      particleColor: '#6b7280',
      projectionColor: '#9ca3af',
      pulseColor: '#111827',
      panelTheme: 'obsidian'
    }
  };
  
  const currentTheme = themes[variant] || themes.sapphire;
  
  useEffect(() => {
    // Subscribe to real-time changes
    const unsubscribe = subscribeToChanges((newData) => {
      // Update panels with new data
      setPanels([
        {
          position: [-3, 2, 0],
          rotation: [0, 0.3, 0],
          data: {
            title: 'Live Metrics',
            value: newData.metrics?.value || '0',
            subtitle: 'Real-time data'
          }
        },
        {
          position: [3, 2, 0],
          rotation: [0, -0.3, 0],
          data: {
            title: 'Performance',
            value: newData.performance?.value || '0%',
            subtitle: 'System health'
          }
        },
        {
          position: [0, -2, 2],
          rotation: [0.3, 0, 0],
          data: {
            title: 'Analytics',
            value: newData.analytics?.value || '0',
            subtitle: 'Insights'
          }
        }
      ]);
    });
    
    return () => unsubscribe();
  }, [subscribeToChanges]);
  
  return (
    <div className="absolute inset-0 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        
        {/* Data particles */}
        <DataParticles
          count={500}
          color={currentTheme.particleColor}
          speed={0.5}
        />
        
        {/* Floating data panels */}
        {panels.map((panel, index) => (
          <DataPanel
            key={index}
            position={panel.position}
            rotation={panel.rotation}
            data={panel.data}
            theme={currentTheme.panelTheme}
          />
        ))}
        
        {/* Holographic projections */}
        <HolographicProjection
          position={[0, 0, 0]}
          data={{
            points: Array.from({ length: 12 }, (_, i) => ({
              value: Math.random() * 0.5 + 0.5
            }))
          }}
          color={currentTheme.projectionColor}
        />
        
        {/* Tourbillon rhythm pulses */}
        <TourbillonPulse
          position={[0, 0, -2]}
          color={currentTheme.pulseColor}
          intensity={1}
        />
        <TourbillonPulse
          position={[0, 0, -1]}
          color={currentTheme.pulseColor}
          intensity={0.7}
        />
        <TourbillonPulse
          position={[0, 0, 0]}
          color={currentTheme.pulseColor}
          intensity={0.5}
        />
      </Canvas>
    </div>
  );
}