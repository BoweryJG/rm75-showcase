import { WatchComponent, Vector3, ComponentPhysics } from '../types/watch-components';

export interface PhysicsState {
  position: Vector3;
  velocity: Vector3;
  acceleration: Vector3;
  angularVelocity: Vector3;
  rotation: Vector3;
  forces: Vector3[];
  torques: Vector3[];
}

export class PhysicsEngine {
  private components: Map<string, PhysicsState> = new Map();
  private deltaTime: number = 1/60; // 60 FPS
  private gravity: Vector3 = { x: 0, y: -9.81, z: 0 };
  private airResistance: number = 0.1;
  private magneticField: Vector3 = { x: 0, y: 0, z: 0 };
  private boundingBox: {
    min: Vector3;
    max: Vector3;
  } = {
    min: { x: -50, y: -50, z: -50 },
    max: { x: 50, y: 50, z: 50 }
  };

  constructor() {
    this.setupPhysicsWorld();
  }

  private setupPhysicsWorld(): void {
    // Configure physics world parameters
    this.setGravity({ x: 0, y: -2, z: 0 }); // Reduced gravity for floating effect
    this.setAirResistance(0.05); // Light air resistance
  }

  public initializeComponent(component: WatchComponent): void {
    const physicsState: PhysicsState = {
      position: { ...component.position },
      velocity: { x: 0, y: 0, z: 0 },
      acceleration: { x: 0, y: 0, z: 0 },
      angularVelocity: { x: 0, y: 0, z: 0 },
      rotation: { ...component.rotation },
      forces: [],
      torques: []
    };

    this.components.set(component.id, physicsState);
  }

  public updatePhysics(deltaTime: number = this.deltaTime): void {
    this.deltaTime = deltaTime;

    for (const [componentId, state] of this.components.entries()) {
      this.updateComponentPhysics(componentId, state);
    }

    this.handleCollisions();
    this.applyConstraints();
  }

  private updateComponentPhysics(componentId: string, state: PhysicsState): void {
    // Calculate net force
    const netForce = this.calculateNetForce(state);
    
    // Apply Newton's second law: F = ma
    const component = this.getComponentById(componentId);
    if (!component) return;

    const mass = component.physics.mass;
    state.acceleration = {
      x: netForce.x / mass,
      y: netForce.y / mass,
      z: netForce.z / mass
    };

    // Update velocity (Verlet integration for stability)
    state.velocity.x += state.acceleration.x * this.deltaTime;
    state.velocity.y += state.acceleration.y * this.deltaTime;
    state.velocity.z += state.acceleration.z * this.deltaTime;

    // Apply air resistance
    const resistance = component.physics.friction * this.airResistance;
    state.velocity.x *= (1 - resistance);
    state.velocity.y *= (1 - resistance);
    state.velocity.z *= (1 - resistance);

    // Update position
    state.position.x += state.velocity.x * this.deltaTime;
    state.position.y += state.velocity.y * this.deltaTime;
    state.position.z += state.velocity.z * this.deltaTime;

    // Update rotation
    state.rotation.x += state.angularVelocity.x * this.deltaTime;
    state.rotation.y += state.angularVelocity.y * this.deltaTime;
    state.rotation.z += state.angularVelocity.z * this.deltaTime;

    // Clear forces for next frame
    state.forces = [];
    state.torques = [];
  }

  private calculateNetForce(state: PhysicsState): Vector3 {
    const netForce: Vector3 = { x: 0, y: 0, z: 0 };

    // Add gravity
    netForce.x += this.gravity.x;
    netForce.y += this.gravity.y;
    netForce.z += this.gravity.z;

    // Add applied forces
    for (const force of state.forces) {
      netForce.x += force.x;
      netForce.y += force.y;
      netForce.z += force.z;
    }

    return netForce;
  }

  private handleCollisions(): void {
    const componentIds = Array.from(this.components.keys());
    
    for (let i = 0; i < componentIds.length; i++) {
      for (let j = i + 1; j < componentIds.length; j++) {
        const id1 = componentIds[i];
        const id2 = componentIds[j];
        const state1 = this.components.get(id1)!;
        const state2 = this.components.get(id2)!;

        if (this.checkCollision(state1, state2)) {
          this.resolveCollision(id1, id2, state1, state2);
        }
      }
    }
  }

  private checkCollision(state1: PhysicsState, state2: PhysicsState): boolean {
    const distance = this.calculateDistance(state1.position, state2.position);
    const minDistance = 2.0; // Minimum distance between components
    return distance < minDistance;
  }

