import { useEffect, useState, useRef } from 'react'
import { addEffect } from '@react-three/fiber'

export default function PerformanceMonitor() {
  const [fps, setFps] = useState(60)
  const [device, setDevice] = useState('')
  const frames = useRef(0)
  const lastTime = useRef(performance.now())
  
  useEffect(() => {
    const ua = navigator.userAgent
    const memory = navigator.deviceMemory || 'Unknown'
    let deviceInfo = 'Unknown Device'
    
    if (/iPhone/.test(ua)) {
      const model = ua.match(/iPhone OS (\d+)_/)?.[1] || 'Unknown'
      deviceInfo = `iPhone (iOS ${model}) - ${memory}GB RAM`
    } else if (/Android/.test(ua)) {
      deviceInfo = `Android - ${memory}GB RAM`
    } else {
      deviceInfo = `Desktop - ${memory}GB RAM`
    }
    
    setDevice(deviceInfo)
    
    // Use addEffect for frame counting outside of Canvas context
    const unsubscribe = addEffect(() => {
      frames.current++
      const currentTime = performance.now()
      if (currentTime >= lastTime.current + 1000) {
        setFps(Math.round((frames.current * 1000) / (currentTime - lastTime.current)))
        frames.current = 0
        lastTime.current = currentTime
      }
    })
    
    return () => unsubscribe()
  }, [])
  
  const fpsColor = fps >= 50 ? '#0f0' : fps >= 30 ? '#ff0' : '#f00'
  
  return (
    <div style={{
      position: 'absolute',
      top: 10,
      left: 10,
      color: fpsColor,
      fontFamily: 'monospace',
      fontSize: '12px',
      background: 'rgba(0,0,0,0.7)',
      padding: '5px 10px',
      borderRadius: '3px',
      pointerEvents: 'none',
      zIndex: 1000
    }}>
      <div>FPS: {fps}</div>
      <div style={{ color: '#fff', marginTop: '2px' }}>{device}</div>
    </div>
  )
}