// Mechanical Accuracy Simulation for Richard Mille Watches

import { MechanicalAccuracy, EscapementVariation, WatchModel } from '../types/timing.types';

export class MechanicalAccuracySimulator {
  private readonly BEATS_PER_HOUR = 21600; // 6 Hz
  private readonly FREQUENCY_HZ = 6;
  private readonly MILLISECONDS_PER_BEAT = 1000 / this.FREQUENCY_HZ;
  
  private beatCounter = 0;
  private lastBeatTime = 0;
  private temperatureEffect = 0;
  private positionEffect = 0;
  private magneticEffect = 0;
  private ageDrift = 0;
  private wearPattern = 0;

  constructor(private model: WatchModel) {
    this.initializeVariations();
  }

  private initializeVariations(): void {
    // Initialize based on movement type and age
    this.temperatureEffect = this.generateRandomVariation(0.5, 2.0); // seconds per day
    this.positionEffect = this.generateRandomVariation(0.3, 1.5);
    this.magneticEffect = this.generateRandomVariation(0.1, 0.8);
    this.ageDrift = this.generateRandomVariation(0.2, 1.0);
  }

  private generateRandomVariation(min: number, max: number): number {
    return min + (max - min) * Math.random();
  }

  public calculateMechanicalAccuracy(): MechanicalAccuracy {
    const currentTime = performance.now();
    const beatInterval = this.calculateBeatInterval(currentTime);
    const amplitude = this.calculateAmplitude();
    const beatError = this.calculateBeatError();
    const rateDeviation = this.calculateRateDeviation();
    const isochronism = this.calculateIsochronism();

    return {
      beatsPerHour: this.BEATS_PER_HOUR,
      frequency: this.FREQUENCY_HZ,
      amplitude,
      beatError,
      rateDeviation,
      isochronism
    };
  }

  private calculateBeatInterval(currentTime: number): number {
    // Calculate actual beat interval with variations
    const baseInterval = this.MILLISECONDS_PER_BEAT;
    const variations = this.calculateEscapementVariations();
    
    return baseInterval + variations.timingVariation;
  }

  private calculateAmplitude(): number {
    // Balance wheel amplitude (typically 250-320 degrees)
    const baseAmplitude = 280;
    const powerReserveEffect = this.calculatePowerReserveEffect();
    const temperatureEffect = this.calculateTemperatureEffect();
    const wearEffect = this.calculateWearEffect();
    
    return baseAmplitude + powerReserveEffect + temperatureEffect + wearEffect;
  }

  private calculateBeatError(): number {
    // Beat error in milliseconds (difference between tick and tock)
    const baseBeatError = 0.1; // Very low for high-quality movement
    const variations = this.calculateEscapementVariations();
    
    return baseBeatError + variations.timingVariation * 0.1;
  }

  private calculateRateDeviation(): number {
    // Rate deviation in seconds per day
    const baseRate = 0; // Perfect timekeeping
    const allEffects = this.temperatureEffect + this.positionEffect + 
                      this.magneticEffect + this.ageDrift;
    
    return baseRate + allEffects;
  }

  private calculateIsochronism(): number {
    // Isochronism variation (rate change with amplitude)
    const baseIsochronism = 0.5; // seconds per day per degree of amplitude
    const powerReserveEffect = this.calculatePowerReserveEffect();
    
    return baseIsochronism * (1 + powerReserveEffect * 0.01);
  }

  public calculateEscapementVariations(): EscapementVariation {
    const currentTime = performance.now();
    
    // Simulate natural variations in escapement
    const amplitudeVariation = this.generateSinusoidalVariation(currentTime, 0.1, 15000);
    const timingVariation = this.generateSinusoidalVariation(currentTime, 0.05, 8000);
    
    return {
      amplitudeVariation,
      timingVariation,
      temperatureEffect: this.calculateTemperatureEffect(),
      positionEffect: this.calculatePositionEffect(),
      magneticEffect: this.calculateMagneticEffect(),
      ageDrift: this.calculateAgeDrift()
    };
  }

