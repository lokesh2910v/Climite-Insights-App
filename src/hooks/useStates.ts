import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { State } from '../types/climate';

export const useStates = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [states, setStates] = useState<State[]>([]);

  useEffect(() => {
    const fetchStates = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from('states')
          .select('*')
          .order('name');

        if (error) throw error;
        setStates(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchStates();
  }, []);

  return { states, loading, error };
};