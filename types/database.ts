// Richard Mille Watch Dashboard TypeScript Types

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Enum types
export type WatchModel = 
  | 'RM_50_03_MCLAREN'
  | 'RM_59_01_YOHAN_BLAKE'
  | 'RM_70_01_ALAIN_PROST'
  | 'RM_11_03_MCLAREN'
  | 'RM_65_01_MCLAREN'

export type CustomizationType = 
  | 'strap_material'
  | 'case_finish'
  | 'dial_color'
  | 'complications'
  | 'engraving'

export type TelemetrySource = 
  | 'mclaren_f1'
  | 'athletics'
  | 'aviation'
  | 'marine'

export type EventType = '100m' | '200m' | '4x100m' | 'training'

export type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

// Database table interfaces
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          id: string
          user_id: string
          selected_watch: WatchModel
          customizations: Json
          display_settings: Json
          notification_preferences: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          selected_watch: WatchModel
          customizations?: Json
          display_settings?: Json
          notification_preferences?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          selected_watch?: WatchModel
          customizations?: Json
          display_settings?: Json
          notification_preferences?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_preferences_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      watch_metrics: {
        Row: {
          id: string
          user_id: string
          watch_model: WatchModel
          timestamp: string
          timing_precision_ms: number | null
          power_reserve_hours: number | null
          torque_nm: number | null
          amplitude_degrees: number | null
          beat_error_ms: number | null
          temperature_celsius: number | null
          magnetic_field_gauss: number | null
          shock_resistance_g: number | null
          water_resistance_bar: number | null
          chronograph_data: Json
          tourbillon_data: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          watch_model: WatchModel
          timestamp?: string
          timing_precision_ms?: number | null
          power_reserve_hours?: number | null
          torque_nm?: number | null
          amplitude_degrees?: number | null
          beat_error_ms?: number | null
          temperature_celsius?: number | null
          magnetic_field_gauss?: number | null
          shock_resistance_g?: number | null
          water_resistance_bar?: number | null
          chronograph_data?: Json
          tourbillon_data?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          watch_model?: WatchModel
          timestamp?: string
          timing_precision_ms?: number | null
          power_reserve_hours?: number | null
          torque_nm?: number | null
          amplitude_degrees?: number | null
          beat_error_ms?: number | null
          temperature_celsius?: number | null
          magnetic_field_gauss?: number | null
          shock_resistance_g?: number | null
          water_resistance_bar?: number | null
          chronograph_data?: Json
          tourbillon_data?: Json
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "watch_metrics_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      f1_telemetry: {
        Row: {
          id: string
          user_id: string
          session_id: string
          timestamp: string
          lap_number: number | null
          sector: number | null
          speed_kmh: number | null
          rpm: number | null
          gear: number | null
          throttle_position: number | null
          brake_position: number | null
          steering_angle: number | null
          g_force_lateral: number | null
          g_force_longitudinal: number | null
          g_force_vertical: number | null
          tire_pressure_fl: number | null
          tire_pressure_fr: number | null
          tire_pressure_rl: number | null
          tire_pressure_rr: number | null
          tire_temp_fl: number | null
          tire_temp_fr: number | null
          tire_temp_rl: number | null
          tire_temp_rr: number | null
          engine_temp: number | null
          fuel_level: number | null
          drs_status: boolean | null
          ers_deployment: number | null
          track_name: string | null
          weather_conditions: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          session_id: string
          timestamp?: string
          lap_number?: number | null
          sector?: number | null
          speed_kmh?: number | null
          rpm?: number | null
          gear?: number | null
          throttle_position?: number | null
          brake_position?: number | null
          steering_angle?: number | null
          g_force_lateral?: number | null
          g_force_longitudinal?: number | null
          g_force_vertical?: number | null
          tire_pressure_fl?: number | null
          tire_pressure_fr?: number | null
          tire_pressure_rl?: number | null
          tire_pressure_rr?: number | null
          tire_temp_fl?: number | null
          tire_temp_fr?: number | null
          tire_temp_rl?: number | null
          tire_temp_rr?: number | null
          engine_temp?: number | null
          fuel_level?: number | null
          drs_status?: boolean | null
          ers_deployment?: number | null
          track_name?: string | null
          weather_conditions?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          session_id?: string
          timestamp?: string
          lap_number?: number | null
          sector?: number | null
          speed_kmh?: number | null
          rpm?: number | null
          gear?: number | null
          throttle_position?: number | null
          brake_position?: number | null
          steering_angle?: number | null
          g_force_lateral?: number | null
          g_force_longitudinal?: number | null
          g_force_vertical?: number | null
          tire_pressure_fl?: number | null
          tire_pressure_fr?: number | null
          tire_pressure_rl?: number | null
          tire_pressure_rr?: number | null
          tire_temp_fl?: number | null
          tire_temp_fr?: number | null
          tire_temp_rl?: number | null
          tire_temp_rr?: number | null
          engine_temp?: number | null
          fuel_level?: number | null
          drs_status?: boolean | null
          ers_deployment?: number | null
          track_name?: string | null
          weather_conditions?: Json
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "f1_telemetry_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      athletics_data: {
        Row: {
          id: string
          user_id: string
          session_id: string
          timestamp: string
          event_type: EventType | null
          reaction_time_ms: number | null
          split_times: Json
          max_speed_kmh: number | null
          average_speed_kmh: number | null
          stride_length_m: number | null
          stride_frequency_hz: number | null
          ground_contact_time_ms: number | null
          vertical_oscillation_cm: number | null
          power_output_watts: number | null
          heart_rate_bpm: number | null
          lactate_level_mmol: number | null
          cadence_spm: number | null
          biomechanics_data: Json
          environmental_conditions: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          session_id: string
          timestamp?: string
          event_type?: EventType | null
          reaction_time_ms?: number | null
          split_times?: Json
          max_speed_kmh?: number | null
          average_speed_kmh?: number | null
          stride_length_m?: number | null
          stride_frequency_hz?: number | null
          ground_contact_time_ms?: number | null
          vertical_oscillation_cm?: number | null
          power_output_watts?: number | null
          heart_rate_bpm?: number | null
          lactate_level_mmol?: number | null
          cadence_spm?: number | null
          biomechanics_data?: Json
          environmental_conditions?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          session_id?: string
          timestamp?: string
          event_type?: EventType | null
          reaction_time_ms?: number | null
          split_times?: Json
          max_speed_kmh?: number | null
          average_speed_kmh?: number | null
          stride_length_m?: number | null
          stride_frequency_hz?: number | null
          ground_contact_time_ms?: number | null
          vertical_oscillation_cm?: number | null
          power_output_watts?: number | null
          heart_rate_bpm?: number | null
          lactate_level_mmol?: number | null
          cadence_spm?: number | null
          biomechanics_data?: Json
          environmental_conditions?: Json
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "athletics_data_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      environmental_data: {
        Row: {
          id: string
          user_id: string
          timestamp: string
          temperature_celsius: number | null
          humidity_percent: number | null
          pressure_hpa: number | null
          altitude_meters: number | null
          wind_speed_kmh: number | null
          wind_direction_degrees: number | null
          uv_index: number | null
          air_quality_index: number | null
          magnetic_declination: number | null
          solar_radiation_wm2: number | null
          location_lat: number | null
          location_lng: number | null
          location_accuracy_m: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          timestamp?: string
          temperature_celsius?: number | null
          humidity_percent?: number | null
          pressure_hpa?: number | null
          altitude_meters?: number | null
          wind_speed_kmh?: number | null
          wind_direction_degrees?: number | null
          uv_index?: number | null
          air_quality_index?: number | null
          magnetic_declination?: number | null
          solar_radiation_wm2?: number | null
          location_lat?: number | null
          location_lng?: number | null
          location_accuracy_m?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          timestamp?: string
          temperature_celsius?: number | null
          humidity_percent?: number | null
          pressure_hpa?: number | null
          altitude_meters?: number | null
          wind_speed_kmh?: number | null
          wind_direction_degrees?: number | null
          uv_index?: number | null
          air_quality_index?: number | null
          magnetic_declination?: number | null
          solar_radiation_wm2?: number | null
          location_lat?: number | null
          location_lng?: number | null
          location_accuracy_m?: number | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "environmental_data_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      audio_settings: {
        Row: {
          id: string
          user_id: string
          master_volume: number | null
          notification_volume: number | null
          alarm_volume: number | null
          spatial_audio_enabled: boolean | null
          eq_settings: Json
          audio_profiles: Json
          active_profile: string | null
          haptic_feedback_enabled: boolean | null
          haptic_intensity: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          master_volume?: number | null
          notification_volume?: number | null
          alarm_volume?: number | null
          spatial_audio_enabled?: boolean | null
          eq_settings?: Json
          audio_profiles?: Json
          active_profile?: string | null
          haptic_feedback_enabled?: boolean | null
          haptic_intensity?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          master_volume?: number | null
          notification_volume?: number | null
          alarm_volume?: number | null
          spatial_audio_enabled?: boolean | null
          eq_settings?: Json
          audio_profiles?: Json
          active_profile?: string | null
          haptic_feedback_enabled?: boolean | null
          haptic_intensity?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "audio_settings_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      time_sync: {
        Row: {
          id: string
          user_id: string
          client_time: string
          server_time: string
          offset_ms: number | null
          latency_ms: number | null
          ntp_server: string | null
          sync_accuracy_ms: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          client_time: string
          server_time?: string
          offset_ms?: number | null
          latency_ms?: number | null
          ntp_server?: string | null
          sync_accuracy_ms?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          client_time?: string
          server_time?: string
          offset_ms?: number | null
          latency_ms?: number | null
          ntp_server?: string | null
          sync_accuracy_ms?: number | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "time_sync_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      api_integrations: {
        Row: {
          id: string
          user_id: string
          integration_name: string
          endpoint: string
          request_method: RequestMethod
          request_payload: Json | null
          response_status: number | null
          response_payload: Json | null
          latency_ms: number | null
          error_message: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          integration_name: string
          endpoint: string
          request_method: RequestMethod
          request_payload?: Json | null
          response_status?: number | null
          response_payload?: Json | null
          latency_ms?: number | null
          error_message?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          integration_name?: string
          endpoint?: string
          request_method?: RequestMethod
          request_payload?: Json | null
          response_status?: number | null
          response_payload?: Json | null
          latency_ms?: number | null
          error_message?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "api_integrations_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      latest_watch_metrics: {
        Row: {
          user_id: string | null
          watch_model: WatchModel | null
          timing_precision_ms: number | null
          power_reserve_hours: number | null
          temperature_celsius: number | null
          timestamp: string | null
        }
        Relationships: []
      }
      f1_session_summary: {
        Row: {
          user_id: string | null
          session_id: string | null
          track_name: string | null
          total_laps: number | null
          max_speed: number | null
          avg_speed: number | null
          first_lap: number | null
          last_lap: number | null
          session_start: string | null
          session_end: string | null
        }
        Relationships: []
      }
      athletics_personal_bests: {
        Row: {
          user_id: string | null
          event_type: EventType | null
          session_id: string | null
          reaction_time_ms: number | null
          max_speed_kmh: number | null
          timestamp: string | null
        }
        Relationships: []
      }
      dashboard_stats: {
        Row: {
          user_id: string | null
          total_metrics: number | null
          total_f1_sessions: number | null
          total_athletics_sessions: number | null
          avg_timing_precision: number | null
          max_f1_speed: number | null
          max_sprint_speed: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_user_real_time_data: {
        Args: {
          user_uuid: string
        }
        Returns: {
          latest_metrics: Json
          f1_session: Json
          athletics_session: Json
          environmental: Json
        }[]
      }
      sync_time_across_users: {
        Args: Record<PropertyKey, never>
        Returns: {
          user_id: string
          offset_ms: number
          server_time: string
        }[]
      }
      get_dashboard_data: {
        Args: {
          user_uuid: string
        }
        Returns: {
          user_stats: Json
          recent_metrics: Json
          performance_summary: Json
        }[]
      }
      refresh_dashboard_stats: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      watch_model: WatchModel
      customization_type: CustomizationType
      telemetry_source: TelemetrySource
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types for specific data structures
export interface WatchCustomizations {
  strap_material?: 'leather' | 'rubber' | 'carbon' | 'titanium'
  case_finish?: 'brushed' | 'polished' | 'pvd' | 'ceramic'
  dial_color?: 'black' | 'white' | 'blue' | 'red' | 'carbon'
  complications?: string[]
  engraving?: string
}

export interface DisplaySettings {
  theme: 'light' | 'dark' | 'auto'
  units: 'metric' | 'imperial'
  timezone: string
  language: string
}

export interface NotificationPreferences {
  performance_alerts: boolean
  maintenance_reminders: boolean
  event_notifications: boolean
}

export interface ChronographData {
  split_times?: number[]
  lap_times?: number[]
  sector_times?: number[]
  best_lap?: number
  total_time?: number
}

export interface TourbillonData {
  rotation_speed?: number
  beat_rate?: number
  escapement_efficiency?: number
  power_reserve_impact?: number
}

export interface WeatherConditions {
  temperature?: number
  humidity?: number
  pressure?: number
  wind_speed?: number
  wind_direction?: number
  track_temp?: number
  air_temp?: number
  conditions?: 'dry' | 'wet' | 'mixed'
}

export interface BiomechanicsData {
  left_right_balance?: number
  vertical_power?: number
  horizontal_power?: number
  stance_time?: number
  flight_time?: number
  contact_angle?: number
}

export interface EQSettings {
  bass: number
  mid: number
  treble: number
  presence: number
}

export interface AudioProfiles {
  [profileName: string]: EQSettings
}

export interface SplitTimes {
  distance: number
  time: number
  speed: number
}

// Real-time subscription types
export interface RealtimePayload<T = any> {
  schema: string
  table: string
  commit_timestamp: string
  eventType: 'INSERT' | 'UPDATE' | 'DELETE'
  new?: T
  old?: T
  errors?: string[]
}

// API response types
export interface APIResponse<T = any> {
  data: T | null
  error: string | null
  status: number
  message?: string
}

// Utility types
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]