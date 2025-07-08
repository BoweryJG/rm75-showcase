import { useState, useEffect, useRef, useCallback } from 'react'

interface AudioOptions {
  volume?: number
  loop?: boolean
  spatial?: boolean
  position?: [number, number, number]
  fadeIn?: number
  fadeOut?: number
}

interface UseAudioProps {
  enabled?: boolean
  masterVolume?: number
  spatialEnabled?: boolean
}

interface UseAudioReturn {
  audioContext: AudioContext | null
  playSound: (url: string, options?: AudioOptions) => Promise<void>
  stopSound: (url: string) => void
  stopAllSounds: () => void
  setSpatialPosition: (x: number, y: number, z: number) => void
  setVolume: (volume: number) => void
  setMasterVolume: (volume: number) => void
  isPlaying: (url: string) => boolean
  loadSound: (url: string) => Promise<AudioBuffer>
  createSoundChain: () => AudioChain
}

class AudioChain {
  private audioContext: AudioContext
  private gainNode: GainNode
  private pannerNode: PannerNode
  private filterNode: BiquadFilterNode
  private reverbNode: ConvolverNode
  
  constructor(audioContext: AudioContext) {
    this.audioContext = audioContext
    
    // Create audio nodes
    this.gainNode = audioContext.createGain()
    this.pannerNode = audioContext.createPanner()
    this.filterNode = audioContext.createBiquadFilter()
    this.reverbNode = audioContext.createConvolver()
    
    // Configure panner for 3D audio
    this.pannerNode.panningModel = 'HRTF'
    this.pannerNode.distanceModel = 'inverse'
    this.pannerNode.refDistance = 1
    this.pannerNode.maxDistance = 10000
    this.pannerNode.rolloffFactor = 1
    this.pannerNode.coneInnerAngle = 360
    this.pannerNode.coneOuterAngle = 0
    this.pannerNode.coneOuterGain = 0
    
    // Configure filter
    this.filterNode.type = 'lowpass'
    this.filterNode.frequency.value = 20000
    this.filterNode.Q.value = 1
    
    // Chain nodes: source -> filter -> panner -> gain -> destination
    this.filterNode.connect(this.pannerNode)
    this.pannerNode.connect(this.gainNode)
    this.gainNode.connect(audioContext.destination)
  }
  
  connect(source: AudioBufferSourceNode) {
    source.connect(this.filterNode)
    return this
  }
  
  setPosition(x: number, y: number, z: number) {
    this.pannerNode.positionX.value = x
    this.pannerNode.positionY.value = y
    this.pannerNode.positionZ.value = z
    return this
  }
  
  setVolume(volume: number) {
    this.gainNode.gain.value = volume
    return this
  }
  
  setFilter(frequency: number, q: number = 1) {
    this.filterNode.frequency.value = frequency
    this.filterNode.Q.value = q
    return this
  }
  
  fadeIn(duration: number = 1) {
    const currentTime = this.audioContext.currentTime
    this.gainNode.gain.setValueAtTime(0, currentTime)
    this.gainNode.gain.linearRampToValueAtTime(1, currentTime + duration)
    return this
  }
  
  fadeOut(duration: number = 1) {
    const currentTime = this.audioContext.currentTime
    this.gainNode.gain.linearRampToValueAtTime(0, currentTime + duration)
    return this
  }
}

