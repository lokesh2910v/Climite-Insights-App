import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { ClimateData } from '../types/climate';

export const useClimateData = (stateName: string, dataType: keyof ClimateData) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<{ year: string; value: number }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1. Fetch state ID by name
        const { data: stateData, error: stateError } = await supabase
          .from('states')
          .select('id')
          .eq('name', stateName)
          .single();

        if (stateError) throw stateError;
        if (!stateData) throw new Error('State not found');

        // 2. Fetch climate data by state ID
        const { data: rawClimateData, error: climateError } = await supabase
          .from('climate_data')
          .select(`year, ${dataType}`)
          .eq('state_id', stateData.id)
          .order('year', { ascending: true });

        if (climateError) throw climateError;

        const climateData = rawClimateData as ClimateData[];

        // 3. Transform climate data
        const mapped = climateData.map((item) => {
          const value = item[dataType];
          return {
            year: item.year.toString(),
            value: typeof value === 'number' ? value : 0,
          };
        });

        setData(mapped);
      } catch (err) {
        console.error('Error fetching climate data:', err);
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [stateName, dataType]);

  return { data, loading, error };
};
