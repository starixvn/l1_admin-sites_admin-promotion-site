import { useQuery } from '@tanstack/react-query';
import { PromotionalTicketsResponse, PromotionalTicketsFilters } from '@/types/promotional-tickets';
import { pipe, appendIf } from '@/lib/functional.utils';

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
      const params = pipe<URLSearchParams>(
        (p) => { p.append('playerId', playerId); return p; },
        appendIf(filters.roundId, (v) => !!v, "roundId", (v) => v.toString()),
        appendIf(filters.startDate, (v) => !!v, "startDate", (v) => v.toString()),
        appendIf(filters.endDate, (v) => !!v, "endDate", (v) => v.toString()),
        appendIf(pageIndex, (v) => v !== undefined, "pageIndex", (v) => v.toString()),
        appendIf(pageSize, (v) => v !== undefined, "pageSize", (v) => v.toString()),
        appendIf(gameType, (v) => v !== undefined, "gameType", (v) => v.toString()),
        appendIf(currencyGroups, (v) => v.length > 0, "currencyGroups", (v) => v.join(",")),
        appendIf(playerPromotionId, (v) => v !== undefined, "playerPromotionId", (v) => v.toString())
      )(new URLSearchParams());

      const response = await fetch(`/api/promotions/${promotionId}/tickets?${params.toString()}`);
      
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
