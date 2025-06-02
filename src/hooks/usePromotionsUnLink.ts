import { useState, useEffect } from 'react';
import axios from 'axios';
import { Promotion } from '@/types/promotion';

export function usePromotionsUnLink() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        setLoading(true);
        setError(null);
          // Call the unmapped-not-started endpoint (POST)
          const response = await axios.post('/api/promotions/unmapped-not-started');
          setPromotions(response.data || []);
          return;
      } catch (err) {
        console.error('Error fetching promotions:', err);
        setError('Failed to fetch promotions');
      } finally {
        setLoading(false);
      }
    };

    fetchPromotions();
  }, []);

  return { promotions, loading, error };
} 