  private resolveCollision(id1: string, id2: string, state1: PhysicsState, state2: PhysicsState): void {
    const component1 = this.getComponentById(id1);
    const component2 = this.getComponentById(id2);
    
    if (!component1 || !component2) return;

    // Calculate collision normal
    const normal = this.normalize(this.subtract(state2.position, state1.position));
    
    // Calculate relative velocity
    const relativeVelocity = this.subtract(state2.velocity, state1.velocity);
    const velocityAlongNormal = this.dot(relativeVelocity, normal);

    // Don't resolve if velocities are separating
    if (velocityAlongNormal > 0) return;

    // Calculate restitution
    const restitution = Math.min(component1.physics.restitution, component2.physics.restitution);
    
    // Calculate impulse scalar
    const impulseScalar = -(1 + restitution) * velocityAlongNormal;
    const totalMass = component1.physics.mass + component2.physics.mass;
    const impulse = impulseScalar / totalMass;

    // Apply impulse
    const impulseVector = this.multiply(normal, impulse);
    
    state1.velocity = this.subtract(state1.velocity, this.multiply(impulseVector, component2.physics.mass));
    state2.velocity = this.add(state2.velocity, this.multiply(impulseVector, component1.physics.mass));

    // Separate objects
    const separation = this.multiply(normal, 0.5);
    state1.position = this.subtract(state1.position, separation);
    state2.position = this.add(state2.position, separation);
  }

  private applyConstraints(): void {
    for (const [componentId, state] of this.components.entries()) {
      // Keep components within bounding box
      state.position.x = Math.max(this.boundingBox.min.x, Math.min(this.boundingBox.max.x, state.position.x));
      state.position.y = Math.max(this.boundingBox.min.y, Math.min(this.boundingBox.max.y, state.position.y));
      state.position.z = Math.max(this.boundingBox.min.z, Math.min(this.boundingBox.max.z, state.position.z));

      // Apply velocity limits
      const maxVelocity = 50;
      const speed = Math.sqrt(state.velocity.x ** 2 + state.velocity.y ** 2 + state.velocity.z ** 2);
      if (speed > maxVelocity) {
        const scale = maxVelocity / speed;
        state.velocity.x *= scale;
        state.velocity.y *= scale;
        state.velocity.z *= scale;
      }
    }
  }

  // Force application methods
  public applyForce(componentId: string, force: Vector3): void {
    const state = this.components.get(componentId);
    if (state) {
      state.forces.push(force);
    }
  }

  public applyTorque(componentId: string, torque: Vector3): void {
    const state = this.components.get(componentId);
    if (state) {
      state.torques.push(torque);
    }
  }

  public applyMagneticForce(componentId: string, magneticStrength: number): void {
    const state = this.components.get(componentId);
    const component = this.getComponentById(componentId);
    
    if (state && component && component.physics.magnetism) {
      const magneticForce = {
        x: this.magneticField.x * magneticStrength * component.physics.magnetism,
        y: this.magneticField.y * magneticStrength * component.physics.magnetism,
        z: this.magneticField.z * magneticStrength * component.physics.magnetism
      };
      
      this.applyForce(componentId, magneticForce);
    }
  }

  // Animation helpers
  public animateToPosition(componentId: string, targetPosition: Vector3, duration: number): void {
    const state = this.components.get(componentId);
    if (!state) return;

    const direction = this.subtract(targetPosition, state.position);
    const distance = this.magnitude(direction);
    const speed = distance / duration;

    if (distance > 0.1) {
      const velocity = this.multiply(this.normalize(direction), speed);
      state.velocity = velocity;
    }
  }

  public setComponentPosition(componentId: string, position: Vector3): void {
    const state = this.components.get(componentId);
    if (state) {
      state.position = { ...position };
    }
  }

  public getComponentPosition(componentId: string): Vector3 | null {
    const state = this.components.get(componentId);
    return state ? { ...state.position } : null;
  }

  public getComponentRotation(componentId: string): Vector3 | null {
    const state = this.components.get(componentId);
    return state ? { ...state.rotation } : null;
  }

  // Configuration methods
  public setGravity(gravity: Vector3): void {
    this.gravity = gravity;
  }

  public setAirResistance(resistance: number): void {
    this.airResistance = resistance;
  }

  public setMagneticField(field: Vector3): void {
    this.magneticField = field;
  }

  public setBoundingBox(min: Vector3, max: Vector3): void {
    this.boundingBox = { min, max };
  }

  // Utility methods
  private getComponentById(id: string): WatchComponent | null {
    // This would be injected or retrieved from component registry
    // For now, return null - actual implementation would have access to component data
    return null;
  }

  private add(a: Vector3, b: Vector3): Vector3 {
    return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
  }

  private subtract(a: Vector3, b: Vector3): Vector3 {
    return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
  }

  private multiply(a: Vector3, scalar: number): Vector3 {
    return { x: a.x * scalar, y: a.y * scalar, z: a.z * scalar };
  }

  private dot(a: Vector3, b: Vector3): number {
    return a.x * b.x + a.y * b.y + a.z * b.z;
  }

  private magnitude(v: Vector3): number {
    return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
  }

  private normalize(v: Vector3): Vector3 {
    const mag = this.magnitude(v);
    return mag > 0 ? { x: v.x / mag, y: v.y / mag, z: v.z / mag } : { x: 0, y: 0, z: 0 };
  }

  private calculateDistance(a: Vector3, b: Vector3): number {
    return this.magnitude(this.subtract(a, b));
  }

  public dispose(): void {
    this.components.clear();
  }
}