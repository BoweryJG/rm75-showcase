import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Check if Supabase is configured
const isSupabaseConfigured = supabaseUrl && supabaseAnonKey;

// Create Supabase client (only if configured)
export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    })
  : null;

// Type definitions for watch data
/**
 * @typedef {Object} WatchMovement
 * @property {string} id - Unique identifier
 * @property {string} brand - Watch brand (e.g., "Rolex", "Patek Philippe")
 * @property {string} model - Watch model
 * @property {string} reference - Reference number
 * @property {string} serial_number - Serial number
 * @property {number} year - Year of manufacture
 * @property {string} condition - Condition (e.g., "Excellent", "Good", "Fair")
 * @property {string} box_papers - Box and papers status
 * @property {number} price - Price in USD
 * @property {string} currency - Currency code
 * @property {string} location - Location
 * @property {string} dealer - Dealer name
 * @property {string} listing_url - URL to listing
 * @property {string[]} images - Array of image URLs
 * @property {Date} created_at - Creation timestamp
 * @property {Date} updated_at - Last update timestamp
 * @property {boolean} is_available - Availability status
 * @property {Object} specifications - Additional specifications
 */

/**
 * @typedef {Object} ConnectionState
 * @property {boolean} isConnected - Whether connected to Supabase
 * @property {boolean} isConnecting - Whether currently connecting
 * @property {Error|null} error - Connection error if any
 * @property {number} retryCount - Number of connection retries
 */

// Connection state management
let connectionState = {
  isConnected: false,
  isConnecting: false,
  error: null,
  retryCount: 0
};

const connectionListeners = new Set();

export function subscribeToConnectionState(callback) {
  connectionListeners.add(callback);
  // Immediately call with current state
  callback(connectionState);
  
  return () => {
    connectionListeners.delete(callback);
  };
}

function updateConnectionState(updates) {
  connectionState = { ...connectionState, ...updates };
  connectionListeners.forEach(listener => listener(connectionState));
}

// Mock data for development
const mockWatches = [
  {
    id: '1',
    brand: 'Rolex',
    model: 'Submariner',
    reference: '126610LN',
    serial_number: 'MOCK123456',
    year: 2023,
    condition: 'Excellent',
    box_papers: 'Full Set',
    price: 13500,
    currency: 'USD',
    location: 'New York, USA',
    dealer: 'Mock Luxury Watches',
    listing_url: 'https://example.com/watch/1',
    images: [
      'https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=800',
      'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=800'
    ],
    created_at: new Date('2024-01-15'),
    updated_at: new Date('2024-01-15'),
    is_available: true,
    specifications: {
      case_material: 'Stainless Steel',
      case_diameter: '41mm',
      movement: 'Automatic',
      water_resistance: '300m'
    }
  },
  {
    id: '2',
    brand: 'Patek Philippe',
    model: 'Nautilus',
    reference: '5711/1A',
    serial_number: 'MOCK789012',
    year: 2022,
    condition: 'Mint',
    box_papers: 'Full Set',
    price: 125000,
    currency: 'USD',
    location: 'Geneva, Switzerland',
    dealer: 'Mock Swiss Timepieces',
    listing_url: 'https://example.com/watch/2',
    images: [
      'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800',
      'https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?w=800'
    ],
    created_at: new Date('2024-01-10'),
    updated_at: new Date('2024-01-10'),
    is_available: true,
    specifications: {
      case_material: 'Stainless Steel',
      case_diameter: '40mm',
      movement: 'Automatic',
      complications: 'Date'
    }
  },
  {
    id: '3',
    brand: 'Omega',
    model: 'Speedmaster Professional',
    reference: '310.30.42.50.01.002',
    serial_number: 'MOCK345678',
    year: 2023,
    condition: 'New',
    box_papers: 'Full Set',
    price: 6500,
    currency: 'USD',
    location: 'London, UK',
    dealer: 'Mock British Watches',
    listing_url: 'https://example.com/watch/3',
    images: [
      'https://images.unsplash.com/photo-1600003014755-ba31aa59c4b6?w=800',
      'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=800'
    ],
    created_at: new Date('2024-01-20'),
    updated_at: new Date('2024-01-20'),
    is_available: true,
    specifications: {
      case_material: 'Stainless Steel',
      case_diameter: '42mm',
      movement: 'Manual Wind',
      crystal: 'Hesalite'
    }
  }
];

// Helper functions for data fetching with retry logic
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // Start with 1 second

