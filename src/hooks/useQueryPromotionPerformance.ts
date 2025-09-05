import { PlayersResponse, PromotionPerformanceResponse } from "@/types/performance-report";
import { Promotion } from "@/types/promotion";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

export const useQueryPromotion = (promotionId: string) => {
  return useQuery<Promotion, Error>({
    queryKey: ["promotion", promotionId],
    queryFn: () => fetch(`/api/promotions/${promotionId}`).then(res => res.json()),
  });
};

export const useQueryPromotionPerformance = (promotionId: string) => {
  return useQuery<PromotionPerformanceResponse, Error>({
    queryKey: ["promotionPerformance", promotionId],
    queryFn: () => fetch(`/api/promotions/${promotionId}/performance`).then(res => res.json()),
  });
};


export const useQueryPromotionPlayers = (
  promotionId: string, 
  pageIndex = 1, 
  pageSize = 10, 
  filters?: any,
  options?: {
    enabled?: boolean;
  }
) => {
  const queryParams = new URLSearchParams({
    pageIndex: pageIndex.toString(),
    pageSize: pageSize.toString(),
  });

  // Add filters to query params if they exist
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });
  }

  return useQuery<PlayersResponse, Error>({
    queryKey: ["promotionPlayers", promotionId, pageIndex, pageSize, filters],
    queryFn: () => fetch(`/api/promotions/${promotionId}/performance/players?${queryParams}`).then(res => res.json()),
    placeholderData: keepPreviousData,
    enabled: options?.enabled ?? true,
  });
};
