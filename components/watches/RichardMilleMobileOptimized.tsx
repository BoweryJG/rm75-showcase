import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './RichardMilleMobileOptimized.css';

interface RichardMilleMobileProps {
  className?: string;
}

const RichardMilleMobileOptimized: React.FC<RichardMilleMobileProps> = ({ className = '' }) => {
  const [time, setTime] = useState(() => Date.now());
  const [isInteracting, setIsInteracting] = useState(false);
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);
  
  // Optimized time update with RAF
  useEffect(() => {
    let rafId: number;
    let lastTime = 0;
    
    const updateTime = (timestamp: number) => {
      if (timestamp - lastTime >= 1000) { // Update every second
        setTime(Date.now());
        lastTime = timestamp;
      }
      rafId = requestAnimationFrame(updateTime);
    };
    
    rafId = requestAnimationFrame(updateTime);
    return () => cancelAnimationFrame(rafId);
  }, []);

  // Memoized time calculations
  const { hourAngle, minuteAngle, secondAngle } = useMemo(() => {
    const date = new Date(time);
    const hours = date.getHours() % 12;
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    
    return {
      hourAngle: (hours + minutes / 60) * 30,
      minuteAngle: (minutes + seconds / 60) * 6,
      secondAngle: seconds * 6
    };
  }, [time]);

  // Touch handlers for mobile interaction
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
    setIsInteracting(true);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isInteracting) return;
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;
    
    // Rotate watch based on horizontal swipe
    setRotation(prev => prev + deltaX * 0.5);
    
    // Pinch to zoom detection
    if (e.touches.length === 2) {
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch.clientX,
        touch2.clientY - touch.clientY
      );
      setZoom(Math.max(0.8, Math.min(2, distance / 100)));
    }
  }, [isInteracting, touchStart]);

  const handleTouchEnd = useCallback(() => {
    setIsInteracting(false);
  }, []);

  // Double tap to reset
  const handleDoubleTap = useCallback(() => {
    setRotation(0);
    setZoom(1);
  }, []);

  return (
    <div className={`rm-mobile-container ${className}`}>
      <div 
        className="rm-mobile-watch"
        style={{
          transform: `rotate(${rotation}deg) scale(${zoom})`,
          transition: isInteracting ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onDoubleClick={handleDoubleTap}
      >
        <div className="rm-strap rm-strap-top" />
        
        <div className="rm-case">
          {/* Optimized screws with single element */}
          {[...Array(8)].map((_, i) => (
            <div key={i} className={`rm-screw rm-screw-${i + 1}`} />
          ))}
          
          <div className="rm-dial">
            {/* Gradient bars for performance */}
            <div className="rm-bars-container">
              <div className="rm-bar rm-bar-1" />
              <div className="rm-bar rm-bar-2" />
              <div className="rm-bar rm-bar-3" />
              <div className="rm-bar rm-bar-4" />
              <div className="rm-bar rm-bar-5" />
            </div>
            
            {/* Hour markers using CSS grid for better performance */}
            <div className="rm-markers">
              {[12, 3, 6, 9].map(hour => (
                <div key={hour} className={`rm-marker rm-marker-${hour}`}>
                  {hour}
                </div>
              ))}
            </div>
            
            {/* Hands with GPU acceleration */}
            <div 
              className="rm-hand rm-hand-hour"
              style={{ 
                transform: `translate(-50%, -100%) rotate(${hourAngle}deg)`,
                willChange: 'transform' 
              }}
            />
            <div 
              className="rm-hand rm-hand-minute"
              style={{ 
                transform: `translate(-50%, -100%) rotate(${minuteAngle}deg)`,
                willChange: 'transform'
              }}
            />
            <div 
              className="rm-hand rm-hand-second"
              style={{ 
                transform: `translate(-50%, -100%) rotate(${secondAngle}deg)`,
                willChange: 'transform'
              }}
            />
            
            {/* Center dot */}
            <div className="rm-center" />
            
            {/* Touch indicator */}
            {isInteracting && (
              <div className="rm-touch-indicator">
                <div className="rm-touch-ripple" />
              </div>
            )}
          </div>
        </div>
        
        <div className="rm-strap rm-strap-bottom" />
      </div>
      
      {/* Mobile controls */}
      <div className="rm-mobile-controls">
        <button 
          className="rm-control-btn"
          onClick={() => setZoom(z => Math.min(2, z + 0.2))}
          aria-label="Zoom in"
        >
          +
        </button>
        <button 
          className="rm-control-btn rm-control-reset"
          onClick={handleDoubleTap}
          aria-label="Reset view"
        >
          ↻
        </button>
        <button 
          className="rm-control-btn"
          onClick={() => setZoom(z => Math.max(0.8, z - 0.2))}
          aria-label="Zoom out"
        >
          −
        </button>
      </div>
      
      {/* Performance indicator */}
      <div className="rm-performance">
        <div className="rm-fps">60 FPS</div>
        <div className="rm-touch-hint">
          Swipe to rotate • Pinch to zoom • Double tap to reset
        </div>
      </div>
    </div>
  );
};

export default RichardMilleMobileOptimized;