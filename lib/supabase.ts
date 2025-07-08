import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Database types
export interface Database {
  public: {
    Tables: {
      watches: {
        Row: {
          id: string;
          name: string;
          model: string;
          collection: string;
          price: number | null;
          availability: string;
          specifications: any;
          images: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          model: string;
          collection: string;
          price?: number | null;
          availability: string;
          specifications?: any;
          images?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          model?: string;
          collection?: string;
          price?: number | null;
          availability?: string;
          specifications?: any;
          images?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
      user_preferences: {
        Row: {
          id: string;
          user_id: string;
          favorite_watches: string[];
          view_preferences: any;
          audio_enabled: boolean;
          performance_mode: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          favorite_watches?: string[];
          view_preferences?: any;
          audio_enabled?: boolean;
          performance_mode?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          favorite_watches?: string[];
          view_preferences?: any;
          audio_enabled?: boolean;
          performance_mode?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      analytics: {
        Row: {
          id: string;
          event_type: string;
          watch_id: string | null;
          user_id: string | null;
          session_id: string;
          data: any;
          timestamp: string;
        };
        Insert: {
          id?: string;
          event_type: string;
          watch_id?: string | null;
          user_id?: string | null;
          session_id: string;
          data?: any;
          timestamp?: string;
        };
        Update: {
          id?: string;
          event_type?: string;
          watch_id?: string | null;
          user_id?: string | null;
          session_id?: string;
          data?: any;
          timestamp?: string;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}