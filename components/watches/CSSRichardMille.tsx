import React, { useState, useEffect, useRef } from 'react';
import './CSSRichardMille.css';

interface CSSRichardMilleProps {
  className?: string;
}

const CSSRichardMille: React.FC<CSSRichardMilleProps> = ({ className = '' }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [chronoTime, setChronoTime] = useState(0);
  const [isChronoRunning, setIsChronoRunning] = useState(false);
  const [powerReserve, setPowerReserve] = useState(85);
  const animationFrameRef = useRef<number>();
  const chronoStartTimeRef = useRef<number>(0);

  // Update time for smooth movement
  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date());
      
      // Simulate power reserve depletion
      if (!isChronoRunning && powerReserve > 0) {
        setPowerReserve(prev => Math.max(0, prev - 0.002));
      }
    };

    const interval = setInterval(updateTime, 50); // 20fps for smooth movement
    return () => clearInterval(interval);
  }, [isChronoRunning, powerReserve]);

  // Chronograph functionality
  useEffect(() => {
    if (isChronoRunning) {
      const startTime = chronoStartTimeRef.current || Date.now();
      if (!chronoStartTimeRef.current) {
        chronoStartTimeRef.current = startTime;
      }

      const updateChrono = () => {
        const elapsed = Date.now() - startTime;
        setChronoTime(elapsed);
        animationFrameRef.current = requestAnimationFrame(updateChrono);
      };

      animationFrameRef.current = requestAnimationFrame(updateChrono);
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isChronoRunning]);

  const handleCrownClick = () => {
    // Wind the watch
    setPowerReserve(prev => Math.min(100, prev + 10));
  };

  const handleTopPusher = () => {
    // Start/stop chronograph
    if (!isChronoRunning) {
      chronoStartTimeRef.current = Date.now() - chronoTime;
    }
    setIsChronoRunning(!isChronoRunning);
  };

  const handleBottomPusher = () => {
    // Reset chronograph
    setIsChronoRunning(false);
    setChronoTime(0);
    chronoStartTimeRef.current = 0;
  };

  // Calculate angles for hands
  const hours = currentTime.getHours() % 12;
  const minutes = currentTime.getMinutes();
  const seconds = currentTime.getSeconds();
  const milliseconds = currentTime.getMilliseconds();

  const secondAngle = (seconds + milliseconds / 1000) * 6;
  const minuteAngle = (minutes + seconds / 60) * 6;
  const hourAngle = (hours + minutes / 60) * 30;

  // Chronograph calculations
  const chronoSeconds = (chronoTime / 1000) % 60;
  const chronoSecondAngle = chronoSeconds * 6;

  return (
    <div className={`css-rm-container ${className}`}>
      <div className="strap top"></div>
      <div className="watch-container">
        {/* Case screws */}
        <div className="screw" data-position="1"></div>
        <div className="screw" data-position="2"></div>
        <div className="screw" data-position="3"></div>
        <div className="screw" data-position="4"></div>
        <div className="screw" data-position="5"></div>
        <div className="screw" data-position="6"></div>
        <div className="screw" data-position="7"></div>
        <div className="screw" data-position="8"></div>

        {/* Crown and pushers */}
        <div className="crown-assembly">
          <button className="pusher top-pusher" onClick={handleTopPusher} />
          <button className="crown" onClick={handleCrownClick}>
            <span className="crown-logo">RM</span>
          </button>
          <button className="pusher bottom-pusher" onClick={handleBottomPusher} />
        </div>

        <div className="dial">
          {/* Hour markers */}
          {[...Array(12)].map((_, i) => (
            <div
              key={`hour-${i}`}
              className="hour-marker"
              style={{ transform: `rotate(${i * 30}deg)` }}
            >
              <div className="marker-inner" />
            </div>
          ))}

          {/* Decorative bars */}
          <div className="bar" data-index="1"></div>
          <div className="bar" data-index="2"></div>
          <div className="bar" data-index="3"></div>
          <div className="bar" data-index="4"></div>
          <div className="bar" data-index="5"></div>

          {/* Power reserve indicator */}
          <div className="power-reserve-indicator">
            <div className="power-label">PWR</div>
            <div className="power-gauge">
              <div 
                className="power-level" 
                style={{ width: `${powerReserve}%` }}
              />
            </div>
          </div>

          {/* Richard Mille branding */}
          <div className="rm-branding">
            <div className="rm-logo">RICHARD MILLE</div>
            <div className="model">RM 75-01</div>
          </div>

          {/* Date window */}
          <div className="date-window">
            <span className="date-value">{currentTime.getDate()}</span>
          </div>

          {/* Hands */}
          <div 
            className="hand hour" 
            style={{ transform: `translate(-50%, -100%) rotate(${hourAngle}deg)` }}
          >
            <div className="hand-center"></div>
          </div>
          <div 
            className="hand minute" 
            style={{ transform: `translate(-50%, -100%) rotate(${minuteAngle}deg)` }}
          >
            <div className="hand-center"></div>
          </div>
          <div 
            className="hand second" 
            style={{ transform: `translate(-50%, -100%) rotate(${secondAngle}deg)` }}
          >
            <div className="hand-center"></div>
          </div>

          {/* Chronograph second hand */}
          {(isChronoRunning || chronoTime > 0) && (
            <div 
              className="hand chrono-second" 
              style={{ transform: `translate(-50%, -100%) rotate(${chronoSecondAngle}deg)` }}
            >
              <div className="chrono-tip"></div>
            </div>
          )}

          {/* Center cap */}
          <div className="center-cap"></div>
        </div>
      </div>
      <div className="strap bottom"></div>

      {/* Watch info display */}
      <div className="watch-status">
        <div className="status-item">
          <span className="status-label">Power Reserve:</span>
          <span className="status-value">{Math.round(powerReserve)}%</span>
        </div>
        {isChronoRunning && (
          <div className="status-item chrono-status">
            <span className="status-label">Chrono:</span>
            <span className="status-value">{(chronoTime / 1000).toFixed(1)}s</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default CSSRichardMille;