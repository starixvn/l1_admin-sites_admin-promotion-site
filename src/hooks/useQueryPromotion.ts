import { useQuery } from "@tanstack/react-query";

export const useQueryPromotion = (promotionId: string) => {
  return useQuery({
    queryKey: ["promotion", promotionId],
    queryFn: () => fetch(`/api/promotions/${promotionId}`).then(res => res.json()),
  });
};

export const useQueryPromotionPerformance = (promotionId: string, isBaseCurrency: boolean) => {
  return useQuery({
    queryKey: ["promotionPerformance", promotionId, isBaseCurrency],
    queryFn: () => fetch(`/api/promotions/${promotionId}/performance?isBaseCurrency=${isBaseCurrency}`).then(res => res.json()),
  });
};
