// Performance Monitoring System for Richard Mille Watches

import { PerformanceMetrics, AdaptiveQuality } from '../types/timing.types';

export class PerformanceMonitor {
  private metrics: PerformanceMetrics;
  private adaptiveQuality: AdaptiveQuality;
  private frameTimeHistory: number[] = [];
  private lastFrameTime = 0;
  private monitoringInterval: number | null = null;
  private performanceObserver: PerformanceObserver | null = null;
  private batteryManager: any = null;
  private visibilityState = 'visible';
  private thermalThrottleDetected = false;

  constructor() {
    this.metrics = {
      fps: 60,
      frameTime: 16.67,
      cpuUsage: 0,
      gpuUsage: 0,
      memoryUsage: 0,
      batteryLevel: 100,
      isCharging: false,
      thermalThrottling: false,
      performanceLevel: 5
    };

    this.adaptiveQuality = {
      qualityLevel: 5,
      targetFps: 60,
      adaptiveScaling: true,
      lowBatteryMode: false,
      backgroundMode: false,
      isVisible: true,
      performanceBudget: 16.67 // 60fps = 16.67ms per frame
    };

    this.initializeMonitoring();
  }

  private async initializeMonitoring(): Promise<void> {
    // Initialize frame rate monitoring
    this.initializeFrameRateMonitoring();
    
    // Initialize performance observer
    this.initializePerformanceObserver();
    
    // Initialize battery monitoring
    await this.initializeBatteryMonitoring();
    
    // Initialize visibility monitoring
    this.initializeVisibilityMonitoring();
    
    // Initialize thermal monitoring
    this.initializeThermalMonitoring();
    
    // Start continuous monitoring
    this.startContinuousMonitoring();
  }

  private initializeFrameRateMonitoring(): void {
    let frameCount = 0;
    let lastTime = performance.now();

    const measureFrameRate = (currentTime: number) => {
      frameCount++;
      const deltaTime = currentTime - this.lastFrameTime;
      
      if (deltaTime > 0) {
        this.frameTimeHistory.push(deltaTime);
        if (this.frameTimeHistory.length > 60) {
          this.frameTimeHistory.shift();
        }
      }

      this.lastFrameTime = currentTime;

      // Calculate FPS every second
      if (currentTime - lastTime >= 1000) {
        this.metrics.fps = frameCount;
        this.metrics.frameTime = this.calculateAverageFrameTime();
        
        frameCount = 0;
        lastTime = currentTime;
        
        // Check for performance issues
        this.detectPerformanceIssues();
      }

      requestAnimationFrame(measureFrameRate);
    };

    requestAnimationFrame(measureFrameRate);
  }

  private calculateAverageFrameTime(): number {
    if (this.frameTimeHistory.length === 0) return 16.67;
    
    const sum = this.frameTimeHistory.reduce((a, b) => a + b, 0);
    return sum / this.frameTimeHistory.length;
  }

