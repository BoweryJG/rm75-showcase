import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { Vector3, MathUtils } from 'three';
import './QuantumZoomControls.css';

const ZOOM_LEVELS = [
  { level: 1, name: 'Macro', description: 'Standard view' },
  { level: 10, name: 'Close-up', description: 'Surface details' },
  { level: 100, name: 'Microscopic', description: 'Fine structures' },
  { level: 1000, name: 'Molecular', description: 'Molecular bonds' },
  { level: 5000, name: 'Atomic', description: 'Atomic lattice' },
  { level: 10000, name: 'Quantum', description: 'Crystalline structure' }
];

const QuantumZoomControls = ({ 
  onZoomChange, 
  onDetailLevelChange,
  minZoom = 1,
  maxZoom = 10000,
  zoomSpeed = 0.5,
  smoothness = 0.1
}) => {
  const { camera, gl } = useThree();
  const [currentZoom, setCurrentZoom] = useState(1);
  const [targetZoom, setTargetZoom] = useState(1);
  const [detailLevel, setDetailLevel] = useState(0);
  const [isZooming, setIsZooming] = useState(false);

  // Calculate detail level based on zoom
  const calculateDetailLevel = useCallback((zoom) => {
    if (zoom < 10) return 0;
    if (zoom < 100) return 1;
    if (zoom < 1000) return 2;
    if (zoom < 5000) return 3;
    return 4;
  }, []);

  // Get current zoom level info
  const currentZoomLevel = useMemo(() => {
    return ZOOM_LEVELS.reduce((prev, curr) => 
      Math.abs(curr.level - currentZoom) < Math.abs(prev.level - currentZoom) ? curr : prev
    );
  }, [currentZoom]);

  // Handle zoom input
  const handleZoomIn = useCallback(() => {
    const newZoom = Math.min(targetZoom * 2, maxZoom);
    setTargetZoom(newZoom);
    setIsZooming(true);
  }, [targetZoom, maxZoom]);

  const handleZoomOut = useCallback(() => {
    const newZoom = Math.max(targetZoom / 2, minZoom);
    setTargetZoom(newZoom);
    setIsZooming(true);
  }, [targetZoom, minZoom]);

  const handleZoomReset = useCallback(() => {
    setTargetZoom(1);
    setIsZooming(true);
  }, []);

  const handleZoomToLevel = useCallback((level) => {
    setTargetZoom(level);
    setIsZooming(true);
  }, []);

  // Handle wheel zoom
  useEffect(() => {
    const handleWheel = (event) => {
      event.preventDefault();
      const delta = event.deltaY * -0.001;
      const newZoom = MathUtils.clamp(
        targetZoom * (1 + delta * zoomSpeed),
        minZoom,
        maxZoom
      );
      setTargetZoom(newZoom);
      setIsZooming(true);
    };

    gl.domElement.addEventListener('wheel', handleWheel, { passive: false });
    return () => gl.domElement.removeEventListener('wheel', handleWheel);
  }, [gl.domElement, targetZoom, zoomSpeed, minZoom, maxZoom]);

  // Smooth zoom animation
  useFrame((state, delta) => {
    if (Math.abs(currentZoom - targetZoom) > 0.01) {
      const newZoom = MathUtils.lerp(currentZoom, targetZoom, smoothness);
      setCurrentZoom(newZoom);

      // Update camera
      const distance = 10 / newZoom;
      camera.position.setLength(distance);
      camera.updateProjectionMatrix();

      // Update detail level
      const newDetailLevel = calculateDetailLevel(newZoom);
      if (newDetailLevel !== detailLevel) {
        setDetailLevel(newDetailLevel);
        onDetailLevelChange?.(newDetailLevel);
      }

      // Notify zoom change
      onZoomChange?.(newZoom);
    } else {
      setIsZooming(false);
    }
  });

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event) => {
      switch(event.key) {
        case '+':
        case '=':
          handleZoomIn();
          break;
        case '-':
        case '_':
          handleZoomOut();
          break;
        case '0':
          handleZoomReset();
          break;
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
          const levelIndex = parseInt(event.key) - 1;
          if (ZOOM_LEVELS[levelIndex]) {
            handleZoomToLevel(ZOOM_LEVELS[levelIndex].level);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleZoomIn, handleZoomOut, handleZoomReset, handleZoomToLevel]);

  return (
    <div className="quantum-zoom-controls">
      <div className="zoom-info">
        <div className="zoom-level">
          <span className="zoom-value">{currentZoom.toFixed(0)}x</span>
          <span className="zoom-name">{currentZoomLevel.name}</span>
        </div>
        <div className="zoom-description">{currentZoomLevel.description}</div>
        <div className="zoom-bar">
          <div 
            className="zoom-bar-fill" 
            style={{ width: `${(Math.log(currentZoom) / Math.log(maxZoom)) * 100}%` }}
          />
        </div>
      </div>

      <div className="zoom-buttons">
        <button 
          className="zoom-button zoom-out"
          onClick={handleZoomOut}
          disabled={currentZoom <= minZoom}
          title="Zoom Out (-)"
        >
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path fill="currentColor" d="M19 13H5v-2h14v2z"/>
          </svg>
        </button>

        <button 
          className="zoom-button zoom-reset"
          onClick={handleZoomReset}
          title="Reset Zoom (0)"
        >
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path fill="currentColor" d="M12 5V2L8 6l4 4V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
          </svg>
        </button>

        <button 
          className="zoom-button zoom-in"
          onClick={handleZoomIn}
          disabled={currentZoom >= maxZoom}
          title="Zoom In (+)"
        >
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
          </svg>
        </button>
      </div>

      <div className="zoom-presets">
        {ZOOM_LEVELS.map((level, index) => (
          <button
            key={level.level}
            className={`zoom-preset ${Math.abs(currentZoom - level.level) < 10 ? 'active' : ''}`}
            onClick={() => handleZoomToLevel(level.level)}
            title={`${level.name} (${index + 1})`}
          >
            <span className="preset-level">{level.level}x</span>
            <span className="preset-name">{level.name}</span>
          </button>
        ))}
      </div>

      {isZooming && (
        <div className="zoom-indicator">
          <div className="zoom-spinner" />
          <span>Loading details...</span>
        </div>
      )}
    </div>
  );
};

// HOC for adding LOD support to 3D objects
export const withQuantumLOD = (Component) => {
  return React.forwardRef((props, ref) => {
    const [detailLevel, setDetailLevel] = useState(0);
    
    return (
      <>
        <QuantumZoomControls onDetailLevelChange={setDetailLevel} />
        <Component {...props} ref={ref} detailLevel={detailLevel} />
      </>
    );
  });
};

// Hook for using zoom data in other components
export const useQuantumZoom = () => {
  const [zoom, setZoom] = useState(1);
  const [detailLevel, setDetailLevel] = useState(0);

  return {
    zoom,
    detailLevel,
    setZoom,
    setDetailLevel
  };
};

export default QuantumZoomControls;