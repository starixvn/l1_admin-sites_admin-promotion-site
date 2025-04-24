import { useQuery } from "@tanstack/react-query";
import type { CurrencyGroup } from "@/types/currencyGroup";

export const useCurrencyGroups = (partnerId: string | undefined) => {
  return useQuery<CurrencyGroup[]>({
    queryKey: ["currency-groups", partnerId],
    queryFn: async () => {
      if (!partnerId) throw new Error("Partner ID is required");

      const res = await fetch(`/api/currency-group/${partnerId}`);
      if (!res.ok) throw new Error("Failed to fetch currency groups");

      return res.json();
    },
    enabled: !!partnerId,
  });
};
