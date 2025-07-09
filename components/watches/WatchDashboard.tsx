'use client'

import React, { useState, useEffect, useRef, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'
import dynamic from 'next/dynamic'

// Import watch components
import McLarenRM1103Watch from './McLarenRM1103Watch'
import YohanBlakeRM5901 from './YohanBlakeRM5901'

// Import systems
import { useWatchTiming } from '../../hooks/useWatchTiming'
import { usePerformance } from '../../hooks/usePerformance'
import { useAudio } from '../../hooks/useAudio'
import { useSupabase } from '../../hooks/useSupabase'
import { WatchAnimationController } from '../../lib/animation-controller'
import { PerformanceManager } from '../../lib/performance-optimization'

// Types
interface WatchModel {
  id: string
  name: string
  component: React.ComponentType<any>
  colors: {
    primary: string
    accent: string
    case: string
  }
  audio: {
    tickFile: string
    chronographFile: string
    ambientFile: string
  }
  telemetrySource?: string
}

const WATCH_MODELS: WatchModel[] = [
  {
    id: 'rm-11-03-mclaren',
    name: 'RM 11-03 McLaren',
    component: McLarenRM1103Watch,
    colors: {
      primary: '#FF8000', // McLaren Orange
      accent: '#FF4500',  // Accent Red
      case: '#1A1A1A'     // Carbon Black
    },
    audio: {
      tickFile: '/audio/mclaren-tick.wav',
      chronographFile: '/audio/mclaren-chrono.wav',
      ambientFile: '/audio/f1-ambient.wav'
    },
    telemetrySource: 'f1'
  },
  {
    id: 'rm-59-01-yohan-blake',
    name: 'RM 59-01 Yohan Blake',
    component: YohanBlakeRM5901,
    colors: {
      primary: '#009739', // Jamaica Green
      accent: '#FFDB00',  // Jamaica Yellow
      case: '#1A1A1A'     // Carbon Black
    },
    audio: {
      tickFile: '/audio/yohan-tick.wav',
      chronographFile: '/audio/yohan-chrono.wav',
      ambientFile: '/audio/athletics-ambient.wav'
    },
    telemetrySource: 'athletics'
  }
]

interface WatchDashboardProps {
  className?: string
  initialWatch?: string
  enableAudio?: boolean
  enableAnimations?: boolean
  performanceMode?: 'auto' | 'high' | 'medium' | 'low'
}

const WatchDashboard: React.FC<WatchDashboardProps> = ({
  className = '',
  initialWatch = 'rm-11-03-mclaren',
  enableAudio = true,
  enableAnimations = true,
  performanceMode = 'auto'
}) => {
  // State management
  const [currentWatchId, setCurrentWatchId] = useState(initialWatch)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [userInteracted, setUserInteracted] = useState(false)
  const [environmentData, setEnvironmentData] = useState({
    temperature: 22,
    pressure: 1013,
    humidity: 45,
    altitude: 100
  })

  // Refs
  const containerRef = useRef<HTMLDivElement>(null)
  const animationControllerRef = useRef<WatchAnimationController | null>(null)
  const performanceManagerRef = useRef<PerformanceManager | null>(null)

  // Custom hooks
  const { timing, startTiming, stopTiming } = useWatchTiming({
    model: currentWatchId,
    enabled: !isTransitioning
  })
  
  const { 
    fps, 
    memoryUsage, 
    adaptiveQuality, 
    performanceMode: detectedMode 
  } = usePerformance({
    targetFps: 60,
    autoAdapt: performanceMode === 'auto'
  })

  const { 
    playSound, 
    setSpatialPosition, 
    setVolume,
    audioContext 
  } = useAudio({
    enabled: enableAudio && userInteracted
  })

  const { 
    realTimeData, 
    updateUserPreference,
    telemetryData 
  } = useSupabase()

  // Get current watch model
  const currentWatch = WATCH_MODELS.find(w => w.id === currentWatchId) || WATCH_MODELS[0]
  const CurrentWatchComponent = currentWatch.component

  // Initialize systems
  useEffect(() => {
    if (containerRef.current && enableAnimations) {
      animationControllerRef.current = new WatchAnimationController({
        container: containerRef.current,
        performanceMode: detectedMode || performanceMode
      })

      performanceManagerRef.current = new PerformanceManager({
        targetFps: 60,
        adaptiveQuality: true,
        onQualityChange: (quality) => {
          console.log('Performance quality adjusted to:', quality)
        }
      })
    }

    return () => {
      animationControllerRef.current?.dispose()
      performanceManagerRef.current?.dispose()
    }
  }, [enableAnimations, detectedMode, performanceMode])

  // Handle user interaction (required for audio)
  const handleUserInteraction = () => {
    if (!userInteracted) {
      setUserInteracted(true)
      // Initialize audio context
      if (audioContext && audioContext.state === 'suspended') {
        audioContext.resume()
      }
    }
  }

  // Watch switching animation
  const switchWatch = async (targetWatchId: string) => {
    if (targetWatchId === currentWatchId || isTransitioning) return

    setIsTransitioning(true)

    try {
      // Play switching sound
      if (enableAudio && userInteracted) {
        await playSound('/audio/mechanical-switch.wav', {
          volume: 0.3,
          spatial: false
        })
      }

      // Run atomic deconstruction/reconstruction animation
      if (animationControllerRef.current && enableAnimations) {
        await animationControllerRef.current.transitionWatch(currentWatchId, targetWatchId)
      }

      // Update state
      setCurrentWatchId(targetWatchId)
      
      // Update user preference in database
      await updateUserPreference('selectedWatch', targetWatchId)

      // Play new watch ambient sound
      const targetWatch = WATCH_MODELS.find(w => w.id === targetWatchId)
      if (targetWatch && enableAudio && userInteracted) {
        await playSound(targetWatch.audio.ambientFile, {
          volume: 0.1,
          loop: true,
          spatial: true
        })
      }

    } catch (error) {
      console.error('Watch transition failed:', error)
    } finally {
      setIsTransitioning(false)
    }
  }

  // Environmental effects
  useEffect(() => {
    const updateEnvironment = async () => {
      try {
        // Get location-based environmental data
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords
            
            // Fetch environmental data (weather API)
            const response = await fetch(
              `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${process.env.NEXT_PUBLIC_WEATHER_API_KEY}&units=metric`
            )
            
            if (response.ok) {
              const data = await response.json()
              setEnvironmentData({
                temperature: data.main.temp,
                pressure: data.main.pressure,
                humidity: data.main.humidity,
                altitude: data.main.sea_level || 1013
              })
            }
          })
        }
      } catch (error) {
        console.warn('Environmental data fetch failed:', error)
      }
    }

    updateEnvironment()
    const interval = setInterval(updateEnvironment, 300000) // Update every 5 minutes

    return () => clearInterval(interval)
  }, [])

  // Render performance overlay (dev mode)
  const renderPerformanceOverlay = () => {
    if (process.env.NODE_ENV !== 'development') return null

    return (
      <div className="absolute top-4 right-4 bg-black/80 text-white p-3 rounded-lg text-xs font-mono z-50">
        <div>FPS: {fps}</div>
        <div>Memory: {memoryUsage}MB</div>
        <div>Quality: {adaptiveQuality}</div>
        <div>Mode: {detectedMode || performanceMode}</div>
        <div>Watch: {currentWatch.name}</div>
        <div>Transitioning: {isTransitioning ? 'Yes' : 'No'}</div>
      </div>
    )
  }

  return (
    <div 
      ref={containerRef}
      className={`relative w-full h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 overflow-hidden ${className}`}
      onClick={handleUserInteraction}
      onTouchStart={handleUserInteraction}
    >
      {/* Background Canvas for 3D Effects */}
      <div className="absolute inset-0 z-0">
        <Canvas
          camera={{ position: [0, 0, 3], fov: 50 }}
          dpr={[1, 2]}
          performance={{ min: 0.1 }}
          className="w-full h-full"
        >
          <Suspense fallback={null}>
            <Environment preset="studio" />
            <OrbitControls 
              enableZoom={false} 
              enablePan={false}
              enableRotate={userInteracted}
              autoRotate={!isTransitioning}
              autoRotateSpeed={0.5}
            />
          </Suspense>
        </Canvas>
      </div>

      {/* Main Watch Display */}
      <div className="relative z-10 flex items-center justify-center h-full">
        <AnimatePresence mode="wait">
          {!isTransitioning && (
            <motion.div
              key={currentWatchId}
              initial={{ opacity: 0, scale: 0.8, rotateY: -90 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              exit={{ opacity: 0, scale: 0.8, rotateY: 90 }}
              transition={{ 
                duration: 0.8, 
                ease: [0.23, 1, 0.32, 1],
                stagger: 0.1 
              }}
              className="relative"
            >
              <div 
                className="watch-container"
                style={{
                  filter: `
                    hue-rotate(${environmentData.temperature * 2}deg) 
                    brightness(${1 + (environmentData.pressure - 1013) / 5000})
                    contrast(${1 + environmentData.humidity / 200})
                  `
                }}
              >
                <CurrentWatchComponent
                  timing={timing}
                  environmentData={environmentData}
                  telemetryData={telemetryData}
                  performanceMode={adaptiveQuality}
                  onInteraction={handleUserInteraction}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Watch Selector */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
        <div className="flex gap-4 bg-black/40 backdrop-blur-md rounded-full p-2">
          {WATCH_MODELS.map((watch) => (
            <button
              key={watch.id}
              onClick={() => switchWatch(watch.id)}
              disabled={isTransitioning}
              className={`
                relative px-6 py-3 rounded-full transition-all duration-300
                ${currentWatchId === watch.id 
                  ? 'bg-white/20 text-white shadow-lg' 
                  : 'text-white/60 hover:text-white hover:bg-white/10'
                }
                ${isTransitioning ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <span className="relative z-10 text-sm font-medium">
                {watch.name}
              </span>
              {currentWatchId === watch.id && (
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{ backgroundColor: watch.colors.primary }}
                  layoutId="activeWatchIndicator"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Environmental Info */}
      <div className="absolute top-8 left-8 z-20">
        <div className="bg-black/40 backdrop-blur-md rounded-lg p-4 text-white">
          <h3 className="text-lg font-semibold mb-2">Environmental</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>Temp: {environmentData.temperature}°C</div>
            <div>Humidity: {environmentData.humidity}%</div>
            <div>Pressure: {environmentData.pressure} hPa</div>
            <div>Altitude: {environmentData.altitude}m</div>
          </div>
        </div>
      </div>

      {/* Transition Overlay */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-30 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          >
            <div className="text-center text-white">
              <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-lg font-medium">Reconstructing Timepiece...</p>
              <p className="text-sm text-white/60 mt-1">Precision Assembly in Progress</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Performance Overlay */}
      {renderPerformanceOverlay()}

      {/* Audio State Indicator */}
      {enableAudio && (
        <div className="absolute top-8 right-8 z-20">
          <button
            onClick={() => setVolume(audioContext?.state === 'running' ? 0 : 0.5)}
            className="w-12 h-12 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/60 transition-colors"
          >
            {audioContext?.state === 'running' ? '🔊' : '🔇'}
          </button>
        </div>
      )}
    </div>
  )
}

export default WatchDashboard