  private initializePerformanceObserver(): void {
    if ('PerformanceObserver' in window) {
      try {
        this.performanceObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          
          for (const entry of entries) {
            if (entry.entryType === 'measure') {
              // Custom performance measurements
              this.processPerformanceEntry(entry);
            } else if (entry.entryType === 'paint') {
              // Paint timing
              this.processPaintTiming(entry);
            }
          }
        });

        this.performanceObserver.observe({ 
          entryTypes: ['measure', 'paint', 'navigation'] 
        });
      } catch (error) {
        console.warn('Performance Observer not supported:', error);
      }
    }
  }

  private processPerformanceEntry(entry: PerformanceEntry): void {
    // Process custom performance measurements
    if (entry.name.includes('cpu')) {
      this.metrics.cpuUsage = Math.min(100, entry.duration / 10);
    }
  }

  private processPaintTiming(entry: PerformanceEntry): void {
    // Process paint timing for optimization
    if (entry.duration > 50) {
      this.thermalThrottleDetected = true;
    }
  }

  private async initializeBatteryMonitoring(): Promise<void> {
    try {
      // @ts-ignore - Battery API
      if ('getBattery' in navigator) {
        // @ts-ignore
        this.batteryManager = await navigator.getBattery();
        
        this.updateBatteryMetrics();
        
        this.batteryManager.addEventListener('chargingchange', () => {
          this.updateBatteryMetrics();
        });
        
        this.batteryManager.addEventListener('levelchange', () => {
          this.updateBatteryMetrics();
          this.checkLowBatteryMode();
        });
      }
    } catch (error) {
      console.warn('Battery API not supported:', error);
    }
  }

  private updateBatteryMetrics(): void {
    if (this.batteryManager) {
      this.metrics.batteryLevel = Math.round(this.batteryManager.level * 100);
      this.metrics.isCharging = this.batteryManager.charging;
    }
  }

  private checkLowBatteryMode(): void {
    const lowBatteryThreshold = 20;
    const wasLowBattery = this.adaptiveQuality.lowBatteryMode;
    
    this.adaptiveQuality.lowBatteryMode = this.metrics.batteryLevel <= lowBatteryThreshold;
    
    if (this.adaptiveQuality.lowBatteryMode && !wasLowBattery) {
      this.activateLowBatteryMode();
    } else if (!this.adaptiveQuality.lowBatteryMode && wasLowBattery) {
      this.deactivateLowBatteryMode();
    }
  }

  private activateLowBatteryMode(): void {
    this.adaptiveQuality.qualityLevel = Math.min(2, this.adaptiveQuality.qualityLevel);
    this.adaptiveQuality.targetFps = 30;
    this.adaptiveQuality.performanceBudget = 33.33; // 30fps
  }

  private deactivateLowBatteryMode(): void {
    this.adaptiveQuality.qualityLevel = 5;
    this.adaptiveQuality.targetFps = 60;
    this.adaptiveQuality.performanceBudget = 16.67; // 60fps
  }

  private initializeVisibilityMonitoring(): void {
    document.addEventListener('visibilitychange', () => {
      this.visibilityState = document.visibilityState;
      this.adaptiveQuality.isVisible = this.visibilityState === 'visible';
      
      if (this.visibilityState === 'hidden') {
        this.activateBackgroundMode();
      } else {
        this.deactivateBackgroundMode();
      }
    });

    // Page Focus API
    window.addEventListener('focus', () => {
      this.deactivateBackgroundMode();
    });

    window.addEventListener('blur', () => {
      this.activateBackgroundMode();
    });
  }

  private activateBackgroundMode(): void {
    this.adaptiveQuality.backgroundMode = true;
    this.adaptiveQuality.qualityLevel = 1;
    this.adaptiveQuality.targetFps = 1; // Minimal updates
  }

  private deactivateBackgroundMode(): void {
    this.adaptiveQuality.backgroundMode = false;
    this.restoreQualityLevel();
  }

  private restoreQualityLevel(): void {
    if (this.adaptiveQuality.lowBatteryMode) {
      this.activateLowBatteryMode();
    } else {
      this.adaptiveQuality.qualityLevel = 5;
      this.adaptiveQuality.targetFps = 60;
    }
  }

  private initializeThermalMonitoring(): void {
    // Monitor for thermal throttling indicators
    let frameTimeSpikes = 0;
    
    setInterval(() => {
      const averageFrameTime = this.calculateAverageFrameTime();
      
      if (averageFrameTime > 25) { // More than 25ms indicates issues
        frameTimeSpikes++;
      } else {
        frameTimeSpikes = Math.max(0, frameTimeSpikes - 1);
      }

      // Detect thermal throttling
      this.metrics.thermalThrottling = frameTimeSpikes > 5;
      
      if (this.metrics.thermalThrottling) {
        this.activateThermalProtection();
      }
    }, 1000);
  }

  private activateThermalProtection(): void {
    this.adaptiveQuality.qualityLevel = Math.min(2, this.adaptiveQuality.qualityLevel);
    this.adaptiveQuality.targetFps = 30;
    this.adaptiveQuality.performanceBudget = 33.33;
  }

  private startContinuousMonitoring(): void {
    this.monitoringInterval = setInterval(() => {
      this.updateMemoryMetrics();
      this.updateCPUMetrics();
      this.updatePerformanceLevel();
      this.adaptQuality();
    }, 1000);
  }

  private updateMemoryMetrics(): void {
    // @ts-ignore - Memory API
    if ('memory' in performance) {
      // @ts-ignore
      const memInfo = performance.memory;
      this.metrics.memoryUsage = Math.round(memInfo.usedJSHeapSize / 1024 / 1024);
    }
  }

  private updateCPUMetrics(): void {
    // Estimate CPU usage based on frame timing
    const averageFrameTime = this.calculateAverageFrameTime();
    const targetFrameTime = this.adaptiveQuality.performanceBudget;
    
    this.metrics.cpuUsage = Math.min(100, (averageFrameTime / targetFrameTime) * 100);
  }

  private updatePerformanceLevel(): void {
    const fps = this.metrics.fps;
    const targetFps = this.adaptiveQuality.targetFps;
    
    if (fps >= targetFps * 0.95) {
      this.metrics.performanceLevel = 5; // Excellent
    } else if (fps >= targetFps * 0.8) {
      this.metrics.performanceLevel = 4; // Good
    } else if (fps >= targetFps * 0.6) {
      this.metrics.performanceLevel = 3; // Fair
    } else if (fps >= targetFps * 0.4) {
      this.metrics.performanceLevel = 2; // Poor
    } else {
      this.metrics.performanceLevel = 1; // Critical
    }
  }

  private detectPerformanceIssues(): void {
    const issues: string[] = [];
    
    if (this.metrics.fps < this.adaptiveQuality.targetFps * 0.8) {
      issues.push('Low frame rate detected');
    }
    
    if (this.metrics.memoryUsage > 100) {
      issues.push('High memory usage detected');
    }
    
    if (this.metrics.cpuUsage > 80) {
      issues.push('High CPU usage detected');
    }
    
    if (issues.length > 0) {
      console.warn('Performance issues detected:', issues);
      this.adjustQualityForPerformance();
    }
  }

  private adjustQualityForPerformance(): void {
    if (this.adaptiveQuality.adaptiveScaling) {
      this.adaptiveQuality.qualityLevel = Math.max(1, this.adaptiveQuality.qualityLevel - 1);
      
      if (this.adaptiveQuality.qualityLevel <= 2) {
        this.adaptiveQuality.targetFps = 30;
        this.adaptiveQuality.performanceBudget = 33.33;
      }
    }
  }

  private adaptQuality(): void {
    if (!this.adaptiveQuality.adaptiveScaling) return;

    const performanceLevel = this.metrics.performanceLevel;
    
    // Auto-adjust quality based on performance
    if (performanceLevel >= 4 && this.adaptiveQuality.qualityLevel < 5) {
      // Performance is good, increase quality
      this.adaptiveQuality.qualityLevel = Math.min(5, this.adaptiveQuality.qualityLevel + 1);
    } else if (performanceLevel <= 2 && this.adaptiveQuality.qualityLevel > 1) {
      // Performance is poor, decrease quality
      this.adaptiveQuality.qualityLevel = Math.max(1, this.adaptiveQuality.qualityLevel - 1);
    }
  }

  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  public getAdaptiveQuality(): AdaptiveQuality {
    return { ...this.adaptiveQuality };
  }

  public setTargetFps(fps: number): void {
    this.adaptiveQuality.targetFps = fps;
    this.adaptiveQuality.performanceBudget = 1000 / fps;
  }

  public setQualityLevel(level: number): void {
    this.adaptiveQuality.qualityLevel = Math.max(1, Math.min(5, level));
    this.adaptiveQuality.adaptiveScaling = false; // Disable auto-adjustment
  }

  public enableAdaptiveScaling(enable: boolean): void {
    this.adaptiveQuality.adaptiveScaling = enable;
  }

  public getFrameTimeHistory(): number[] {
    return [...this.frameTimeHistory];
  }

  public isThrottling(): boolean {
    return this.metrics.thermalThrottling;
  }

  public shouldSkipFrame(): boolean {
    return this.adaptiveQuality.backgroundMode || 
           (this.metrics.fps > this.adaptiveQuality.targetFps * 1.1);
  }

  public getPerformanceBudget(): number {
    return this.adaptiveQuality.performanceBudget;
  }

  public createPerformanceMark(name: string): void {
    performance.mark(name);
  }

  public measurePerformance(name: string, startMark: string, endMark: string): void {
    performance.measure(name, startMark, endMark);
  }

  public clearPerformanceData(): void {
    performance.clearMarks();
    performance.clearMeasures();
    this.frameTimeHistory = [];
  }

  public destroy(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
      this.performanceObserver = null;
    }

    this.clearPerformanceData();
  }
}