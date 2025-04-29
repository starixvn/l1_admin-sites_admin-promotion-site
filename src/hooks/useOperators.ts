'use client';

import { useQuery } from '@tanstack/react-query';

interface Operator {
  id: string;
  name: string;
}

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