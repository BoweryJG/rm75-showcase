import React, { useState, useEffect, useRef } from 'react';
import './McLarenRM1103Watch.css';

interface WatchProps {
  className?: string;
}

const McLarenRM1103Watch: React.FC<WatchProps> = ({ className = '' }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [chronoTime, setChronoTime] = useState(0);
  const [isChronoRunning, setIsChronoRunning] = useState(false);
  const [powerReserve, setPowerReserve] = useState(100);
  const animationFrameRef = useRef<number>();
  const chronoStartTimeRef = useRef<number>(0);

  // Update time every second for smooth movement
  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date());
      
      // Simulate power reserve depletion
      setPowerReserve(prev => {
        if (prev <= 0) return 0;
        return prev - 0.001;
      });
    };

    const interval = setInterval(updateTime, 50); // 20fps for smooth second hand
    return () => clearInterval(interval);
  }, []);

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

  const handleChronoToggle = () => {
    if (!isChronoRunning) {
      chronoStartTimeRef.current = Date.now() - chronoTime;
    }
    setIsChronoRunning(!isChronoRunning);
  };

  const handleChronoReset = () => {
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
  const chronoMinutes = Math.floor(chronoTime / 60000) % 30;
  const chronoHours = Math.floor(chronoTime / 3600000) % 12;

  const chronoSecondAngle = chronoSeconds * 6;
  const chronoMinuteAngle = chronoMinutes * 12;
  const chronoHourAngle = chronoHours * 30;

  // Power reserve angle (270 degrees = full, 0 = empty)
  const powerReserveAngle = (powerReserve / 100) * 270;

  return (
    <div className={`mclaren-watch-container ${className}`}>
      <div className="watch-case">
        <div className="carbon-texture"></div>
        
        {/* Crown and pushers */}
        <button className="crown" onClick={() => setPowerReserve(100)} />
        <button className="pusher pusher-top" onClick={handleChronoToggle} />
        <button className="pusher pusher-bottom" onClick={handleChronoReset} />
        
        <div className="watch-dial">
          <div className="sapphire-crystal"></div>
          
          {/* McLaren Logo */}
          <div className="mclaren-logo">
            <svg viewBox="0 0 100 30" className="logo-svg">
              <path d="M10 15 Q 50 5, 90 15 Q 50 25, 10 15" fill="#FF8000" />
              <text x="50" y="20" textAnchor="middle" fill="#FF8000" fontSize="8" fontWeight="bold">McLAREN</text>
            </svg>
          </div>

          {/* Main dial indices */}
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="hour-marker"
              style={{ transform: `rotate(${i * 30}deg)` }}
            >
              <div className="marker-line" />
            </div>
          ))}

          {/* Minute indices */}
          {[...Array(60)].map((_, i) => (
            i % 5 !== 0 && (
              <div
                key={i}
                className="minute-marker"
                style={{ transform: `rotate(${i * 6}deg)` }}
              >
                <div className="marker-dot" />
              </div>
            )
          ))}

          {/* Subdials */}
          {/* 30-minute chronograph counter at 3 o'clock */}
          <div className="subdial subdial-3">
            <div className="subdial-face">
              <div className="subdial-hand" style={{ transform: `rotate(${chronoMinuteAngle}deg)` }} />
              {[...Array(6)].map((_, i) => (
                <div key={i} className="subdial-marker" style={{ transform: `rotate(${i * 60}deg)` }} />
              ))}
            </div>
            <span className="subdial-label">30</span>
          </div>

          {/* 12-hour chronograph counter at 6 o'clock */}
          <div className="subdial subdial-6">
            <div className="subdial-face">
              <div className="subdial-hand" style={{ transform: `rotate(${chronoHourAngle}deg)` }} />
              {[...Array(4)].map((_, i) => (
                <div key={i} className="subdial-marker" style={{ transform: `rotate(${i * 90}deg)` }} />
              ))}
            </div>
            <span className="subdial-label">12</span>
          </div>

          {/* Running seconds at 9 o'clock */}
          <div className="subdial subdial-9">
            <div className="subdial-face">
              <div className="subdial-hand seconds" style={{ transform: `rotate(${secondAngle}deg)` }} />
              {[...Array(12)].map((_, i) => (
                <div key={i} className="subdial-marker" style={{ transform: `rotate(${i * 30}deg)` }} />
              ))}
            </div>
            <span className="subdial-label">60</span>
          </div>

          {/* Power reserve indicator */}
          <div className="power-reserve">
            <div className="power-reserve-arc">
              <svg viewBox="0 0 100 50">
                <path
                  d="M 10 40 A 30 30 0 0 1 90 40"
                  fill="none"
                  stroke="#333"
                  strokeWidth="2"
                />
                <path
                  d="M 10 40 A 30 30 0 0 1 90 40"
                  fill="none"
                  stroke="#FF8000"
                  strokeWidth="2"
                  strokeDasharray={`${powerReserveAngle * 0.523} 1000`}
                />
              </svg>
            </div>
            <span className="power-label">POWER</span>
          </div>

          {/* Date window */}
          <div className="date-window">
            <span className="date-number">{currentTime.getDate()}</span>
          </div>

          {/* Main hands */}
          <div className="hand hour-hand" style={{ transform: `rotate(${hourAngle}deg)` }}>
            <div className="hand-body" />
            <div className="hand-tip" />
          </div>
          
          <div className="hand minute-hand" style={{ transform: `rotate(${minuteAngle}deg)` }}>
            <div className="hand-body" />
            <div className="hand-tip" />
          </div>

          {/* Chronograph second hand */}
          <div className="hand chrono-hand" style={{ transform: `rotate(${chronoSecondAngle}deg)` }}>
            <div className="chrono-body" />
            <div className="chrono-tip" />
          </div>

          {/* Center cap */}
          <div className="center-cap" />

          {/* RM 11-03 marking */}
          <div className="model-marking">RM 11-03</div>
        </div>

        {/* Watch strap */}
        <div className="watch-strap strap-top">
          <div className="strap-texture"></div>
        </div>
        <div className="watch-strap strap-bottom">
          <div className="strap-texture"></div>
        </div>
      </div>
    </div>
  );
};

export default McLarenRM1103Watch;