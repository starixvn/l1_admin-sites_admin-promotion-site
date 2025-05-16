import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import type { Game } from "@/types/game";
import type { GameType } from "@/constants/gameTypes";

interface UseFilteredGamesParams
  extends Omit<UseQueryOptions<Game[]>, "queryKey" | "queryFn"> {
  currencyGroups: string[];
  gameType: GameType | undefined;
  gameIds?: number[];
}

export const useFilteredGames = ({
  currencyGroups,
  gameType,
  gameIds = [],
  ...options
}: UseFilteredGamesParams) => {
  const shouldFetch =
    gameType !== undefined &&
    Array.isArray(currencyGroups) &&
    currencyGroups.length > 0;

  return useQuery<Game[]>({
    queryKey: ["filteredGames", currencyGroups, gameType, gameIds],
    queryFn: async () => {
      const params = new URLSearchParams();

      if (typeof gameType !== "undefined") {
        params.append("type", gameType.toString());
      }

      if (currencyGroups.length > 0) {
        params.append("currencyGroups", currencyGroups.join(","));
      }

      if (gameIds.length > 0) {
        params.append("gameIds", gameIds.join(","));
      }

      const url = `/api/games?${params.toString()}`;

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
