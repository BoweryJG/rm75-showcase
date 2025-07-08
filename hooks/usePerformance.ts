'use client';

import { useState, useEffect, useCallback } from 'react';
import { PerformanceMetrics } from '@/types/watch';
import { performanceMonitor, optimizeForDevice, getOptimalSettings } from '@/lib/performance';

export function usePerformance() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 0,
    renderTime: 0,
    memoryUsage: 0,
    triangleCount: 0,
    textureMemory: 0,
    shaderCompileTime: 0,
  });

  const [performanceMode, setPerformanceMode] = useState<'high' | 'medium' | 'low'>('medium');
  const [autoOptimize, setAutoOptimize] = useState(true);

  const updateMetrics = useCallback((newMetrics: PerformanceMetrics) => {
    setMetrics(newMetrics);

    // Auto-optimize performance if enabled
    if (autoOptimize) {
      if (newMetrics.fps < 30 && performanceMode !== 'low') {
        setPerformanceMode(current => current === 'high' ? 'medium' : 'low');
      } else if (newMetrics.fps > 55 && performanceMode !== 'high') {
        setPerformanceMode(current => current === 'low' ? 'medium' : 'high');
      }
    }
  }, [autoOptimize, performanceMode]);

  useEffect(() => {
    // Initialize performance mode based on device capabilities
    const deviceMode = optimizeForDevice();
    setPerformanceMode(deviceMode as 'high' | 'medium' | 'low');

    // Subscribe to performance updates
    performanceMonitor.addCallback(updateMetrics);

    return () => {
      performanceMonitor.removeCallback(updateMetrics);
    };
  }, [updateMetrics]);

  const getSettings = useCallback(() => {
    return getOptimalSettings(performanceMode);
  }, [performanceMode]);

  const updateRenderTime = useCallback((time: number) => {
    performanceMonitor.updateRenderTime(time);
  }, []);

  const updateTriangleCount = useCallback((count: number) => {
    performanceMonitor.updateTriangleCount(count);
  }, []);

  const updateTextureMemory = useCallback((memory: number) => {
    performanceMonitor.updateTextureMemory(memory);
  }, []);

  const updateShaderCompileTime = useCallback((time: number) => {
    performanceMonitor.updateShaderCompileTime(time);
  }, []);

  return {
    metrics,
    performanceMode,
    setPerformanceMode,
    autoOptimize,
    setAutoOptimize,
    getSettings,
    updateRenderTime,
    updateTriangleCount,
    updateTextureMemory,
    updateShaderCompileTime,
  };
}