'use client';

import { useState, useEffect, useCallback } from 'react';
import { WatchModel } from '@/types/watch';
import { supabase } from '@/lib/supabase';

export function useWatchData() {
  const [watches, setWatches] = useState<WatchModel[]>([]);
  const [selectedWatch, setSelectedWatch] = useState<WatchModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWatches = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: supabaseError } = await supabase
        .from('watches')
        .select('*')
        .order('name');

      if (supabaseError) {
        throw supabaseError;
      }

      const transformedWatches: WatchModel[] = data.map(watch => ({
        id: watch.id,
        name: watch.name,
        collection: watch.collection,
        movement: watch.specifications?.movement || {
          caliber: 'Unknown',
          type: 'automatic',
          frequency: 28800,
          powerReserve: 48,
          jewels: 25,
          features: [],
        },
        case: watch.specifications?.case || {
          material: 'titanium',
          diameter: 42,
          thickness: 12,
          waterResistance: 50,
          crystal: 'sapphire',
          finish: ['brushed'],
        },
        dial: watch.specifications?.dial || {
          color: 'black',
          material: 'carbon-tpt',
          indices: 'applied',
          hands: {
            hour: {
              shape: 'dauphine',
              material: 'titanium',
              color: 'white',
              luminous: true,
            },
            minute: {
              shape: 'dauphine',
              material: 'titanium',
              color: 'white',
              luminous: true,
            },
          },
        },
        strap: watch.specifications?.strap || {
          material: 'rubber',
          color: 'black',
          buckle: 'deployant',
          width: 20,
        },
        price: watch.price,
        availability: watch.availability as any,
        features: watch.specifications?.features || [],
        animations: watch.specifications?.animations || [],
        sounds: watch.specifications?.sounds || [],
      }));

      setWatches(transformedWatches);
    } catch (err) {
      console.error('Error fetching watches:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch watches');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchWatchById = useCallback(async (id: string): Promise<WatchModel | null> => {
    try {
      const { data, error: supabaseError } = await supabase
        .from('watches')
        .select('*')
        .eq('id', id)
        .single();

      if (supabaseError) {
        throw supabaseError;
      }

      if (!data) return null;

      const transformedWatch: WatchModel = {
        id: data.id,
        name: data.name,
        collection: data.collection,
        movement: data.specifications?.movement || {
          caliber: 'Unknown',
          type: 'automatic',
          frequency: 28800,
          powerReserve: 48,
          jewels: 25,
          features: [],
        },
        case: data.specifications?.case || {
          material: 'titanium',
          diameter: 42,
          thickness: 12,
          waterResistance: 50,
          crystal: 'sapphire',
          finish: ['brushed'],
        },
        dial: data.specifications?.dial || {
          color: 'black',
          material: 'carbon-tpt',
          indices: 'applied',
          hands: {
            hour: {
              shape: 'dauphine',
              material: 'titanium',
              color: 'white',
              luminous: true,
            },
            minute: {
              shape: 'dauphine',
              material: 'titanium',
              color: 'white',
              luminous: true,
            },
          },
        },
        strap: data.specifications?.strap || {
          material: 'rubber',
          color: 'black',
          buckle: 'deployant',
          width: 20,
        },
        price: data.price,
        availability: data.availability as any,
        features: data.specifications?.features || [],
        animations: data.specifications?.animations || [],
        sounds: data.specifications?.sounds || [],
      };

      return transformedWatch;
    } catch (err) {
      console.error('Error fetching watch:', err);
      return null;
    }
  }, []);

  const selectWatch = useCallback(async (watchId: string) => {
    const watch = await fetchWatchById(watchId);
    setSelectedWatch(watch);
  }, [fetchWatchById]);

  const filterWatches = useCallback((filters: {
    collection?: string;
    priceRange?: [number, number];
    material?: string;
    availability?: string;
  }) => {
    return watches.filter(watch => {
      if (filters.collection && watch.collection !== filters.collection) {
        return false;
      }
      
      if (filters.priceRange && watch.price) {
        const [min, max] = filters.priceRange;
        if (watch.price < min || watch.price > max) {
          return false;
        }
      }
      
      if (filters.material && watch.case.material !== filters.material) {
        return false;
      }
      
      if (filters.availability && watch.availability !== filters.availability) {
        return false;
      }
      
      return true;
    });
  }, [watches]);

  const searchWatches = useCallback((query: string) => {
    const lowercaseQuery = query.toLowerCase();
    return watches.filter(watch =>
      watch.name.toLowerCase().includes(lowercaseQuery) ||
      watch.collection.toLowerCase().includes(lowercaseQuery) ||
      watch.movement.caliber.toLowerCase().includes(lowercaseQuery)
    );
  }, [watches]);

  // Initialize data
  useEffect(() => {
    fetchWatches();
  }, [fetchWatches]);

  // Set up real-time subscriptions
  useEffect(() => {
    const subscription = supabase
      .channel('watches_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'watches' }, 
        () => {
          fetchWatches(); // Refetch when data changes
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchWatches]);

  return {
    watches,
    selectedWatch,
    loading,
    error,
    fetchWatches,
    fetchWatchById,
    selectWatch,
    filterWatches,
    searchWatches,
    setSelectedWatch,
  };
}