async function retryWithBackoff(fn, retries = MAX_RETRIES) {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0) {
      const delay = RETRY_DELAY * (MAX_RETRIES - retries + 1);
      console.warn(`Retrying after ${delay}ms... (${retries} retries left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return retryWithBackoff(fn, retries - 1);
    }
    throw error;
  }
}

// Fetch all watches
export async function fetchWatches(filters = {}) {
  if (!isSupabaseConfigured) {
    console.log('Using mock data - Supabase not configured');
    return { data: mockWatches, error: null };
  }

  updateConnectionState({ isConnecting: true, error: null });

  try {
    const result = await retryWithBackoff(async () => {
      let query = supabase
        .from('watches')
        .select('*')
        .eq('is_available', true)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.brand) {
        query = query.eq('brand', filters.brand);
      }
      if (filters.minPrice) {
        query = query.gte('price', filters.minPrice);
      }
      if (filters.maxPrice) {
        query = query.lte('price', filters.maxPrice);
      }
      if (filters.condition) {
        query = query.eq('condition', filters.condition);
      }
      if (filters.search) {
        query = query.or(`brand.ilike.%${filters.search}%,model.ilike.%${filters.search}%,reference.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data;
    });

    updateConnectionState({ isConnected: true, isConnecting: false, retryCount: 0 });
    return { data: result, error: null };
  } catch (error) {
    console.error('Error fetching watches:', error);
    updateConnectionState({ 
      isConnected: false, 
      isConnecting: false, 
      error,
      retryCount: connectionState.retryCount + 1 
    });
    
    // Fallback to mock data on error
    return { data: mockWatches, error };
  }
}

// Fetch single watch by ID
export async function fetchWatchById(id) {
  if (!isSupabaseConfigured) {
    const watch = mockWatches.find(w => w.id === id);
    return { data: watch || null, error: watch ? null : new Error('Watch not found') };
  }

  try {
    const result = await retryWithBackoff(async () => {
      const { data, error } = await supabase
        .from('watches')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    });

    return { data: result, error: null };
  } catch (error) {
    console.error('Error fetching watch:', error);
    
    // Fallback to mock data
    const watch = mockWatches.find(w => w.id === id);
    return { data: watch || null, error };
  }
}

// Real-time subscription setup
let watchSubscription = null;

export function subscribeToWatchUpdates(callback) {
  if (!isSupabaseConfigured) {
    console.log('Real-time subscriptions not available - Supabase not configured');
    return () => {}; // Return no-op unsubscribe function
  }

  // Clean up existing subscription
  if (watchSubscription) {
    watchSubscription.unsubscribe();
  }

  watchSubscription = supabase
    .channel('watch-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'watches'
      },
      (payload) => {
        console.log('Real-time update:', payload);
        callback(payload);
      }
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('Subscribed to watch updates');
        updateConnectionState({ isConnected: true });
      } else if (status === 'CHANNEL_ERROR') {
        console.error('Subscription error');
        updateConnectionState({ isConnected: false, error: new Error('Subscription failed') });
      }
    });

  // Return unsubscribe function
  return () => {
    if (watchSubscription) {
      watchSubscription.unsubscribe();
      watchSubscription = null;
    }
  };
}

// Insert new watch (for admin functionality)
export async function insertWatch(watchData) {
  if (!isSupabaseConfigured) {
    return { 
      data: null, 
      error: new Error('Cannot insert watches - Supabase not configured') 
    };
  }

  try {
    const result = await retryWithBackoff(async () => {
      const { data, error } = await supabase
        .from('watches')
        .insert([watchData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    });

    return { data: result, error: null };
  } catch (error) {
    console.error('Error inserting watch:', error);
    return { data: null, error };
  }
}

// Update watch
export async function updateWatch(id, updates) {
  if (!isSupabaseConfigured) {
    return { 
      data: null, 
      error: new Error('Cannot update watches - Supabase not configured') 
    };
  }

  try {
    const result = await retryWithBackoff(async () => {
      const { data, error } = await supabase
        .from('watches')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    });

    return { data: result, error: null };
  } catch (error) {
    console.error('Error updating watch:', error);
    return { data: null, error };
  }
}

// Delete watch (soft delete by setting is_available to false)
export async function deleteWatch(id) {
  return updateWatch(id, { is_available: false });
}

// Get unique brands for filtering
export async function fetchBrands() {
  if (!isSupabaseConfigured) {
    const brands = [...new Set(mockWatches.map(w => w.brand))];
    return { data: brands, error: null };
  }

  try {
    const result = await retryWithBackoff(async () => {
      const { data, error } = await supabase
        .from('watches')
        .select('brand')
        .eq('is_available', true);
      
      if (error) throw error;
      
      const uniqueBrands = [...new Set(data.map(item => item.brand))].sort();
      return uniqueBrands;
    });

    return { data: result, error: null };
  } catch (error) {
    console.error('Error fetching brands:', error);
    
    // Fallback to mock data brands
    const brands = [...new Set(mockWatches.map(w => w.brand))];
    return { data: brands, error };
  }
}

// Initialize connection monitoring
if (isSupabaseConfigured) {
  // Check connection on startup
  fetchWatches({ limit: 1 }).then(({ error }) => {
    if (!error) {
      console.log('Successfully connected to Supabase');
    }
  });
}

// Export configuration status
export { isSupabaseConfigured };