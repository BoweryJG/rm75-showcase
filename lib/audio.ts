import { AudioContextState, SoundConfig } from '@/types/watch';

export class AudioManager {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sounds: Map<string, AudioBuffer> = new Map();
  private sources: Map<string, AudioBufferSourceNode> = new Map();
  private state: AudioContextState = {
    context: null,
    masterGain: null,
    spatialPanner: null,
    loaded: false,
    error: null,
  };

  async initialize(): Promise<boolean> {
    try {
      // Create audio context
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioContextClass();
      
      // Resume context if suspended (required by browser policies)
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      // Create master gain node
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);
      this.masterGain.gain.value = 0.7; // Default volume

      this.state = {
        context: this.audioContext,
        masterGain: this.masterGain,
        spatialPanner: null,
        loaded: true,
        error: null,
      };

      return true;
    } catch (error) {
      console.error('Failed to initialize audio:', error);
      this.state.error = error instanceof Error ? error.message : 'Unknown audio error';
      return false;
    }
  }

  async loadSound(id: string, url: string): Promise<boolean> {
    if (!this.audioContext) {
      console.warn('Audio context not initialized');
      return false;
    }

    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      
      this.sounds.set(id, audioBuffer);
      return true;
    } catch (error) {
      console.error(`Failed to load sound ${id}:`, error);
      return false;
    }
  }

  async loadSounds(soundConfigs: SoundConfig[]): Promise<void> {
    const loadPromises = soundConfigs.map(config =>
      this.loadSound(config.id, config.file)
    );
    
    await Promise.allSettled(loadPromises);
  }

  playSound(
    id: string,
    options: {
      volume?: number;
      loop?: boolean;
      spatialPosition?: [number, number, number];
      playbackRate?: number;
    } = {}
  ): void {
    if (!this.audioContext || !this.masterGain) {
      console.warn('Audio not initialized');
      return;
    }

    const buffer = this.sounds.get(id);
    if (!buffer) {
      console.warn(`Sound ${id} not found`);
      return;
    }

    // Stop existing source if playing
    this.stopSound(id);

    // Create new source
    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.loop = options.loop || false;
    source.playbackRate.value = options.playbackRate || 1;

    // Create gain node for this sound
    const gainNode = this.audioContext.createGain();
    gainNode.gain.value = options.volume || 1;

    // Create spatial audio if position provided
    if (options.spatialPosition) {
      const panner = this.audioContext.createPanner();
      panner.panningModel = 'HRTF';
      panner.distanceModel = 'inverse';
      panner.refDistance = 1;
      panner.maxDistance = 10000;
      panner.rolloffFactor = 1;
      panner.coneInnerAngle = 360;
      panner.coneOuterAngle = 0;
      panner.coneOuterGain = 0;

      const [x, y, z] = options.spatialPosition;
      panner.positionX.value = x;
      panner.positionY.value = y;
      panner.positionZ.value = z;

      source.connect(gainNode);
      gainNode.connect(panner);
      panner.connect(this.masterGain);
    } else {
      source.connect(gainNode);
      gainNode.connect(this.masterGain);
    }

    // Store source reference
    this.sources.set(id, source);

    // Clean up when sound ends
    source.onended = () => {
      this.sources.delete(id);
    };

    // Start playback
    source.start(0);
  }

  stopSound(id: string): void {
    const source = this.sources.get(id);
    if (source) {
      try {
        source.stop();
      } catch (error) {
        // Source might already be stopped
      }
      this.sources.delete(id);
    }
  }

  stopAllSounds(): void {
    this.sources.forEach((source, id) => {
      this.stopSound(id);
    });
  }

  setMasterVolume(volume: number): void {
    if (this.masterGain) {
      this.masterGain.gain.value = Math.max(0, Math.min(1, volume));
    }
  }

  getMasterVolume(): number {
    return this.masterGain?.gain.value || 0;
  }

  suspend(): void {
    if (this.audioContext && this.audioContext.state === 'running') {
      this.audioContext.suspend();
    }
  }

  resume(): void {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  getState(): AudioContextState {
    return { ...this.state };
  }

  dispose(): void {
    this.stopAllSounds();
    if (this.audioContext) {
      this.audioContext.close();
    }
    this.sounds.clear();
    this.sources.clear();
  }
}

// Global audio manager instance
export const audioManager = new AudioManager();

// Audio utility functions
export const initializeAudio = async (): Promise<boolean> => {
  return await audioManager.initialize();
};

export const playClickSound = () => {
  audioManager.playSound('click', { volume: 0.3 });
};

export const playHoverSound = () => {
  audioManager.playSound('hover', { volume: 0.2 });
};

export const playTickingSound = () => {
  audioManager.playSound('ticking', { 
    volume: 0.1, 
    loop: true,
    spatialPosition: [0, 0, 0]
  });
};

export const stopTickingSound = () => {
  audioManager.stopSound('ticking');
};