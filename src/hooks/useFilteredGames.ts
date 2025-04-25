import { useQuery } from "@tanstack/react-query";
import type { Game } from "@/types/game";
import type { GameType } from "@/constants/gameTypes";

export const useFilteredGames = (
  partnerId: string,
  gameType: GameType | undefined
) => {
  return useQuery<Game[]>({
    queryKey: ["filteredGames", partnerId ?? "no-partner", gameType],
    queryFn: async () => {
      if (gameType === undefined) return [];
      const url = partnerId
        ? `/api/games/${partnerId}/${gameType}`
        : `/api/games?type=${gameType}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch games");

      return res.json();
    },
    enabled: gameType !== undefined,
    staleTime: 1000 * 60 * 5, // 5 minutes (tùy bạn cấu hình)
  });
};
