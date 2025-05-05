import { CurrencyGroupGame } from "@/types/currency-group-game";
import { useQuery } from "@tanstack/react-query";

export const useCurrencyGroupGames = (currencyGroupId?: string) => {
  return useQuery<CurrencyGroupGame[]>({
    queryKey: ["currencyGroupGames", currencyGroupId],
    enabled: !!currencyGroupId,
    queryFn: async () => {
      const response = await fetch(
        `/api/currency-group-games?currencyGroupId=${currencyGroupId}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch currency group games");
      }
      return response.json();
    },
  });
};
