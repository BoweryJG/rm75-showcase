// Watch Timing Hook for Richard Mille Watches

import { useState, useEffect, useRef, useCallback } from 'react';
import { WatchTiming, HandPosition, TimingHookConfig, WatchModel } from '../types/timing.types';
import { MechanicalAccuracySimulator } from '../lib/mechanicalAccuracy';
import { TimeSyncManager } from '../lib/timeSync';
import { PerformanceMonitor } from '../lib/performanceMonitor';

interface UseWatchTimingProps {
  model: WatchModel;
  config?: Partial<TimingHookConfig>;
  supabaseUrl?: string;
  supabaseKey?: string;
}

interface UseWatchTimingReturn {
  timing: WatchTiming;
  handPositions: HandPosition;
  isRunning: boolean;
  accuracy: number;
  sync: any;
  performance: any;
  start: () => void;
  stop: () => void;
  reset: () => void;
  calibrate: () => void;
}

export const useWatchTiming = ({
  model,
  config = {},
  supabaseUrl,
  supabaseKey
}: UseWatchTimingProps): UseWatchTimingReturn => {
  const [timing, setTiming] = useState<WatchTiming>({
    currentTime: Date.now(),
    beatFrequency: model.beatFrequency || 6,
    precision: 1000,
    escapementVariation: 0,
    powerReserve: 100,
    springTension: 1,
    timezoneOffset: new Date().getTimezoneOffset() * 60000
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

  const [isRunning, setIsRunning] = useState(false);
  const [accuracy, setAccuracy] = useState(0);

  // Configuration with defaults
  const finalConfig: TimingHookConfig = {
    highPrecision: true,
    mechanicalSimulation: true,
    realTimeSync: true,
    performanceMonitoring: true,
    adaptiveQuality: true,
    backgroundOptimization: true,
    targetFps: 60,
    performanceBudget: 16.67,
    ...config
  };

  // Managers and simulators
  const mechanicalSimulatorRef = useRef<MechanicalAccuracySimulator | null>(null);
  const timeSyncManagerRef = useRef<TimeSyncManager | null>(null);
  const performanceMonitorRef = useRef<PerformanceMonitor | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastUpdateTimeRef = useRef(0);
  const beatCounterRef = useRef(0);

  // Initialize managers
  useEffect(() => {
    if (finalConfig.mechanicalSimulation) {
      mechanicalSimulatorRef.current = new MechanicalAccuracySimulator(model);
    }

    if (finalConfig.realTimeSync && supabaseUrl && supabaseKey) {
      timeSyncManagerRef.current = new TimeSyncManager(supabaseUrl, supabaseKey);
    }

    if (finalConfig.performanceMonitoring) {
      performanceMonitorRef.current = new PerformanceMonitor();
    }

    return () => {
      // Cleanup
      timeSyncManagerRef.current?.destroy();
      performanceMonitorRef.current?.destroy();
    };
  }, [model, finalConfig, supabaseUrl, supabaseKey]);

  // Main timing loop
  const updateTiming = useCallback(() => {
    if (!isRunning) return;

    const currentTime = getCurrentTime();
    const performanceMonitor = performanceMonitorRef.current;
    const mechanicalSimulator = mechanicalSimulatorRef.current;

    // Performance monitoring
    if (performanceMonitor) {
      performanceMonitor.createPerformanceMark('timing-update-start');
    }

    // Check if we should skip this frame for performance
    if (performanceMonitor?.shouldSkipFrame()) {
      animationFrameRef.current = requestAnimationFrame(updateTiming);
      return;
    }

    // Calculate mechanical accuracy and variations
    let escapementVariation = 0;
    let mechanicalAccuracy = null;

    if (mechanicalSimulator && finalConfig.mechanicalSimulation) {
      mechanicalAccuracy = mechanicalSimulator.calculateMechanicalAccuracy();
      const variations = mechanicalSimulator.calculateEscapementVariations();
      escapementVariation = variations.timingVariation;
      
      // Simulate beat
      mechanicalSimulator.simulateBeat();
      beatCounterRef.current = mechanicalSimulator.getBeatCount();
    }

    // Calculate power reserve
    const powerReserve = calculatePowerReserve(currentTime);
    const springTension = calculateSpringTension(powerReserve);

    // Update timing state
    const newTiming: WatchTiming = {
      currentTime,
      beatFrequency: timing.beatFrequency,
      precision: mechanicalSimulator?.getSubPixelPrecision() || 1000,
      escapementVariation,
      powerReserve,
      springTension,
      timezoneOffset: timing.timezoneOffset
    };

    setTiming(newTiming);

    // Calculate hand positions with sub-pixel precision
    const newHandPositions = calculateHandPositions(currentTime, newTiming);
    setHandPositions(newHandPositions);

    // Update accuracy based on sync status
    if (timeSyncManagerRef.current) {
      const syncState = timeSyncManagerRef.current.getSyncState();
      setAccuracy(syncState.accuracy);
    }

    // Performance monitoring
    if (performanceMonitor) {
      performanceMonitor.createPerformanceMark('timing-update-end');
      performanceMonitor.measurePerformance(
        'timing-update',
        'timing-update-start',
        'timing-update-end'
      );
    }

    // Schedule next update
    lastUpdateTimeRef.current = currentTime;
    animationFrameRef.current = requestAnimationFrame(updateTiming);
  }, [isRunning, timing, finalConfig]);

  // Get current time with sync correction
  const getCurrentTime = useCallback((): number => {
    if (timeSyncManagerRef.current && finalConfig.realTimeSync) {
      return timeSyncManagerRef.current.getCurrentTime();
    }
    return Date.now();
  }, [finalConfig.realTimeSync]);

  // Calculate power reserve based on time since last winding
  const calculatePowerReserve = useCallback((currentTime: number): number => {
    const timeSinceWinding = (currentTime % (model.powerReserve * 3600000)) / 3600000;
    return Math.max(0, 100 - (timeSinceWinding / model.powerReserve) * 100);
  }, [model.powerReserve]);

  // Calculate spring tension based on power reserve
  const calculateSpringTension = useCallback((powerReserve: number): number => {
    return Math.max(0.1, powerReserve / 100);
  }, []);

  // Calculate hand positions with mechanical accuracy
  const calculateHandPositions = useCallback((
    currentTime: number,
    timingState: WatchTiming
  ): HandPosition => {
    const date = new Date(currentTime);
    const hours = date.getHours() % 12;
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    const milliseconds = date.getMilliseconds();

    // Apply mechanical variations
    const mechanicalSimulator = mechanicalSimulatorRef.current;
    let secondsWithVariation = seconds;
    let millisecondsWithVariation = milliseconds;

    if (mechanicalSimulator && finalConfig.mechanicalSimulation) {
      const handPos = mechanicalSimulator.calculateHandPosition(currentTime);
      secondsWithVariation = (handPos.angle / 6) % 60; // 6 degrees per second
      millisecondsWithVariation = (handPos.subPixel * 1000) % 1000;
    }

    // Calculate angles with sub-pixel precision
    const hourAngle = (hours * 30) + (minutes * 0.5) + (seconds * 0.008333);
    const minuteAngle = (minutes * 6) + (seconds * 0.1) + (milliseconds * 0.0001);
    const secondAngle = (secondsWithVariation * 6) + (millisecondsWithVariation * 0.006);
    const millisecondAngle = millisecondsWithVariation * 0.36;

    return {
      hourAngle,
      minuteAngle,
      secondAngle,
      millisecondAngle,
      chronoMinuteAngle: 0,
      chronoSecondAngle: 0,
      precision: timingState.precision
    };
  }, [finalConfig.mechanicalSimulation]);

  // Start timing
  const start = useCallback(() => {
    if (!isRunning) {
      setIsRunning(true);
      lastUpdateTimeRef.current = getCurrentTime();
    }
  }, [isRunning, getCurrentTime]);

  // Stop timing
  const stop = useCallback(() => {
    if (isRunning) {
      setIsRunning(false);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    }
  }, [isRunning]);

  // Reset timing
  const reset = useCallback(() => {
    stop();
    mechanicalSimulatorRef.current?.reset();
    beatCounterRef.current = 0;
    
    setTiming(prev => ({
      ...prev,
      currentTime: getCurrentTime(),
      powerReserve: 100,
      springTension: 1
    }));
    
    setHandPositions({
      hourAngle: 0,
      minuteAngle: 0,
      secondAngle: 0,
      millisecondAngle: 0,
      chronoMinuteAngle: 0,
      chronoSecondAngle: 0,
      precision: 1000
    });
  }, [stop, getCurrentTime]);

  // Calibrate timing
  const calibrate = useCallback(async () => {
    if (timeSyncManagerRef.current) {
      await timeSyncManagerRef.current.performSync();
    }
    
    if (mechanicalSimulatorRef.current) {
      mechanicalSimulatorRef.current.reset();
    }
  }, []);

  // Start timing loop when running
  useEffect(() => {
    if (isRunning) {
      animationFrameRef.current = requestAnimationFrame(updateTiming);
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isRunning, updateTiming]);

  // Background optimization
  useEffect(() => {
    if (!finalConfig.backgroundOptimization) return;

    const handleVisibilityChange = () => {
      if (document.hidden && isRunning) {
        // Pause or slow down updates when not visible
        stop();
      } else if (!document.hidden && !isRunning) {
        // Resume when visible
        start();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [finalConfig.backgroundOptimization, isRunning, start, stop]);

  return {
    timing,
    handPositions,
    isRunning,
    accuracy,
    sync: timeSyncManagerRef.current?.getSyncState(),
    performance: performanceMonitorRef.current?.getMetrics(),
    start,
    stop,
    reset,
    calibrate
  };
};