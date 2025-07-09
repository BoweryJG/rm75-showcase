import React, { useState, useEffect, useRef } from 'react';
import './YohanBlakeRM5901.css';

const YohanBlakeRM5901 = () => {
  const [seconds, setSeconds] = useState(0);
  const [powerReserve, setPowerReserve] = useState(75);
  const [isWinding, setIsWinding] = useState(false);
  const tourbillonRef = useRef(null);
  const animationRef = useRef(null);

  // High-precision timing for 60fps animations
  useEffect(() => {
    let lastTime = performance.now();
    
    const animate = (currentTime) => {
      const deltaTime = currentTime - lastTime;
      
      if (deltaTime >= 16.67) { // 60fps
        setSeconds(prev => (prev + deltaTime / 1000) % 60);
        
        // Power reserve depletion
        if (!isWinding && powerReserve > 0) {
          setPowerReserve(prev => Math.max(0, prev - 0.001));
        }
        
        lastTime = currentTime;
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isWinding, powerReserve]);

  // Hand winding mechanism
  const handleWind = () => {
    setIsWinding(true);
    setPowerReserve(prev => Math.min(100, prev + 5));
    setTimeout(() => setIsWinding(false), 300);
  };

  // Calculate rotation angles
  const tourbillonRotation = seconds * 6; // 360° in 60 seconds
  const escapeWheelRotation = seconds * 36; // 10x faster
  const balanceWheelRotation = Math.sin(seconds * Math.PI * 6) * 30; // Oscillating motion
  const gearRotation = seconds * 12; // Secondary gear rotation

  return (
    <div className="rm-5901-container">
      <div className="watch-case">
        {/* Carbon TPT case with Jamaica green fibers */}
        <div className="carbon-case">
          <div className="carbon-texture"></div>
          <div className="green-fibers"></div>
        </div>

        {/* Crystal and dial */}
        <div className="crystal">
          <div className="crystal-reflection"></div>
          
          {/* Skeleton dial */}
          <div className="dial">
            {/* Hour markers */}
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="hour-marker"
                style={{ transform: `rotate(${i * 30}deg)` }}
              >
                <div className="marker-line"></div>
              </div>
            ))}

            {/* Jamaica flag accents */}
            <div className="jamaica-accent top"></div>
            <div className="jamaica-accent bottom"></div>

            {/* Main movement plate */}
            <div className="movement-plate">
              {/* Tourbillon cage at 6 o'clock */}
              <div className="tourbillon-assembly" ref={tourbillonRef}>
                <div 
                  className="tourbillon-cage"
                  style={{ transform: `rotate(${tourbillonRotation}deg)` }}
                >
                  {/* Tourbillon bridge */}
                  <div className="tourbillon-bridge">
                    <div className="bridge-arm left"></div>
                    <div className="bridge-arm right"></div>
                  </div>

                  {/* Balance wheel */}
                  <div 
                    className="balance-wheel"
                    style={{ transform: `rotate(${balanceWheelRotation}deg)` }}
                  >
                    <div className="balance-rim"></div>
                    <div className="balance-spring"></div>
                    <div className="jewel-bearing"></div>
                  </div>

                  {/* Escape wheel */}
                  <div 
                    className="escape-wheel"
                    style={{ transform: `rotate(${escapeWheelRotation}deg)` }}
                  >
                    {[...Array(15)].map((_, i) => (
                      <div
                        key={i}
                        className="escape-tooth"
                        style={{ transform: `rotate(${i * 24}deg)` }}
                      ></div>
                    ))}
                  </div>

                  {/* Pallet fork */}
                  <div 
                    className="pallet-fork"
                    style={{ transform: `rotate(${Math.sin(seconds * Math.PI * 12) * 15}deg)` }}
                  >
                    <div className="pallet-jewel left"></div>
                    <div className="pallet-jewel right"></div>
                  </div>
                </div>
              </div>

              {/* Main gear train */}
              <div className="gear-train">
                {/* Center wheel */}
                <div 
                  className="gear center-wheel"
                  style={{ transform: `rotate(${gearRotation}deg)` }}
                >
                  {[...Array(60)].map((_, i) => (
                    <div
                      key={i}
                      className="gear-tooth"
                      style={{ transform: `rotate(${i * 6}deg)` }}
                    ></div>
                  ))}
                  <div className="gear-jewel"></div>
                </div>

                {/* Third wheel */}
                <div 
                  className="gear third-wheel"
                  style={{ transform: `rotate(${-gearRotation * 1.5}deg)` }}
                >
                  {[...Array(48)].map((_, i) => (
                    <div
                      key={i}
                      className="gear-tooth small"
                      style={{ transform: `rotate(${i * 7.5}deg)` }}
                    ></div>
                  ))}
                  <div className="gear-jewel"></div>
                </div>

                {/* Fourth wheel */}
                <div 
                  className="gear fourth-wheel"
                  style={{ transform: `rotate(${gearRotation * 2}deg)` }}
                >
                  {[...Array(40)].map((_, i) => (
                    <div
                      key={i}
                      className="gear-tooth small"
                      style={{ transform: `rotate(${i * 9}deg)` }}
                    ></div>
                  ))}
                  <div className="gear-jewel"></div>
                </div>
              </div>

              {/* Power reserve indicator */}
              <div className="power-reserve">
                <div className="power-reserve-scale">
                  <div 
                    className="power-reserve-hand"
                    style={{ transform: `rotate(${(powerReserve * 1.8) - 90}deg)` }}
                  ></div>
                </div>
                <div className="power-reserve-label">POWER RESERVE</div>
              </div>

              {/* Barrel with mainspring */}
              <div className="barrel-assembly">
                <div 
                  className="barrel"
                  style={{ transform: `rotate(${isWinding ? gearRotation * 5 : gearRotation * 0.1}deg)` }}
                >
                  <div className="mainspring"></div>
                  <div className="barrel-arbor"></div>
                </div>
              </div>

              {/* Movement bridges with Jamaica colors */}
              <div className="movement-bridges">
                <div className="bridge main-bridge">
                  <div className="bridge-screw"></div>
                  <div className="bridge-screw"></div>
                </div>
                <div className="bridge balance-bridge">
                  <div className="jamaica-green-accent"></div>
                  <div className="bridge-screw"></div>
                </div>
                <div className="bridge gear-bridge">
                  <div className="jamaica-yellow-accent"></div>
                  <div className="bridge-screw"></div>
                </div>
              </div>

              {/* Yohan Blake signature */}
              <div className="signature">
                <div className="yohan-blake">YOHAN BLAKE</div>
                <div className="jamaica-lightning">⚡</div>
              </div>
            </div>

            {/* Hands */}
            <div className="hands">
              <div 
                className="hour-hand"
                style={{ transform: `rotate(${(seconds / 5) * 30}deg)` }}
              >
                <div className="hand-body"></div>
                <div className="hand-tip jamaica-green"></div>
              </div>
              <div 
                className="minute-hand"
                style={{ transform: `rotate(${seconds * 6}deg)` }}
              >
                <div className="hand-body"></div>
                <div className="hand-tip jamaica-yellow"></div>
              </div>
            </div>

            {/* RM branding */}
            <div className="rm-logo">RM</div>
            <div className="model-number">59-01</div>
          </div>
        </div>

        {/* Crown for winding */}
        <div className="crown" onClick={handleWind}>
          <div className="crown-grooves"></div>
          <div className="crown-logo">RM</div>
        </div>

        {/* Case sides with screws */}
        <div className="case-screws">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="case-screw"
              style={{ 
                transform: `rotate(${i * 45}deg) translateY(-165px)`,
              }}
            ></div>
          ))}
        </div>
      </div>

      {/* Green rubber strap */}
      <div className="strap">
        <div className="strap-top"></div>
        <div className="strap-bottom"></div>
        <div className="strap-texture"></div>
      </div>

      {/* Watch info */}
      <div className="watch-info">
        <h3>RICHARD MILLE RM 59-01</h3>
        <p>Yohan Blake Edition</p>
        <p>Tourbillon · Hand-wound · Jamaica</p>
        <div className="power-indicator">
          Power Reserve: {powerReserve.toFixed(0)}%
        </div>
      </div>
    </div>
  );
};

export default YohanBlakeRM5901;