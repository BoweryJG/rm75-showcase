import { useEffect, useState } from 'react'
import { useFrame } from '@react-three/fiber'

export default function PerformanceMonitor() {
  const [fps, setFps] = useState(60)
  const [device, setDevice] = useState('')
  
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
  }, [])
  
  let frames = 0
  let lastTime = performance.now()
  
  useFrame(() => {
    frames++
    const currentTime = performance.now()
    if (currentTime >= lastTime + 1000) {
      setFps(Math.round((frames * 1000) / (currentTime - lastTime)))
      frames = 0
      lastTime = currentTime
    }
  })
  
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