  private generateSinusoidalVariation(time: number, amplitude: number, period: number): number {
    return amplitude * Math.sin(2 * Math.PI * time / period);
  }

  private calculatePowerReserveEffect(): number {
    // Power reserve affects amplitude and timing
    const powerLevel = this.getCurrentPowerLevel();
    const effect = (100 - powerLevel) * 0.02; // 2% effect per 1% power loss
    
    return Math.max(0, effect);
  }

  private calculateTemperatureEffect(): number {
    // Temperature effect on timing (assuming room temperature variations)
    const temperatureVariation = Math.sin(Date.now() / 3600000) * 5; // ±5°C variation
    return temperatureVariation * 0.1; // 0.1 second per day per degree
  }

  private calculatePositionEffect(): number {
    // Position effect (dial up, down, crown up, etc.)
    const positionVariations = [0, 0.5, -0.3, 0.8, -0.6, 0.4];
    const positionIndex = Math.floor(Date.now() / 10000) % positionVariations.length;
    
    return positionVariations[positionIndex];
  }

  private calculateMagneticEffect(): number {
    // Magnetic field effect (usually minimal in modern watches)
    const magneticNoise = Math.random() * 0.1;
    return magneticNoise;
  }

  private calculateAgeDrift(): number {
    // Age-related drift (increases over time)
    const watchAge = this.getWatchAge();
    return watchAge * 0.01; // 0.01 second per day per year
  }

  private calculateWearEffect(): number {
    // Wear pattern effect on amplitude
    this.wearPattern += 0.001; // Gradual wear
    return -this.wearPattern * 0.5; // Slight amplitude decrease
  }

  private getCurrentPowerLevel(): number {
    // Simulate power reserve level (would be provided by power reserve hook)
    const timeSinceWinding = (Date.now() % (48 * 3600000)) / 3600000; // 48-hour reserve
    return Math.max(0, 100 - (timeSinceWinding / 48) * 100);
  }

  private getWatchAge(): number {
    // Watch age in years (would be provided by configuration)
    return 2; // Default 2 years
  }

  public getBeatCount(): number {
    return this.beatCounter;
  }

  public getLastBeatTime(): number {
    return this.lastBeatTime;
  }

  public simulateBeat(): void {
    const currentTime = performance.now();
    const accuracy = this.calculateMechanicalAccuracy();
    
    this.beatCounter++;
    this.lastBeatTime = currentTime;
    
    // Apply beat error and timing variations
    const beatError = accuracy.beatError;
    const adjustedTime = currentTime + beatError;
    
    // Update internal state
    this.updateInternalState(adjustedTime);
  }

  private updateInternalState(time: number): void {
    // Update various internal parameters based on time
    // This would include gear train calculations, spring tension, etc.
  }

  public getSubPixelPrecision(): number {
    // Calculate sub-pixel precision based on beat frequency
    const beatsPerSecond = this.FREQUENCY_HZ;
    const pixelsPerSecond = 360; // Assuming 360 pixels per full rotation
    
    return pixelsPerSecond / beatsPerSecond; // Pixels per beat
  }

  public calculateHandPosition(time: number): { angle: number; subPixel: number } {
    const accuracy = this.calculateMechanicalAccuracy();
    const baseAngle = (time / 1000) * 6; // 6 degrees per second
    
    // Apply mechanical variations
    const variations = this.calculateEscapementVariations();
    const adjustedAngle = baseAngle + variations.timingVariation * 0.006; // Convert to degrees
    
    // Calculate sub-pixel position
    const subPixel = (adjustedAngle % 1) * this.getSubPixelPrecision();
    
    return {
      angle: adjustedAngle,
      subPixel
    };
  }

  public reset(): void {
    this.beatCounter = 0;
    this.lastBeatTime = 0;
    this.initializeVariations();
  }
}