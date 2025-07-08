import { PerformanceMetrics } from '@/types/watch';

export class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    fps: 0,
    renderTime: 0,
    memoryUsage: 0,
    triangleCount: 0,
    textureMemory: 0,
    shaderCompileTime: 0,
  };

  private frameCount = 0;
  private lastTime = performance.now();
  private callbacks: ((metrics: PerformanceMetrics) => void)[] = [];

  constructor() {
    this.startMonitoring();
  }

  addCallback(callback: (metrics: PerformanceMetrics) => void) {
    this.callbacks.push(callback);
  }

  removeCallback(callback: (metrics: PerformanceMetrics) => void) {
    const index = this.callbacks.indexOf(callback);
    if (index > -1) {
      this.callbacks.splice(index, 1);
    }
  }

  private startMonitoring() {
    const updateMetrics = () => {
      const now = performance.now();
      const deltaTime = now - this.lastTime;
      
      if (deltaTime >= 1000) { // Update every second
        this.metrics.fps = Math.round((this.frameCount * 1000) / deltaTime);
        this.frameCount = 0;
        this.lastTime = now;
        
        this.updateMemoryUsage();
        this.notifyCallbacks();
      }
      
      this.frameCount++;
      requestAnimationFrame(updateMetrics);
    };
    
    requestAnimationFrame(updateMetrics);
  }

  private updateMemoryUsage() {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      this.metrics.memoryUsage = Math.round(memory.usedJSHeapSize / 1024 / 1024); // MB
    }
  }

  updateRenderTime(time: number) {
    this.metrics.renderTime = time;
  }

  updateTriangleCount(count: number) {
    this.metrics.triangleCount = count;
  }

  updateTextureMemory(memory: number) {
    this.metrics.textureMemory = memory;
  }

  updateShaderCompileTime(time: number) {
    this.metrics.shaderCompileTime = time;
  }

  private notifyCallbacks() {
    this.callbacks.forEach(callback => callback({ ...this.metrics }));
  }

  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }
}

export const performanceMonitor = new PerformanceMonitor();

// Performance optimization utilities
export const optimizeForDevice = () => {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
  
  if (!gl) {
    return 'low';
  }

  const renderer = gl.getParameter(gl.RENDERER);
  const vendor = gl.getParameter(gl.VENDOR);
  
  // Check for high-end GPUs
  if (
    renderer.includes('RTX') ||
    renderer.includes('GTX 1080') ||
    renderer.includes('GTX 1070') ||
    renderer.includes('RX 6800') ||
    renderer.includes('RX 6700')
  ) {
    return 'high';
  }
  
  // Check for mid-range GPUs
  if (
    renderer.includes('GTX') ||
    renderer.includes('RX') ||
    renderer.includes('Intel Iris') ||
    renderer.includes('Apple M1') ||
    renderer.includes('Apple M2')
  ) {
    return 'medium';
  }
  
  return 'low';
};

export const getOptimalSettings = (performanceMode: string) => {
  switch (performanceMode) {
    case 'high':
      return {
        shadowMapSize: 2048,
        antialiasing: true,
        maxLights: 8,
        textureQuality: 'high',
        particleCount: 1000,
        reflectionQuality: 'high',
      };
    case 'medium':
      return {
        shadowMapSize: 1024,
        antialiasing: true,
        maxLights: 4,
        textureQuality: 'medium',
        particleCount: 500,
        reflectionQuality: 'medium',
      };
    case 'low':
      return {
        shadowMapSize: 512,
        antialiasing: false,
        maxLights: 2,
        textureQuality: 'low',
        particleCount: 100,
        reflectionQuality: 'low',
      };
    default:
      return getOptimalSettings('medium');
  }
};