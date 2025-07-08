import { motion, AnimationControls, useAnimation } from 'framer-motion';
import { WatchComponent, AnimationState, Vector3 } from '../types/watch-components';
import { PhysicsEngine } from '../physics/physics-engine';

export interface AnimationSequence {
  id: string;
  name: string;
  duration: number;
  keyframes: AnimationKeyframe[];
  easing: string;
}

export interface AnimationKeyframe {
  time: number; // 0-1 normalized time
  position: Vector3;
  rotation: Vector3;
  scale: Vector3;
  opacity: number;
}

export interface AnimationConfig {
  totalDuration: number;
  deconstructionDuration: number;
  floatingDuration: number;
  reconstructionDuration: number;
  staggerDelay: number;
  usePhysics: boolean;
  performanceMode: 'high' | 'medium' | 'low';
}

export class AnimationController {
  private physicsEngine: PhysicsEngine;
  private animationState: AnimationState;
  private components: Map<string, WatchComponent> = new Map();
  private animationControls: Map<string, AnimationControls> = new Map();
  private config: AnimationConfig;
  private isAnimating: boolean = false;
  private currentSequence: AnimationSequence | null = null;
  private performanceMonitor: PerformanceMonitor;

  constructor(physicsEngine: PhysicsEngine, config: AnimationConfig) {
    this.physicsEngine = physicsEngine;
    this.config = config;
    this.performanceMonitor = new PerformanceMonitor();
    this.animationState = {
      phase: 'idle',
      progress: 0,
      activeComponents: new Set()
    };
  }

  public initializeComponents(components: WatchComponent[]): void {
    this.components.clear();
    this.animationControls.clear();

    for (const component of components) {
      this.components.set(component.id, component);
      this.animationControls.set(component.id, useAnimation());
      
      if (this.config.usePhysics) {
        this.physicsEngine.initializeComponent(component);
      }
    }
  }

  public async startDeconstructionSequence(fromWatchId: string, toWatchId: string): Promise<void> {
    if (this.isAnimating) {
      console.warn('Animation already in progress');
      return;
    }

    this.isAnimating = true;
    this.animationState.phase = 'deconstructing';
    this.animationState.targetWatch = toWatchId;

    try {
      // Phase 1: Deconstruction
      await this.executeDeconstruction();
      
      // Phase 2: Floating transition
      await this.executeFloatingTransition();
      
      // Phase 3: Reconstruction
      await this.executeReconstruction(toWatchId);
      
    } catch (error) {
      console.error('Animation sequence failed:', error);
    } finally {
      this.isAnimating = false;
      this.animationState.phase = 'idle';
      this.animationState.progress = 0;
    }
  }

  private async executeDeconstruction(): Promise<void> {
    const duration = this.config.deconstructionDuration;
    const components = Array.from(this.components.values());
    
    // Sort components by reverse assembly order for realistic deconstruction
    const sortedComponents = components.sort((a, b) => b.assemblyOrder - a.assemblyOrder);
    
    // Create staggered deconstruction sequence
    const promises: Promise<void>[] = [];
    
    for (let i = 0; i < sortedComponents.length; i++) {
      const component = sortedComponents[i];
      const delay = i * this.config.staggerDelay;
      const componentDuration = duration * 0.8; // Overlap animations
      
      promises.push(this.animateComponentDeconstruction(component, delay, componentDuration));
    }

    await Promise.all(promises);
  }

  private async animateComponentDeconstruction(
    component: WatchComponent,
    delay: number,
    duration: number
  ): Promise<void> {
    const controls = this.animationControls.get(component.id);
    if (!controls) return;

    // Calculate explosion vector based on component position
    const explosionVector = this.calculateExplosionVector(component);
    const targetPosition = {
      x: component.position.x + explosionVector.x,
      y: component.position.y + explosionVector.y,
      z: component.position.z + explosionVector.z
    };

    // Create deconstruction animation
    const sequence = this.createDeconstructionSequence(component, targetPosition, duration);
    
    // Apply physics if enabled
    if (this.config.usePhysics) {
      this.physicsEngine.applyForce(component.id, explosionVector);
    }

    // Execute animation
    await controls.start({
      x: targetPosition.x,
      y: targetPosition.y,
      z: targetPosition.z,
      rotateX: component.rotation.x + Math.random() * 360,
      rotateY: component.rotation.y + Math.random() * 360,
      rotateZ: component.rotation.z + Math.random() * 360,
      scale: this.calculateScaleForDistance(explosionVector),
      opacity: 0.8,
      transition: {
        delay: delay / 1000,
        duration: duration / 1000,
        ease: this.getEasingFunction(component.animationCurve || 'easeOutCubic'),
        type: 'spring',
        damping: 15,
        stiffness: 100
      }
    });
  }

