// Power Reserve Hook for Richard Mille Watches

import { useState, useEffect, useRef, useCallback } from 'react';
import { PowerReserveState } from '../types/timing.types';

interface UsePowerReserveProps {
  maxDuration?: number; // Maximum power reserve in hours (default: 48)
  consumptionRate?: number; // Power consumption rate per hour (default: 2.08%)
  windingEfficiency?: number; // Winding efficiency percentage (default: 85%)
  autoWinding?: boolean; // Enable automatic winding simulation
  onLowPower?: (level: number) => void; // Callback when power is low
  onFullyWound?: () => void; // Callback when fully wound
  lowPowerThreshold?: number; // Low power threshold percentage (default: 20%)
}

interface UsePowerReserveReturn {
  state: PowerReserveState;
  wind: (amount?: number) => void; // Manual winding
  autoWind: (activity: number) => void; // Automatic winding based on activity
  pause: () => void; // Pause power consumption
  resume: () => void; // Resume power consumption
  reset: () => void; // Reset to full power
  getIndicatorAngle: () => number; // Get power reserve indicator angle
  getRemainingTimeFormatted: () => string; // Formatted remaining time
  isLowPower: () => boolean;
  isCriticalPower: () => boolean;
}

export const usePowerReserve = ({
  maxDuration = 48, // 48 hours typical for Richard Mille
  consumptionRate = 100 / 48, // 2.08% per hour for 48-hour reserve
  windingEfficiency = 85,
  autoWinding = true,
  onLowPower,
  onFullyWound,
  lowPowerThreshold = 20
}: UsePowerReserveProps = {}): UsePowerReserveReturn => {
  const [state, setState] = useState<PowerReserveState>({
    level: 100,
    maxDuration,
    remainingTime: maxDuration,
    consumptionRate,
    isFullyWound: true,
    windingEfficiency
  });

  const [isPaused, setIsPaused] = useState(false);
  
  const intervalRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(Date.now());
  const activityHistoryRef = useRef<number[]>([]);
  const lowPowerNotifiedRef = useRef<boolean>(false);

  // Update power reserve level
  const updatePowerLevel = useCallback(() => {
    if (isPaused) return;

    const currentTime = Date.now();
    const deltaTime = (currentTime - lastUpdateRef.current) / 1000 / 3600; // Convert to hours
    
    setState(prev => {
      const newLevel = Math.max(0, prev.level - (consumptionRate * deltaTime));
      const remainingTime = (newLevel / 100) * maxDuration;
      const isFullyWound = newLevel >= 99.5;

      // Check for low power notification
      if (newLevel <= lowPowerThreshold && !lowPowerNotifiedRef.current) {
        onLowPower?.(newLevel);
        lowPowerNotifiedRef.current = true;
      } else if (newLevel > lowPowerThreshold) {
        lowPowerNotifiedRef.current = false;
      }

      // Check for fully wound notification
      if (isFullyWound && !prev.isFullyWound) {
        onFullyWound?.();
      }

      return {
        ...prev,
        level: newLevel,
        remainingTime,
        isFullyWound
      };
    });

    lastUpdateRef.current = currentTime;
  }, [isPaused, consumptionRate, maxDuration, lowPowerThreshold, onLowPower, onFullyWound]);

  // Manual winding
  const wind = useCallback((amount: number = 10) => {
    setState(prev => {
      const windingAmount = (amount * windingEfficiency) / 100;
      const newLevel = Math.min(100, prev.level + windingAmount);
      const remainingTime = (newLevel / 100) * maxDuration;
      const isFullyWound = newLevel >= 99.5;

      return {
        ...prev,
        level: newLevel,
        remainingTime,
        isFullyWound
      };
    });
  }, [windingEfficiency, maxDuration]);

  // Automatic winding based on activity
  const autoWind = useCallback((activity: number) => {
    if (!autoWinding) return;

    // Add activity to history
    activityHistoryRef.current.push(activity);
    if (activityHistoryRef.current.length > 60) { // Keep last 60 measurements
      activityHistoryRef.current.shift();
    }

    // Calculate average activity over time
    const avgActivity = activityHistoryRef.current.reduce((sum, a) => sum + a, 0) / 
                       activityHistoryRef.current.length;

    // Convert activity to winding power (0-100% activity -> 0-5% power gain per minute)
    const windingPower = (avgActivity / 100) * 5;
    
    setState(prev => {
      if (prev.isFullyWound) return prev;

      const windingAmount = (windingPower * windingEfficiency) / 100;
      const newLevel = Math.min(100, prev.level + windingAmount);
      const remainingTime = (newLevel / 100) * maxDuration;
      const isFullyWound = newLevel >= 99.5;

      return {
        ...prev,
        level: newLevel,
        remainingTime,
        isFullyWound
      };
    });
  }, [autoWinding, windingEfficiency, maxDuration]);

  // Pause power consumption
  const pause = useCallback(() => {
    setIsPaused(true);
  }, []);

  // Resume power consumption
  const resume = useCallback(() => {
    setIsPaused(false);
    lastUpdateRef.current = Date.now();
  }, []);

  // Reset to full power
  const reset = useCallback(() => {
    setState(prev => ({
      ...prev,
      level: 100,
      remainingTime: maxDuration,
      isFullyWound: true
    }));
    
    lowPowerNotifiedRef.current = false;
    lastUpdateRef.current = Date.now();
  }, [maxDuration]);

  // Get power reserve indicator angle (0-270 degrees)
  const getIndicatorAngle = useCallback((): number => {
    // Most power reserve indicators show 0-270 degrees
    return (state.level / 100) * 270;
  }, [state.level]);

  // Get formatted remaining time
  const getRemainingTimeFormatted = useCallback((): string => {
    const hours = Math.floor(state.remainingTime);
    const minutes = Math.floor((state.remainingTime - hours) * 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  }, [state.remainingTime]);

  // Check if power is low
  const isLowPower = useCallback((): boolean => {
    return state.level <= lowPowerThreshold;
  }, [state.level, lowPowerThreshold]);

  // Check if power is critically low
  const isCriticalPower = useCallback((): boolean => {
    return state.level <= 5;
  }, [state.level]);

  // Start power consumption timer
  useEffect(() => {
    intervalRef.current = setInterval(updatePowerLevel, 1000); // Update every second

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [updatePowerLevel]);

  // Simulate automatic winding based on device motion (if available)
  useEffect(() => {
    if (!autoWinding || typeof DeviceMotionEvent === 'undefined') return;

    let lastMotionTime = 0;
    const motionThreshold = 2; // Minimum acceleration to trigger winding

    const handleDeviceMotion = (event: DeviceMotionEvent) => {
      const acceleration = event.accelerationIncludingGravity;
      if (!acceleration) return;

      const totalAcceleration = Math.sqrt(
        (acceleration.x || 0) ** 2 +
        (acceleration.y || 0) ** 2 +
        (acceleration.z || 0) ** 2
      );

      if (totalAcceleration > motionThreshold) {
        const currentTime = Date.now();
        if (currentTime - lastMotionTime > 1000) { // Throttle to once per second
          const activity = Math.min(100, totalAcceleration * 5); // Scale activity
          autoWind(activity);
          lastMotionTime = currentTime;
        }
      }
    };

    // Request permission for device motion (iOS 13+)
    const requestPermission = async () => {
      if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
        const permission = await (DeviceMotionEvent as any).requestPermission();
        if (permission === 'granted') {
          window.addEventListener('devicemotion', handleDeviceMotion);
        }
      } else {
        // Android or older iOS
        window.addEventListener('devicemotion', handleDeviceMotion);
      }
    };

    requestPermission();

    return () => {
      window.removeEventListener('devicemotion', handleDeviceMotion);
    };
  }, [autoWinding, autoWind]);

  // Simulate activity when no motion API is available
  useEffect(() => {
    if (!autoWinding || typeof DeviceMotionEvent !== 'undefined') return;

    // Simulate random activity for demonstration
    const activityInterval = setInterval(() => {
      const simulatedActivity = Math.random() * 20; // 0-20% activity
      autoWind(simulatedActivity);
    }, 10000); // Every 10 seconds

    return () => clearInterval(activityInterval);
  }, [autoWinding, autoWind]);

  // Handle page visibility for power consumption
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Continue running in background but reduce update frequency
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = setInterval(updatePowerLevel, 10000); // Update every 10 seconds
        }
      } else {
        // Resume normal update frequency
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = setInterval(updatePowerLevel, 1000); // Update every second
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [updatePowerLevel]);

  // Store power reserve state in localStorage for persistence
  useEffect(() => {
    const storeState = () => {
      const stateToStore = {
        ...state,
        timestamp: Date.now()
      };
      localStorage.setItem('rm-power-reserve', JSON.stringify(stateToStore));
    };

    const storeInterval = setInterval(storeState, 5000); // Store every 5 seconds
    
    return () => clearInterval(storeInterval);
  }, [state]);

  // Load power reserve state from localStorage on mount
  useEffect(() => {
    const loadState = () => {
      try {
        const stored = localStorage.getItem('rm-power-reserve');
        if (stored) {
          const parsedState = JSON.parse(stored);
          const timeDiff = (Date.now() - parsedState.timestamp) / 1000 / 3600; // Hours
          const powerLoss = timeDiff * consumptionRate;
          const adjustedLevel = Math.max(0, parsedState.level - powerLoss);

          setState(prev => ({
            ...prev,
            level: adjustedLevel,
            remainingTime: (adjustedLevel / 100) * maxDuration,
            isFullyWound: adjustedLevel >= 99.5
          }));
        }
      } catch (error) {
        console.warn('Failed to load power reserve state:', error);
      }
    };

    loadState();
  }, [consumptionRate, maxDuration]);

  return {
    state,
    wind,
    autoWind,
    pause,
    resume,
    reset,
    getIndicatorAngle,
    getRemainingTimeFormatted,
    isLowPower,
    isCriticalPower
  };
};