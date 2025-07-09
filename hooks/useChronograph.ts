// Chronograph Hook for Richard Mille Watches

import { useState, useEffect, useRef, useCallback } from 'react';
import { ChronographState, HandPosition } from '../types/timing.types';

interface UseChronographProps {
  precision?: number; // Millisecond precision
  onLapTime?: (lapTime: number, totalTime: number) => void;
  onSplit?: (splitTime: number) => void;
  maxLaps?: number;
}

interface UseChronographReturn {
  state: ChronographState;
  handPositions: HandPosition;
  start: () => void;
  stop: () => void;
  reset: () => void;
  lap: () => void;
  split: () => void;
  clearSplit: () => void;
  formatTime: (time: number) => string;
  getBestLap: () => number | null;
  getAverageLap: () => number | null;
}

export const useChronograph = ({
  precision = 10, // 10ms precision by default
  onLapTime,
  onSplit,
  maxLaps = 99
}: UseChronographProps = {}): UseChronographReturn => {
  const [state, setState] = useState<ChronographState>({
    isRunning: false,
    startTime: null,
    elapsedTime: 0,
    lapTimes: [],
    splitTime: null,
    precision
  });

  const [handPositions, setHandPositions] = useState<HandPosition>({
    hourAngle: 0,
    minuteAngle: 0,
    secondAngle: 0,
    millisecondAngle: 0,
    chronoMinuteAngle: 0,
    chronoSecondAngle: 0,
    precision: 1000
  });

  const intervalRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);

  // High-precision timing update
  const updateChronograph = useCallback(() => {
    if (!state.isRunning || !state.startTime) return;

    const currentTime = performance.now();
    const elapsedTime = currentTime - state.startTime;

    setState(prev => ({
      ...prev,
      elapsedTime
    }));

    // Calculate chronograph hand positions
    const totalSeconds = elapsedTime / 1000;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const centiseconds = (elapsedTime % 1000) / 10;

    // Convert to angles
    const chronoSecondAngle = (seconds % 60) * 6; // 6 degrees per second
    const chronoMinuteAngle = (minutes % 30) * 12; // 12 degrees per minute for 30-minute counter
    const chronoCentisecondAngle = centiseconds * 3.6; // 3.6 degrees per centisecond

    setHandPositions(prev => ({
      ...prev,
      chronoSecondAngle,
      chronoMinuteAngle,
      millisecondAngle: chronoCentisecondAngle
    }));

    lastUpdateRef.current = currentTime;
    animationFrameRef.current = requestAnimationFrame(updateChronograph);
  }, [state.isRunning, state.startTime]);

  // Start chronograph
  const start = useCallback(() => {
    const currentTime = performance.now();
    
    setState(prev => {
      if (prev.isRunning) return prev;
      
      return {
        ...prev,
        isRunning: true,
        startTime: currentTime - prev.elapsedTime
      };
    });
  }, []);

  // Stop chronograph
  const stop = useCallback(() => {
    setState(prev => ({
      ...prev,
      isRunning: false
    }));

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  // Reset chronograph
  const reset = useCallback(() => {
    setState(prev => ({
      ...prev,
      isRunning: false,
      startTime: null,
      elapsedTime: 0,
      lapTimes: [],
      splitTime: null
    }));

    setHandPositions(prev => ({
      ...prev,
      chronoSecondAngle: 0,
      chronoMinuteAngle: 0,
      millisecondAngle: 0
    }));

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  // Record lap time
  const lap = useCallback(() => {
    if (!state.isRunning || state.lapTimes.length >= maxLaps) return;

    const currentTime = state.elapsedTime;
    const lastLapTime = state.lapTimes.length > 0 
      ? state.lapTimes[state.lapTimes.length - 1] 
      : 0;
    const lapTime = currentTime - lastLapTime;

    setState(prev => ({
      ...prev,
      lapTimes: [...prev.lapTimes, currentTime]
    }));

    onLapTime?.(lapTime, currentTime);
  }, [state.isRunning, state.elapsedTime, state.lapTimes, maxLaps, onLapTime]);

  // Record split time
  const split = useCallback(() => {
    if (!state.isRunning) return;

    const splitTime = state.elapsedTime;
    setState(prev => ({
      ...prev,
      splitTime
    }));

    onSplit?.(splitTime);
  }, [state.isRunning, state.elapsedTime, onSplit]);

  // Clear split time
  const clearSplit = useCallback(() => {
    setState(prev => ({
      ...prev,
      splitTime: null
    }));
  }, []);

  // Format time for display
  const formatTime = useCallback((time: number): string => {
    const totalCentiseconds = Math.floor(time / 10);
    const centiseconds = totalCentiseconds % 100;
    const totalSeconds = Math.floor(totalCentiseconds / 100);
    const seconds = totalSeconds % 60;
    const minutes = Math.floor(totalSeconds / 60);

    const formatNumber = (num: number, digits: number = 2) => 
      num.toString().padStart(digits, '0');

    if (minutes > 0) {
      return `${formatNumber(minutes)}:${formatNumber(seconds)}.${formatNumber(centiseconds)}`;
    } else {
      return `${formatNumber(seconds)}.${formatNumber(centiseconds)}`;
    }
  }, []);

  // Get best lap time
  const getBestLap = useCallback((): number | null => {
    if (state.lapTimes.length < 2) return null;

    let bestLap = Infinity;
    for (let i = 1; i < state.lapTimes.length; i++) {
      const lapTime = state.lapTimes[i] - state.lapTimes[i - 1];
      if (lapTime < bestLap) {
        bestLap = lapTime;
      }
    }

    // Include the first lap (from start to first lap)
    if (state.lapTimes.length > 0) {
      const firstLap = state.lapTimes[0];
      if (firstLap < bestLap) {
        bestLap = firstLap;
      }
    }

    return bestLap === Infinity ? null : bestLap;
  }, [state.lapTimes]);

  // Get average lap time
  const getAverageLap = useCallback((): number | null => {
    if (state.lapTimes.length === 0) return null;

    const totalTime = state.lapTimes[state.lapTimes.length - 1];
    const lapCount = state.lapTimes.length;
    
    return totalTime / lapCount;
  }, [state.lapTimes]);

  // Start animation loop when running
  useEffect(() => {
    if (state.isRunning) {
      animationFrameRef.current = requestAnimationFrame(updateChronograph);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [state.isRunning, updateChronograph]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.target && (event.target as HTMLElement).tagName === 'INPUT') {
        return; // Don't trigger when typing in input fields
      }

      switch (event.code) {
        case 'Space':
          event.preventDefault();
          if (state.isRunning) {
            stop();
          } else {
            start();
          }
          break;
        case 'KeyR':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            reset();
          }
          break;
        case 'KeyL':
          if (state.isRunning) {
            lap();
          }
          break;
        case 'KeyS':
          if (state.isRunning) {
            split();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [state.isRunning, start, stop, reset, lap, split]);

  // Performance optimization for background tabs
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && state.isRunning) {
        // Continue timing but stop visual updates
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      } else if (!document.hidden && state.isRunning) {
        // Resume visual updates
        animationFrameRef.current = requestAnimationFrame(updateChronograph);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [state.isRunning, updateChronograph]);

  return {
    state,
    handPositions,
    start,
    stop,
    reset,
    lap,
    split,
    clearSplit,
    formatTime,
    getBestLap,
    getAverageLap
  };
};