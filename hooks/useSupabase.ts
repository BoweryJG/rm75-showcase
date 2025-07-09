import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Database } from '../types/database'

type UserPreferences = Database['public']['Tables']['user_preferences']['Row']
type F1Telemetry = Database['public']['Tables']['f1_telemetry']['Row']
type AthleticsData = Database['public']['Tables']['athletics_data']['Row']

interface UseSupabaseReturn {
  realTimeData: {
    currentTime: Date
    synchronized: boolean
    participants: number
  }
  telemetryData: {
    f1?: F1Telemetry[]
    athletics?: AthleticsData[]
  }
  userPreferences: UserPreferences | null
  updateUserPreference: (key: string, value: any) => Promise<void>
  isLoading: boolean
  error: Error | null
}

export const useSupabase = (): UseSupabaseReturn => {
  const [realTimeData, setRealTimeData] = useState({
    currentTime: new Date(),
    synchronized: true,
    participants: 1
  })
  
  const [telemetryData, setTelemetryData] = useState<{
    f1?: F1Telemetry[]
    athletics?: AthleticsData[]
  }>({})
  
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Initialize user preferences
  useEffect(() => {
    const initializeUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          const { data, error } = await supabase
            .from('user_preferences')
            .select('*')
            .eq('user_id', user.id)
            .single()

          if (error && error.code !== 'PGRST116') {
            throw error
          }

          if (data) {
            setUserPreferences(data)
          } else {
            // Create default preferences
            const defaultPrefs = {
              user_id: user.id,
              selected_watch: 'rm-11-03-mclaren',
              audio_enabled: true,
              performance_mode: 'auto' as const,
              environmental_effects: true,
              haptic_feedback: true
            }

            const { data: newPrefs, error: createError } = await supabase
              .from('user_preferences')
              .insert(defaultPrefs)
              .select()
              .single()

            if (createError) throw createError
            setUserPreferences(newPrefs)
          }
        }
      } catch (err) {
        setError(err as Error)
        console.error('Failed to initialize user:', err)
      } finally {
        setIsLoading(false)
      }
    }

    initializeUser()
  }, [])

  // Real-time synchronization
  useEffect(() => {
    const syncChannel = supabase
      .channel('time_sync')
      .on('broadcast', { event: 'time_update' }, ({ payload }) => {
        setRealTimeData(prev => ({
          ...prev,
          currentTime: new Date(payload.timestamp),
          synchronized: true,
          participants: payload.participants || prev.participants
        }))
      })
      .subscribe()

    // Send heartbeat every 5 seconds
    const heartbeat = setInterval(() => {
      syncChannel.send({
        type: 'broadcast',
        event: 'time_update',
        payload: {
          timestamp: new Date().toISOString(),
          participants: realTimeData.participants
        }
      })
    }, 5000)

    return () => {
      clearInterval(heartbeat)
      supabase.removeChannel(syncChannel)
    }
  }, [realTimeData.participants])

  // Telemetry data subscription
  useEffect(() => {
    const f1Channel = supabase
      .channel('f1_telemetry')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'f1_telemetry' },
        (payload) => {
          setTelemetryData(prev => ({
            ...prev,
            f1: [...(prev.f1 || []), payload.new as F1Telemetry].slice(-100) // Keep last 100 entries
          }))
        }
      )
      .subscribe()

    const athleticsChannel = supabase
      .channel('athletics_data')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'athletics_data' },
        (payload) => {
          setTelemetryData(prev => ({
            ...prev,
            athletics: [...(prev.athletics || []), payload.new as AthleticsData].slice(-100)
          }))
        }
      )
      .subscribe()

    // Initial data fetch
    const fetchInitialData = async () => {
      try {
        const [f1Response, athleticsResponse] = await Promise.all([
          supabase
            .from('f1_telemetry')
            .select('*')
            .order('timestamp', { ascending: false })
            .limit(20),
          supabase
            .from('athletics_data')
            .select('*')
            .order('timestamp', { ascending: false })
            .limit(20)
        ])

        setTelemetryData({
          f1: f1Response.data || [],
          athletics: athleticsResponse.data || []
        })
      } catch (err) {
        console.error('Failed to fetch initial telemetry data:', err)
      }
    }

    fetchInitialData()

    return () => {
      supabase.removeChannel(f1Channel)
      supabase.removeChannel(athleticsChannel)
    }
  }, [])

  const updateUserPreference = async (key: string, value: any) => {
    try {
      if (!userPreferences) return

      const updates = {
        ...userPreferences,
        [key]: value,
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('user_preferences')
        .update(updates)
        .eq('id', userPreferences.id)
        .select()
        .single()

      if (error) throw error
      setUserPreferences(data)
    } catch (err) {
      console.error('Failed to update user preference:', err)
      setError(err as Error)
    }
  }

  return {
    realTimeData,
    telemetryData,
    userPreferences,
    updateUserPreference,
    isLoading,
    error
  }
}