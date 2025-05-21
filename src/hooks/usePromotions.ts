import { useState, useEffect } from 'react';
import axios from 'axios';
import { Promotion } from '@/types/promotion';

interface UsePromotionsOptions {
  mode?: 'create' | 'edit';
  operatorId?: string;
}

export function usePromotions({ mode = 'edit', operatorId }: UsePromotionsOptions = {}) {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        
        if (mode === 'create') {
          // For create mode, only fetch not_started promotions with pageSize=100
          params.append('status', 'not_started');
          params.append('pageIndex', '1');
          params.append('pageSize', '100');
        } else {
          // For edit mode, fetch all promotions with pageSize=1000
          params.append('pageIndex', '1');
          params.append('pageSize', '1000');
        }

        if (operatorId) {
          params.append('operator', operatorId);
        }

        const response = await axios.get(`/api/promotions?${params.toString()}`);
        setPromotions(response.data.items || []);
      } catch (err) {
        console.error('Error fetching promotions:', err);
        setError('Failed to fetch promotions');
      } finally {
        setLoading(false);
      }
    };

    fetchPromotions();
  }, [mode, operatorId]);

  return { promotions, loading, error };
} 