  private async executeFloatingTransition(): Promise<void> {
    const duration = this.config.floatingDuration;
    const components = Array.from(this.components.values());
    
    // Create floating motion for all components
    const promises = components.map(component => 
      this.animateFloatingMotion(component, duration)
    );

    await Promise.all(promises);
  }

  private async animateFloatingMotion(component: WatchComponent, duration: number): Promise<void> {
    const controls = this.animationControls.get(component.id);
    if (!controls) return;

    // Create subtle floating motion
    const floatingAmplitude = 2.0;
    const rotationSpeed = 0.5;
    
    // Generate random floating path
    const floatingPath = this.generateFloatingPath(component, floatingAmplitude, duration);
    
    // Apply continuous floating forces if physics enabled
    if (this.config.usePhysics) {
      this.applyFloatingForces(component.id, floatingPath, duration);
    }

    // Animate floating motion
    await controls.start({
      x: floatingPath.map(p => p.x),
      y: floatingPath.map(p => p.y),
      z: floatingPath.map(p => p.z),
      rotateX: [0, 360 * rotationSpeed],
      rotateY: [0, 360 * rotationSpeed],
      rotateZ: [0, 360 * rotationSpeed],
      transition: {
        duration: duration / 1000,
        ease: 'linear',
        repeat: 0,
        times: floatingPath.map((_, i) => i / (floatingPath.length - 1))
      }
    });
  }

  private async executeReconstruction(toWatchId: string): Promise<void> {
    const duration = this.config.reconstructionDuration;
    const components = Array.from(this.components.values());
    
    // Sort components by assembly order for realistic reconstruction
    const sortedComponents = components.sort((a, b) => a.assemblyOrder - b.assemblyOrder);
    
    // Load target watch configuration
    const targetPositions = await this.loadWatchConfiguration(toWatchId);
    
    // Create staggered reconstruction sequence
    const promises: Promise<void>[] = [];
    
    for (let i = 0; i < sortedComponents.length; i++) {
      const component = sortedComponents[i];
      const delay = i * this.config.staggerDelay * 0.5; // Faster reconstruction
      const componentDuration = duration * 0.9;
      
      promises.push(this.animateComponentReconstruction(
        component,
        targetPositions.get(component.id) || component.position,
        delay,
        componentDuration
      ));
    }

    await Promise.all(promises);
  }

  private async animateComponentReconstruction(
    component: WatchComponent,
    targetPosition: Vector3,
    delay: number,
    duration: number
  ): Promise<void> {
    const controls = this.animationControls.get(component.id);
    if (!controls) return;

    // Apply magnetic assembly forces if physics enabled
    if (this.config.usePhysics) {
      this.physicsEngine.animateToPosition(component.id, targetPosition, duration / 1000);
    }

    // Execute reconstruction animation
    await controls.start({
      x: targetPosition.x,
      y: targetPosition.y,
      z: targetPosition.z,
      rotateX: component.rotation.x,
      rotateY: component.rotation.y,
      rotateZ: component.rotation.z,
      scale: component.scale.x,
      opacity: 1,
      transition: {
        delay: delay / 1000,
        duration: duration / 1000,
        ease: this.getEasingFunction(component.animationCurve || 'easeInOutCubic'),
        type: 'spring',
        damping: 20,
        stiffness: 150
      }
    });
  }

  // Helper methods
  private calculateExplosionVector(component: WatchComponent): Vector3 {
    const centerDistance = Math.sqrt(
      component.position.x ** 2 + component.position.y ** 2
    );
    
    const explosionStrength = 15 + (component.physics.mass * 2);
    const randomFactor = 0.3;
    
    return {
      x: (component.position.x / centerDistance) * explosionStrength + (Math.random() - 0.5) * randomFactor,
      y: (component.position.y / centerDistance) * explosionStrength + (Math.random() - 0.5) * randomFactor,
      z: component.position.z + Math.random() * 10 - 5
    };
  }

  private calculateScaleForDistance(explosionVector: Vector3): number {
    const distance = Math.sqrt(explosionVector.x ** 2 + explosionVector.y ** 2 + explosionVector.z ** 2);
    return Math.max(0.3, 1 - (distance / 100)); // Scale down with distance
  }

