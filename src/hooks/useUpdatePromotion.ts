import { PromotionPayload } from "@/types/promotion";
import { useMutation } from "@tanstack/react-query";

async function updatePromotion(id: string, payload: PromotionPayload) {
  const res = await fetch(`/api/promotions/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData?.error || "Failed to update promotion");
  }

  return res.json();
}

export function useUpdatePromotion() {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PromotionPayload }) =>
      updatePromotion(id, data),
  });
}
