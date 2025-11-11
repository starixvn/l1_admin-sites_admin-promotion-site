import { useQuery } from '@tanstack/react-query';
import { PromotionalTicketsResponse, PromotionalTicketsFilters } from '@/types/promotional-tickets';

interface UsePromotionalTicketsProps {
  promotionId: string;
  playerPromotionId: string;
  gameType: number;
  currencyGroups: string[];
  playerId: string;
  filters: PromotionalTicketsFilters;
  pageIndex: number;
  pageSize: number;
  enabled?: boolean;
}

export function usePromotionalTickets({
  promotionId,
  playerPromotionId,
  gameType,
  currencyGroups,
  playerId,
  filters,
  pageIndex,
  pageSize,
  enabled = true,
}: UsePromotionalTicketsProps) {
  return useQuery({
    queryKey: [
      'promotional-tickets',
      promotionId,
      playerPromotionId,
      gameType,
      currencyGroups,
      playerId,
      filters.roundId,
      filters.startDate,
      filters.endDate,
      pageIndex,
      pageSize,
    ],
    queryFn: async (): Promise<PromotionalTicketsResponse> => {
      const params = new URLSearchParams();
      params.append('playerId', playerId);
      
      if (filters.roundId) {
        params.append("roundId", filters.roundId);
      }
      if (filters.startDate) {
        params.append("startDate", filters.startDate);
      }
      if (filters.endDate) {
        params.append("endDate", filters.endDate);
      }
      if (pageIndex !== undefined)
      {
        params.append("pageIndex", pageIndex.toString());
      }
      if (pageSize !== undefined)
      {
        params.append("pageSize", pageSize.toString());  
      }
      if (gameType !== undefined)
      {
        params.append("gameType", gameType.toString());
      }
      if (currencyGroups.length > 0)
      {
        params.append("currencyGroups", currencyGroups.join(","));
      }
      if (playerPromotionId !== undefined)
      {
        params.append("playerPromotionId", playerPromotionId.toString());
      }

      const response = await fetch(`/api/promotions/${promotionId}/performance/players/tickets?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.json();
    },
    enabled: enabled && !!promotionId && !!playerId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