  private generateFloatingPath(component: WatchComponent, amplitude: number, duration: number): Vector3[] {
    const steps = 8;
    const path: Vector3[] = [];
    
    for (let i = 0; i < steps; i++) {
      const t = i / (steps - 1);
      const angle = t * Math.PI * 2;
      
      path.push({
        x: component.position.x + Math.sin(angle) * amplitude,
        y: component.position.y + Math.cos(angle) * amplitude * 0.5,
        z: component.position.z + Math.sin(angle * 2) * amplitude * 0.3
      });
    }
    
    return path;
  }

  private applyFloatingForces(componentId: string, path: Vector3[], duration: number): void {
    const timeStep = duration / path.length;
    
    path.forEach((point, index) => {
      setTimeout(() => {
        const force = {
          x: (Math.random() - 0.5) * 0.5,
          y: (Math.random() - 0.5) * 0.5,
          z: (Math.random() - 0.5) * 0.5
        };
        this.physicsEngine.applyForce(componentId, force);
      }, index * timeStep);
    });
  }

  private async loadWatchConfiguration(watchId: string): Promise<Map<string, Vector3>> {
    // This would load different watch configurations
    // For now, return default positions
    const positions = new Map<string, Vector3>();
    
    for (const [id, component] of this.components.entries()) {
      positions.set(id, component.position);
    }
    
    return positions;
  }

  private getEasingFunction(curve: string): string {
    const easingMap: Record<string, string> = {
      'easeInOutCubic': 'cubic-bezier(0.645, 0.045, 0.355, 1)',
      'easeOutCubic': 'cubic-bezier(0.215, 0.61, 0.355, 1)',
      'easeInCubic': 'cubic-bezier(0.55, 0.055, 0.675, 0.19)',
      'easeOutBack': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      'easeInOutBack': 'cubic-bezier(0.68, -0.6, 0.32, 1.6)'
    };
    
    return easingMap[curve] || 'ease-in-out';
  }

  // Performance monitoring
  private createDeconstructionSequence(
    component: WatchComponent,
    targetPosition: Vector3,
    duration: number
  ): AnimationSequence {
    return {
      id: `deconstruct_${component.id}`,
      name: `Deconstruct ${component.name}`,
      duration,
      keyframes: [
        {
          time: 0,
          position: component.position,
          rotation: component.rotation,
          scale: component.scale,
          opacity: 1
        },
        {
          time: 1,
          position: targetPosition,
          rotation: {
            x: component.rotation.x + Math.random() * 360,
            y: component.rotation.y + Math.random() * 360,
            z: component.rotation.z + Math.random() * 360
          },
          scale: this.calculateScaleForDistance(targetPosition),
          opacity: 0.8
        }
      ],
      easing: component.animationCurve || 'easeOutCubic'
    };
  }

  // Performance optimization
  public setPerformanceMode(mode: 'high' | 'medium' | 'low'): void {
    this.config.performanceMode = mode;
    
    switch (mode) {
      case 'low':
        this.config.staggerDelay = 100;
        this.config.usePhysics = false;
        break;
      case 'medium':
        this.config.staggerDelay = 50;
        this.config.usePhysics = true;
        break;
      case 'high':
        this.config.staggerDelay = 25;
        this.config.usePhysics = true;
        break;
    }
  }

  public getAnimationState(): AnimationState {
    return { ...this.animationState };
  }

  public isAnimationActive(): boolean {
    return this.isAnimating;
  }

  public pauseAnimation(): void {
    // Pause all active animations
    for (const controls of this.animationControls.values()) {
      controls.stop();
    }
  }

  public resumeAnimation(): void {
    // Resume animations (implementation depends on current state)
    // This would require storing animation progress
  }

  public dispose(): void {
    this.components.clear();
    this.animationControls.clear();
    this.physicsEngine.dispose();
  }
}

// Performance monitoring class
class PerformanceMonitor {
  private frameCount: number = 0;
  private lastFrameTime: number = 0;
  private fps: number = 0;
  private frameTimeThreshold: number = 16.67; // 60 FPS

  public startMonitoring(): void {
    this.lastFrameTime = performance.now();
    this.monitorFrame();
  }

  private monitorFrame(): void {
    const now = performance.now();
    const frameTime = now - this.lastFrameTime;
    
    this.frameCount++;
    this.fps = 1000 / frameTime;
    
    if (frameTime > this.frameTimeThreshold) {
      console.warn(`Frame time exceeded threshold: ${frameTime}ms (${this.fps.toFixed(1)} FPS)`);
    }
    
    this.lastFrameTime = now;
    requestAnimationFrame(() => this.monitorFrame());
  }

  public getFPS(): number {
    return this.fps;
  }
}