export const useAudio = ({ 
  enabled = true, 
  masterVolume = 0.5,
  spatialEnabled = true 
}: UseAudioProps = {}): UseAudioReturn => {
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null)
  const [volume, setVolumeState] = useState(masterVolume)
  const [listenerPosition, setListenerPosition] = useState<[number, number, number]>([0, 0, 0])
  
  const audioBuffersRef = useRef<Map<string, AudioBuffer>>(new Map())
  const activeSourcesRef = useRef<Map<string, AudioBufferSourceNode[]>>(new Map())
  const masterGainRef = useRef<GainNode | null>(null)

  // Initialize AudioContext
  useEffect(() => {
    if (!enabled) return

    const initAudioContext = () => {
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
        const masterGain = ctx.createGain()
        masterGain.connect(ctx.destination)
        masterGain.gain.value = volume
        
        masterGainRef.current = masterGain
        setAudioContext(ctx)
        
        // Set up listener for spatial audio
        if (spatialEnabled && ctx.listener) {
          ctx.listener.positionX.value = listenerPosition[0]
          ctx.listener.positionY.value = listenerPosition[1]
          ctx.listener.positionZ.value = listenerPosition[2]
          ctx.listener.forwardX.value = 0
          ctx.listener.forwardY.value = 0
          ctx.listener.forwardZ.value = -1
          ctx.listener.upX.value = 0
          ctx.listener.upY.value = 1
          ctx.listener.upZ.value = 0
        }
      } catch (error) {
        console.error('Failed to initialize AudioContext:', error)
      }
    }

    initAudioContext()

    return () => {
      if (audioContext) {
        audioContext.close()
      }
    }
  }, [enabled])

  // Load audio buffer
  const loadSound = useCallback(async (url: string): Promise<AudioBuffer> => {
    if (!audioContext) throw new Error('AudioContext not initialized')
    
    // Check cache first
    const cached = audioBuffersRef.current.get(url)
    if (cached) return cached

    try {
      const response = await fetch(url)
      const arrayBuffer = await response.arrayBuffer()
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
      
      audioBuffersRef.current.set(url, audioBuffer)
      return audioBuffer
    } catch (error) {
      console.error(`Failed to load audio: ${url}`, error)
      throw error
    }
  }, [audioContext])

  // Create audio chain
  const createSoundChain = useCallback((): AudioChain => {
    if (!audioContext) throw new Error('AudioContext not initialized')
    return new AudioChain(audioContext)
  }, [audioContext])

  // Play sound with options
  const playSound = useCallback(async (url: string, options: AudioOptions = {}): Promise<void> => {
    if (!audioContext || !enabled) return

    try {
      const audioBuffer = await loadSound(url)
      const source = audioContext.createBufferSource()
      source.buffer = audioBuffer
      source.loop = options.loop || false

      // Create audio chain
      const chain = createSoundChain()
        .setVolume(options.volume || 1)
        .connect(source)

      if (options.spatial && options.position) {
        chain.setPosition(...options.position)
      }

      if (options.fadeIn) {
        chain.fadeIn(options.fadeIn)
      }

      // Track active sources
      const activeSources = activeSourcesRef.current.get(url) || []
      activeSources.push(source)
      activeSourcesRef.current.set(url, activeSources)

      // Handle source end
      source.onended = () => {
        const sources = activeSourcesRef.current.get(url) || []
        const index = sources.indexOf(source)
        if (index > -1) {
          sources.splice(index, 1)
          activeSourcesRef.current.set(url, sources)
        }
      }

      // Start playback
      source.start(0)

      // Handle fade out
      if (options.fadeOut) {
        setTimeout(() => {
          chain.fadeOut(options.fadeOut!)
          setTimeout(() => {
            source.stop()
          }, options.fadeOut! * 1000)
        }, (audioBuffer.duration - options.fadeOut!) * 1000)
      }

    } catch (error) {
      console.error(`Failed to play sound: ${url}`, error)
    }
  }, [audioContext, enabled, loadSound, createSoundChain])

  // Stop specific sound
  const stopSound = useCallback((url: string) => {
    const sources = activeSourcesRef.current.get(url) || []
    sources.forEach(source => {
      try {
        source.stop()
      } catch (error) {
        // Source might already be stopped
      }
    })
    activeSourcesRef.current.set(url, [])
  }, [])

  // Stop all sounds
  const stopAllSounds = useCallback(() => {
    activeSourcesRef.current.forEach((sources, url) => {
      sources.forEach(source => {
        try {
          source.stop()
        } catch (error) {
          // Source might already be stopped
        }
      })
    })
    activeSourcesRef.current.clear()
  }, [])

  // Check if sound is playing
  const isPlaying = useCallback((url: string): boolean => {
    const sources = activeSourcesRef.current.get(url) || []
    return sources.length > 0
  }, [])

  // Set spatial position
  const setSpatialPosition = useCallback((x: number, y: number, z: number) => {
    setListenerPosition([x, y, z])
    if (audioContext?.listener && spatialEnabled) {
      audioContext.listener.positionX.value = x
      audioContext.listener.positionY.value = y
      audioContext.listener.positionZ.value = z
    }
  }, [audioContext, spatialEnabled])

  // Set volume
  const setVolume = useCallback((newVolume: number) => {
    setVolumeState(newVolume)
    if (masterGainRef.current) {
      masterGainRef.current.gain.value = newVolume
    }
  }, [])

  // Set master volume (alias for setVolume)
  const setMasterVolume = setVolume

  return {
    audioContext,
    playSound,
    stopSound,
    stopAllSounds,
    setSpatialPosition,
    setVolume,
    setMasterVolume,
    isPlaying,
    loadSound,
    createSoundChain
  }
}