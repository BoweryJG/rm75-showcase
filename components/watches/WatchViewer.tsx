'use client';

import React, { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera, Html } from '@react-three/drei';
import { motion } from 'framer-motion';
import { WatchViewerProps, InteractionEvent } from '@/types/watch';
import { usePerformance } from '@/hooks/usePerformance';
import { useAudio } from '@/hooks/useAudio';

// Loading component
function LoadingScreen() {
  return (
    <Html center>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-white text-center"
      >
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-lg font-light">Loading Richard Mille Experience...</p>
      </motion.div>
    </Html>
  );
}

// Performance monitoring component
function PerformanceMonitor() {
  const { gl } = useThree();
  const { updateRenderTime, updateTriangleCount } = usePerformance();
  
  useFrame((state, delta) => {
    updateRenderTime(delta * 1000);
    
    // Get triangle count from renderer
    if (gl.info) {
      updateTriangleCount(gl.info.render.triangles);
    }
  });
  
  return null;
}

// Main watch model component (placeholder)
function WatchModel({ model, viewMode, performanceSettings, onInteraction }: {
  model: any;
  viewMode: string;
  performanceSettings: any;
  onInteraction?: (event: InteractionEvent) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const { playHoverSound, playClickSound } = useAudio();

  useFrame((state, delta) => {
    if (meshRef.current) {
      // Rotate the watch slowly
      meshRef.current.rotation.y += delta * 0.2;
    }
  });

  const handlePointerOver = (event: any) => {
    event.stopPropagation();
    setHovered(true);
    playHoverSound();
    
    if (onInteraction) {
      onInteraction({
        type: 'hover',
        target: 'watch-case',
        position: [event.point.x, event.point.y],
        timestamp: Date.now(),
      });
    }
  };

  const handlePointerOut = () => {
    setHovered(false);
  };

  const handleClick = (event: any) => {
    event.stopPropagation();
    playClickSound();
    
    if (onInteraction) {
      onInteraction({
        type: 'click',
        target: 'watch-case',
        position: [event.point.x, event.point.y],
        timestamp: Date.now(),
      });
    }
  };

  return (
    <group>
      {/* Watch Case */}
      <mesh
        ref={meshRef}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
        scale={hovered ? 1.05 : 1}
      >
        <cylinderGeometry args={[2, 2, 0.5, 32]} />
        <meshStandardMaterial
          color={hovered ? "#2a2a2a" : "#1a1a1a"}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
      
      {/* Watch Face */}
      <mesh position={[0, 0.26, 0]}>
        <cylinderGeometry args={[1.8, 1.8, 0.02, 32]} />
        <meshStandardMaterial
          color="#000000"
          metalness={0.1}
          roughness={0.9}
        />
      </mesh>
      
      {/* Hour Markers */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i * Math.PI * 2) / 12;
        const x = Math.sin(angle) * 1.5;
        const z = Math.cos(angle) * 1.5;
        
        return (
          <mesh key={i} position={[x, 0.27, z]}>
            <boxGeometry args={[0.05, 0.01, 0.2]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
        );
      })}
      
      {/* Watch Hands */}
      <group rotation={[0, Date.now() * 0.0001, 0]}>
        <mesh position={[0, 0.28, 0.8]}>
          <boxGeometry args={[0.02, 0.01, 1.6]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      </group>
      
      <group rotation={[0, Date.now() * 0.001, 0]}>
        <mesh position={[0, 0.29, 0.6]}>
          <boxGeometry args={[0.03, 0.01, 1.2]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      </group>
    </group>
  );
}

// Camera controller
function CameraController({ viewMode }: { viewMode: string }) {
  const { camera } = useThree();
  
  useEffect(() => {
    switch (viewMode) {
      case '3d':
        camera.position.set(5, 2, 5);
        break;
      case '2d':
        camera.position.set(0, 0, 8);
        break;
      case 'ar':
        camera.position.set(0, 1, 3);
        break;
    }
  }, [viewMode, camera]);
  
  return null;
}

export default function WatchViewer({
  model,
  viewMode = '3d',
  interactive = true,
  autoRotate = true,
  enableAudio = true,
  performanceMode = 'medium',
  onInteraction,
  onPerformanceUpdate,
}: WatchViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { getSettings, metrics } = usePerformance();
  const { isEnabled: audioEnabled } = useAudio();
  
  const performanceSettings = getSettings();
  
  useEffect(() => {
    if (onPerformanceUpdate) {
      onPerformanceUpdate(metrics);
    }
  }, [metrics, onPerformanceUpdate]);

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-gray-900 to-black">
      <Canvas
        ref={canvasRef}
        shadows={performanceSettings.shadowMapSize > 0}
        dpr={performanceMode === 'high' ? 2 : 1}
        performance={{ min: 0.5 }}
        gl={{
          antialias: performanceSettings.antialiasing,
          alpha: true,
          powerPreference: "high-performance",
        }}
      >
        <Suspense fallback={<LoadingScreen />}>
          {/* Camera */}
          <PerspectiveCamera makeDefault fov={50} position={[5, 2, 5]} />
          <CameraController viewMode={viewMode} />
          
          {/* Controls */}
          <OrbitControls
            enabled={interactive}
            autoRotate={autoRotate}
            autoRotateSpeed={0.5}
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={3}
            maxDistance={15}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI - Math.PI / 6}
          />
          
          {/* Lighting */}
          <ambientLight intensity={0.4} />
          <directionalLight
            position={[10, 10, 5]}
            intensity={1}
            castShadow={performanceSettings.shadowMapSize > 0}
            shadow-mapSize-width={performanceSettings.shadowMapSize}
            shadow-mapSize-height={performanceSettings.shadowMapSize}
          />
          <pointLight position={[-10, 0, -20]} intensity={0.5} color="#0066ff" />
          <pointLight position={[0, -10, 0]} intensity={0.3} color="#ff6600" />
          
          {/* Environment */}
          <Environment preset="studio" />
          
          {/* Watch Model */}
          <WatchModel
            model={model}
            viewMode={viewMode}
            performanceSettings={performanceSettings}
            onInteraction={onInteraction}
          />
          
          {/* Performance Monitor */}
          <PerformanceMonitor />
        </Suspense>
      </Canvas>
      
      {/* UI Overlay */}
      <div className="absolute top-4 right-4 text-white text-sm">
        <div className="bg-black bg-opacity-50 rounded-lg p-3 space-y-1">
          <div>FPS: {metrics.fps}</div>
          <div>Triangles: {metrics.triangleCount.toLocaleString()}</div>
          <div>Memory: {metrics.memoryUsage}MB</div>
          <div>Mode: {performanceMode}</div>
          {audioEnabled && enableAudio && (
            <div className="text-green-400">Audio: ON</div>
          )}
        </div>
      </div>
      
      {/* View Mode Selector */}
      <div className="absolute bottom-4 left-4">
        <div className="flex space-x-2">
          {(['3d', '2d', 'ar'] as const).map((mode) => (
            <motion.button
              key={mode}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                viewMode === mode
                  ? 'bg-white text-black'
                  : 'bg-black bg-opacity-50 text-white hover:bg-opacity-70'
              }`}
            >
              {mode.toUpperCase()}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}