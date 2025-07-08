// Tourbillon Hook for Richard Mille Watches

import { useState, useEffect, useRef, useCallback } from 'react';
import { TourbillonState } from '../types/timing.types';

interface UseTourbillonProps {
  rotationPeriod?: number; // Rotation period in seconds (default: 60)
  direction?: 1 | -1; // Rotation direction (1 = clockwise, -1 = counterclockwise)
  enabled?: boolean; // Enable/disable tourbillon animation
  onComplete?: () => void; // Callback when rotation completes
  precision?: number; // Animation precision in milliseconds
}

interface UseTourbillonReturn {
  state: TourbillonState;
  start: () => void;
  stop: () => void;
  reset: () => void;
  setDirection: (direction: 1 | -1) => void;
  setRotationPeriod: (period: number) => void;
  getRotationMatrix: () => string; // CSS transform matrix
  getRotationAngleRadians: () => number;
  isCompleting: boolean;
}

export const useTourbillon = ({
  rotationPeriod = 60, // 60 seconds for full rotation
  direction = 1,
  enabled = true,
  onComplete,
  precision = 16.67 // ~60fps
}: UseTourbillonProps = {}): UseTourbillonReturn => {
  const [state, setState] = useState<TourbillonState>({
    angle: 0,
    speed: 360 / rotationPeriod, // degrees per second
    direction,
    completion: 0,
    rotationPeriod
  });

  const [isCompleting, setIsCompleting] = useState(false);
  
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const lastAngleRef = useRef<number>(0);
  const completionCountRef = useRef<number>(0);

  // Calculate current angle based on time
  const calculateAngle = useCallback((currentTime: number): number => {
    if (!startTimeRef.current) {
      startTimeRef.current = currentTime;
      return state.angle;
    }

    const elapsedTime = (currentTime - startTimeRef.current) / 1000; // Convert to seconds
    const totalRotation = (state.speed * elapsedTime * state.direction) % 360;
    
    // Ensure angle is always positive
    return (state.angle + totalRotation + 360) % 360;
  }, [state.angle, state.speed, state.direction]);

  // Animation loop
  const animate = useCallback(() => {
    if (!enabled) return;

    const currentTime = performance.now();
    const newAngle = calculateAngle(currentTime);
    const completion = (newAngle / 360) * 100;

    // Check for rotation completion
    const previousCompletion = (lastAngleRef.current / 360) * 100;
    const hasCompleted = state.direction > 0 
      ? (newAngle < lastAngleRef.current && lastAngleRef.current > 350)
      : (newAngle > lastAngleRef.current && lastAngleRef.current < 10);

    if (hasCompleted) {
      completionCountRef.current++;
      setIsCompleting(true);
      onComplete?.();
      
      // Reset completing flag after a brief moment
      setTimeout(() => setIsCompleting(false), 100);
    }

    setState(prev => ({
      ...prev,
      angle: newAngle,
      completion
    }));

    lastAngleRef.current = newAngle;
    animationFrameRef.current = requestAnimationFrame(animate);
  }, [enabled, calculateAngle, state.direction, onComplete]);

  // Start tourbillon animation
  const start = useCallback(() => {
    if (!enabled) return;
    
    startTimeRef.current = performance.now();
    animationFrameRef.current = requestAnimationFrame(animate);
  }, [enabled, animate]);

  // Stop tourbillon animation
  const stop = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  // Reset tourbillon to initial position
  const reset = useCallback(() => {
    stop();
    
    setState(prev => ({
      ...prev,
      angle: 0,
      completion: 0
    }));
    
    startTimeRef.current = null;
    lastAngleRef.current = 0;
    completionCountRef.current = 0;
    setIsCompleting(false);
  }, [stop]);

  // Set rotation direction
  const setDirection = useCallback((newDirection: 1 | -1) => {
    setState(prev => ({
      ...prev,
      direction: newDirection
    }));
  }, []);

  // Set rotation period
  const setRotationPeriod = useCallback((period: number) => {
    const newSpeed = 360 / period;
    
    setState(prev => ({
      ...prev,
      rotationPeriod: period,
      speed: newSpeed
    }));
  }, []);

  // Get CSS transform matrix for rotation
  const getRotationMatrix = useCallback((): string => {
    const radians = (state.angle * Math.PI) / 180;
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);
    
    return `matrix(${cos}, ${sin}, ${-sin}, ${cos}, 0, 0)`;
  }, [state.angle]);

  // Get rotation angle in radians
  const getRotationAngleRadians = useCallback((): number => {
    return (state.angle * Math.PI) / 180;
  }, [state.angle]);

  // Start animation when component mounts or when enabled changes
  useEffect(() => {
    if (enabled) {
      start();
    } else {
      stop();
    }

    return () => stop();
  }, [enabled, start, stop]);

  // Update speed when rotation period changes
  useEffect(() => {
    setState(prev => ({
      ...prev,
      speed: 360 / rotationPeriod,
      rotationPeriod
    }));
  }, [rotationPeriod]);

  // Update direction when it changes
  useEffect(() => {
    setState(prev => ({
      ...prev,
      direction
    }));
  }, [direction]);

  // Performance optimization for background tabs
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stop();
      } else if (enabled) {
        start();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [enabled, start, stop]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return {
    state,
    start,
    stop,
    reset,
    setDirection,
    setRotationPeriod,
    getRotationMatrix,
    getRotationAngleRadians,
    isCompleting
  };
};