import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useControls } from 'leva'

export default function QuantumZoomCamera() {
  const { camera } = useThree()
  const targetZoom = useRef(1)
  const currentZoom = useRef(1)
  
  const { zoom } = useControls('Quantum Zoom', {
    zoom: {
      value: 1,
      min: 1,
      max: 10000,
      step: 1,
      label: 'Magnification'
    }
  })

  useEffect(() => {
    targetZoom.current = zoom
  }, [zoom])

  useFrame(() => {
    // Smooth zoom interpolation
    currentZoom.current += (targetZoom.current - currentZoom.current) * 0.1
    
    // Apply zoom to camera
    const zoomFactor = Math.log10(currentZoom.current + 1) + 1
    camera.position.z = 5 / zoomFactor
    camera.updateProjectionMatrix()
  })

  // Handle mouse wheel
  useEffect(() => {
    const handleWheel = (event) => {
      event.preventDefault()
      const delta = event.deltaY * -0.001
      targetZoom.current = Math.max(1, Math.min(10000, targetZoom.current * (1 + delta)))
    }

    window.addEventListener('wheel', handleWheel, { passive: false })
    return () => window.removeEventListener('wheel', handleWheel)
  }, [])

  return null
}