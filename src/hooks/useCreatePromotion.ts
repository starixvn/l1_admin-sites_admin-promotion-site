import { useMutation } from "@tanstack/react-query";
type PromotionPayload = {
  name: string;
  operatorId: string;
  offeredSiteNames: string[];
  currencyGroups: string[];
  startDate: string;
  endDate: string;
  bonusItemCount: number;
  offeredPlayerIds: string[];
  gameConfigType: number;
  gameIds: number[];
  betLevels: { currencyGroup: string; betLevel: number }[];
};

export const useCreatePromotion = () => {
  return useMutation({
    mutationKey: ["createPromotion"],
    mutationFn: async (data: PromotionPayload): Promise<any> => {
      const res = await fetch(`/api/promotions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error?.message || "Failed to create promotion");
      }

      return res.json();
    },
  });
};
