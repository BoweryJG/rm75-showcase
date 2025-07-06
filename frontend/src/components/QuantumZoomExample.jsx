import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import QuantumZoomControls, { useQuantumZoom } from './QuantumZoomControls';

// Example crystalline structure component with LOD support
const CrystallineStructure = ({ detailLevel = 0 }) => {
  // Generate geometry based on detail level
  const geometry = useMemo(() => {
    switch (detailLevel) {
      case 0: // Macro view - simple sphere
        return new THREE.SphereGeometry(1, 16, 16);
      
      case 1: // Close-up - more detailed sphere with surface features
        return new THREE.SphereGeometry(1, 32, 32);
      
      case 2: // Microscopic - icosahedron representing molecular structure
        return new THREE.IcosahedronGeometry(1, 2);
      
      case 3: // Molecular - complex lattice structure
        const latticeGeometry = new THREE.BufferGeometry();
        const vertices = [];
        const size = 2;
        const divisions = 10;
        
        for (let x = 0; x <= divisions; x++) {
          for (let y = 0; y <= divisions; y++) {
            for (let z = 0; z <= divisions; z++) {
              vertices.push(
                (x / divisions - 0.5) * size,
                (y / divisions - 0.5) * size,
                (z / divisions - 0.5) * size
              );
            }
          }
        }
        
        latticeGeometry.setAttribute('position', 
          new THREE.Float32BufferAttribute(vertices, 3)
        );
        return latticeGeometry;
      
      case 4: // Quantum - crystalline atomic structure
        const crystalGeometry = new THREE.BufferGeometry();
        const crystalVertices = [];
        const crystalColors = [];
        
        // Create a complex crystalline pattern
        const layers = 20;
        const pointsPerLayer = 50;
        
        for (let l = 0; l < layers; l++) {
          const layerOffset = (l / layers - 0.5) * 2;
          
          for (let i = 0; i < pointsPerLayer; i++) {
            const angle = (i / pointsPerLayer) * Math.PI * 2;
            const radius = 0.5 + Math.sin(l * 0.5) * 0.3;
            
            crystalVertices.push(
              Math.cos(angle) * radius,
              layerOffset,
              Math.sin(angle) * radius
            );
            
            // Color based on position
            crystalColors.push(
              Math.abs(Math.cos(angle)),
              Math.abs(layerOffset),
              Math.abs(Math.sin(angle))
            );
          }
        }
        
        crystalGeometry.setAttribute('position', 
          new THREE.Float32BufferAttribute(crystalVertices, 3)
        );
        crystalGeometry.setAttribute('color', 
          new THREE.Float32BufferAttribute(crystalColors, 3)
        );
        
        return crystalGeometry;
      
      default:
        return new THREE.SphereGeometry(1, 16, 16);
    }
  }, [detailLevel]);

  // Material also changes based on detail level
  const material = useMemo(() => {
    const baseMaterial = {
      color: new THREE.Color(0x00ff88),
      emissive: new THREE.Color(0x00ff88),
      emissiveIntensity: 0.2,
    };

    switch (detailLevel) {
      case 0:
      case 1:
        return <meshPhongMaterial {...baseMaterial} />;
      
      case 2:
        return <meshPhongMaterial {...baseMaterial} wireframe />;
      
      case 3:
        return <pointsMaterial 
          size={0.05} 
          color={0x00ffff} 
          sizeAttenuation 
          transparent 
          opacity={0.8} 
        />;
      
      case 4:
        return <pointsMaterial 
          size={0.02} 
          vertexColors 
          sizeAttenuation 
          transparent 
          opacity={0.9}
          blending={THREE.AdditiveBlending}
        />;
      
      default:
        return <meshPhongMaterial {...baseMaterial} />;
    }
  }, [detailLevel]);

  // Render appropriate primitive based on detail level
  const primitive = detailLevel >= 3 ? 'points' : 'mesh';

  return (
    <primitive object={new THREE[primitive === 'points' ? 'Points' : 'Mesh'](geometry)}>
      {material}
    </primitive>
  );
};

// Main example component
const QuantumZoomExample = () => {
  const { zoom, detailLevel } = useQuantumZoom();

  const handleZoomChange = (newZoom) => {
    console.log('Zoom changed:', newZoom);
  };

  const handleDetailLevelChange = (newLevel) => {
    console.log('Detail level changed:', newLevel);
  };

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
      <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#00ffff" />
        
        <CrystallineStructure detailLevel={detailLevel} />
        
        <OrbitControls 
          enableZoom={false} // We handle zoom manually
          enablePan={true}
          enableRotate={true}
        />
      </Canvas>
      
      <QuantumZoomControls
        onZoomChange={handleZoomChange}
        onDetailLevelChange={handleDetailLevelChange}
        minZoom={1}
        maxZoom={10000}
        zoomSpeed={0.5}
        smoothness={0.1}
      />
      
      {/* Optional: Display current detail info */}
      <div style={{
        position: 'absolute',
        top: 20,
        left: 20,
        color: 'white',
        fontFamily: 'monospace',
        fontSize: '14px',
        background: 'rgba(0,0,0,0.7)',
        padding: '10px',
        borderRadius: '5px'
      }}>
        <div>Current Zoom: {zoom.toFixed(2)}x</div>
        <div>Detail Level: {detailLevel}</div>
        <div>
          {detailLevel === 0 && 'Viewing macro structure'}
          {detailLevel === 1 && 'Surface details visible'}
          {detailLevel === 2 && 'Molecular bonds apparent'}
          {detailLevel === 3 && 'Atomic lattice structure'}
          {detailLevel === 4 && 'Quantum crystalline view'}
        </div>
      </div>
    </div>
  );
};

export default QuantumZoomExample;