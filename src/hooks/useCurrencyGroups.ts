import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import type { CurrencyGroup } from "@/types/currency-group";

export const useCurrencyGroups = (
  partnerId: string | undefined,
  options?: Omit<UseQueryOptions<CurrencyGroup[]>, "queryKey" | "queryFn">
) => {
  return useQuery<CurrencyGroup[]>({
    queryKey: ["currency-groups", partnerId],
    queryFn: async () => {
      if (!partnerId) {
        throw new Error("Partner ID is required");
      }

      const res = await fetch(`/api/currency-group/${partnerId}`);
      if (!res.ok) {
        throw new Error("Failed to fetch currency groups");
      }
      return res.json();
    },
    enabled: !!partnerId,
    ...options,
  });
};
