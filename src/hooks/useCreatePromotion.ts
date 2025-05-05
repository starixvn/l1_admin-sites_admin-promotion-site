import { useMutation } from "@tanstack/react-query";
import type { CreatePromotionResponse, PromotionPayload } from "@/types/promotion";
export const useCreatePromotion = () => {
  return useMutation({
    mutationKey: ["createPromotion"],
    mutationFn: async (data: PromotionPayload): Promise<CreatePromotionResponse> => {
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
