import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import type { Game } from "@/types/game";
import type { GameType } from "@/constants/gameTypes";

export const useFilteredGames = (
  currencyGroups: string[],
  gameType: GameType | undefined,
  options?: Omit<UseQueryOptions<Game[]>, "queryKey" | "queryFn">
) => {
  const shouldFetch =
    gameType !== undefined &&
    Array.isArray(currencyGroups) &&
    currencyGroups.length > 0;

  return useQuery<Game[]>({
    queryKey: ["filteredGames", currencyGroups, gameType],
    queryFn: async () => {
      const url = `/api/games?type=${gameType}&currencyGroups=${currencyGroups.join(
        ","
      )}`;
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error("Failed to fetch games");
      }
      return res.json();
    },
    enabled: shouldFetch,
    ...options,
  });
};
