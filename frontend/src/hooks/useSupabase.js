import { useState, useEffect, useCallback } from 'react'
import { supabase, subscribeToWatchUpdates, fetchWatches } from '../lib/supabase'

// Mock data for development
const mockData = {
  marketValue: 425000,
  authentication: {
    verified: true,
    certificateNumber: 'RM75-01-2025-001',
    lastVerified: new Date().toISOString()
  },
  ownership: {
    currentOwner: 'Private Collection',
    acquisitionDate: '2025-01-15',
    provenance: 'Authorized Dealer'
  },
  environmental: {
    temperature: 22.5,
    humidity: 45,
    pressure: 1013.25
  },
  movements: {
    dailyRate: '+2.1s',
    amplitude: 285,
    beatError: 0.2
  },
  social: {
    views: 15423,
    likes: 892,
    shares: 124
  }
}

export function useSupabase(variant) {
  const [data, setData] = useState(mockData)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [connected, setConnected] = useState(false)

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // In a real implementation, fetch data based on variant
        if (supabase) {
          const { data: watchData, error: fetchError } = await fetchWatches({
            variant: variant
          })
          
          if (fetchError) throw fetchError
          
          if (watchData && watchData.length > 0) {
            // Transform real data to match our structure
            setData({
              ...mockData,
              marketValue: watchData[0].price || mockData.marketValue,
              authentication: watchData[0].authentication || mockData.authentication
            })
          }
          
          setConnected(true)
        } else {
          // Use mock data
          setTimeout(() => {
            setData({
              ...mockData,
              marketValue: mockData.marketValue + Math.random() * 10000 - 5000
            })
            setLoading(false)
          }, 1000)
        }
      } catch (err) {
        console.error('Error fetching data:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [variant])

  // Subscribe to real-time updates
  useEffect(() => {
    if (!supabase) {
      // Simulate real-time updates with mock data
      const interval = setInterval(() => {
        setData(prev => ({
          ...prev,
          marketValue: prev.marketValue + (Math.random() - 0.5) * 1000,
          environmental: {
            ...prev.environmental,
            temperature: 22.5 + (Math.random() - 0.5) * 0.5,
            humidity: 45 + (Math.random() - 0.5) * 2
          },
          movements: {
            ...prev.movements,
            amplitude: 285 + (Math.random() - 0.5) * 10
          },
          social: {
            ...prev.social,
            views: prev.social.views + Math.floor(Math.random() * 10)
          }
        }))
      }, 3000)

      return () => clearInterval(interval)
    }

    // Real Supabase subscription
    const unsubscribe = subscribeToWatchUpdates((payload) => {
      console.log('Real-time update:', payload)
      
      if (payload.new && payload.new.variant === variant) {
        setData(prev => ({
          ...prev,
          ...payload.new.data
        }))
      }
    })

    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [variant])

  const updateData = useCallback(async (updates) => {
    try {
      setData(prev => ({ ...prev, ...updates }))
      
      // In real implementation, update Supabase
      if (supabase) {
        // await updateWatch(watchId, updates)
      }
    } catch (err) {
      console.error('Error updating data:', err)
      setError(err.message)
    }
  }, [])

  return {
    data,
    loading,
    error,
    connected,
    updateData
  }
}