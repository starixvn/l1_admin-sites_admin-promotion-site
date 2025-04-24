import { useMutation } from "@tanstack/react-query";
import type { PromotionFormValues } from "@/app/promotion/create/PromotionForm"; // hoặc đường dẫn tới type dữ liệu gửi lên
import type { Promotion } from "@/types/promotion"; // hoặc schema bạn dùng để mô tả promotion trả về

export const useCreatePromotion = () => {
  return useMutation({
    mutationKey: ["createPromotion"],
    mutationFn: async (data: PromotionFormValues): Promise<Promotion> => {
        debugger
      const res = await fetch(`/api/promotions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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
