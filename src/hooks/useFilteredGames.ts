import { useQuery } from "@tanstack/react-query";
import type { Game } from "@/types/game";
import type { GameType } from "@/constants/gameTypes";

export const useFilteredGames = (
  currencyGroups: string[],
  gameType: GameType | undefined
) => {
  return useQuery<Game[]>({
    queryKey: ["filteredGames", currencyGroups, gameType],
    queryFn: async () => {
      if (gameType === undefined) {
        return [];
      }
      const url =
        currencyGroups.length > 0
          ? `/api/games?type=${gameType}&currencyGroups=${currencyGroups.join(
              ","
            )}`
          : `/api/games?type=${gameType}`;

      const res = await fetch(url);
      if (!res.ok) {
        throw new Error("Failed to fetch games");
      }

      return res.json();
    },
    enabled: gameType !== undefined,
    staleTime: 1000 * 60 * 5,
  });
};
