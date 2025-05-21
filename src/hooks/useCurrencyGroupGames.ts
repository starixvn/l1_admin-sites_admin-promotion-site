import { CurrencyGroupGame } from "@/types/currency-group-game";
import { useMutation } from "@tanstack/react-query";

export const useCurrencyGroupGames = () => {
  return useMutation({
    mutationFn: async (currencyGroupId: string): Promise<CurrencyGroupGame[]> => {
      const response = await fetch(`/api/currency-group-games?currencyGroupId=${currencyGroupId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch currency group games");
      }
      return response.json();
    },
  });
};
