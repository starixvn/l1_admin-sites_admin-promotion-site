'use client';

import { Operator } from '@/types/operator';
import { useQuery } from '@tanstack/react-query';

export const useOperators = () => {
  return useQuery<Operator[]>({
    queryKey: ['operators'],
    queryFn: async () => {
      const response = await fetch('/api/operators');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    }
  });
};