// TypeScript definitions for Richard Mille watches

export interface WatchModel {
  id: string;
  name: string;
  collection: string;
  movement: MovementType;
  case: CaseSpecification;
  dial: DialSpecification;
  strap: StrapSpecification;
  price?: number;
  availability: AvailabilityStatus;
  features: WatchFeature[];
  animations: AnimationConfig[];
  sounds: SoundConfig[];
}

export interface MovementType {
  caliber: string;
  type: "manual" | "automatic" | "tourbillon" | "chronograph";
  frequency: number; // Hz
  powerReserve: number; // hours
  jewels: number;
  features: string[];
}

export interface CaseSpecification {
  material: MaterialType;
  diameter: number; // mm
  thickness: number; // mm
  waterResistance: number; // meters
  crystal: CrystalType;
  finish: FinishType[];
}

export interface DialSpecification {
  color: string;
  material: MaterialType;
  indices: IndiceType;
  hands: HandsSpecification;
  subdials?: SubdialConfig[];
}

export interface StrapSpecification {
  material: StrapMaterial;
  color: string;
  buckle: BuckleType;
  width: number; // mm
}

export interface WatchFeature {
  id: string;
  name: string;
  description: string;
  category: FeatureCategory;
  interactive: boolean;
  animation?: string;
  sound?: string;
}

export interface AnimationConfig {
  id: string;
  name: string;
  type: AnimationType;
  duration: number; // seconds
  easing: EasingFunction;
  trigger: AnimationTrigger;
  properties: AnimationProperties;
}

export interface SoundConfig {
  id: string;
  name: string;
  file: string;
  volume: number; // 0-1
  loop: boolean;
  trigger: SoundTrigger;
  spatialAudio?: SpatialAudioConfig;
}

export interface SpatialAudioConfig {
  position: [number, number, number];
  refDistance: number;
  rolloffFactor: number;
  coneInnerAngle: number;
  coneOuterAngle: number;
}

// Enums and Union Types
export type MaterialType = 
  | "carbon-tpt"
  | "gold-18k"
  | "titanium"
  | "ceramic"
  | "sapphire"
  | "steel"
  | "platinum"
  | "ntpt-carbon"
  | "quartz-tpt";

export type CrystalType = "sapphire" | "mineral" | "acrylic";

export type FinishType = "polished" | "brushed" | "sandblasted" | "pvd" | "dlc";

export type IndiceType = "applied" | "printed" | "luminous" | "arabic" | "roman";

export type StrapMaterial = "rubber" | "leather" | "fabric" | "metal" | "carbon" | "ceramic";

export type BuckleType = "pin" | "deployant" | "fold-over" | "push-button";

export type FeatureCategory = 
  | "movement"
  | "complications"
  | "materials"
  | "design"
  | "performance"
  | "innovation";

export type AnimationType = 
  | "rotation"
  | "translation"
  | "scale"
  | "opacity"
  | "morph"
  | "particle"
  | "shader";

export type EasingFunction = 
  | "linear"
  | "ease-in"
  | "ease-out"
  | "ease-in-out"
  | "cubic-bezier"
  | "spring"
  | "bounce";

export type AnimationTrigger = 
  | "hover"
  | "click"
  | "scroll"
  | "time"
  | "audio"
  | "gesture"
  | "proximity";

export type SoundTrigger = 
  | "hover"
  | "click"
  | "movement"
  | "time"
  | "gesture"
  | "proximity"
  | "ambient";

export type AvailabilityStatus = 
  | "available"
  | "limited"
  | "sold-out"
  | "coming-soon"
  | "discontinued";

export interface AnimationProperties {
  [key: string]: any;
  transform?: {
    position?: [number, number, number];
    rotation?: [number, number, number];
    scale?: [number, number, number];
  };
  material?: {
    opacity?: number;
    color?: string;
    metalness?: number;
    roughness?: number;
  };
}

export interface HandsSpecification {
  hour: HandStyle;
  minute: HandStyle;
  second?: HandStyle;
  chronograph?: ChronographHands;
}

export interface HandStyle {
  shape: "lance" | "dauphine" | "baton" | "leaf" | "skeleton";
  material: MaterialType;
  color: string;
  luminous: boolean;
}

export interface ChronographHands {
  central: HandStyle;
  subdial: HandStyle[];
}

export interface SubdialConfig {
  position: "3" | "6" | "9" | "12";
  function: "seconds" | "minutes" | "hours" | "date" | "power-reserve";
  size: number; // mm
}

// Performance monitoring types
export interface PerformanceMetrics {
  fps: number;
  renderTime: number;
  memoryUsage: number;
  triangleCount: number;
  textureMemory: number;
  shaderCompileTime: number;
}

// User interaction types
export interface InteractionEvent {
  type: "hover" | "click" | "drag" | "pinch" | "rotate";
  target: string;
  position: [number, number];
  timestamp: number;
  data?: any;
}

// Component props types
export interface WatchViewerProps {
  model: WatchModel;
  viewMode: "3d" | "2d" | "ar";
  interactive: boolean;
  autoRotate: boolean;
  enableAudio: boolean;
  performanceMode: "high" | "medium" | "low";
  onInteraction?: (event: InteractionEvent) => void;
  onPerformanceUpdate?: (metrics: PerformanceMetrics) => void;
}

export interface AudioContextState {
  context: AudioContext | null;
  masterGain: GainNode | null;
  spatialPanner: PannerNode | null;
  loaded: boolean;
  error: string | null;
}