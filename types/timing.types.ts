// Timing Types for Richard Mille Watches

export interface WatchTiming {
  currentTime: number;
  beatFrequency: number;
  precision: number;
  escapementVariation: number;
  powerReserve: number;
  springTension: number;
  timezoneOffset: number;
}

export interface HandPosition {
  hourAngle: number;
  minuteAngle: number;
  secondAngle: number;
  millisecondAngle: number;
  chronoMinuteAngle: number;
  chronoSecondAngle: number;
  precision: number;
}

export interface TimingHookConfig {
  highPrecision: boolean;
  mechanicalSimulation: boolean;
  realTimeSync: boolean;
  performanceMonitoring: boolean;
  adaptiveQuality: boolean;
  backgroundOptimization: boolean;
  targetFps: number;
  performanceBudget: number;
}

export interface WatchModel {
  name: string;
  beatFrequency: number;
  powerReserve: number;
  precision: number;
  complications: string[];
}