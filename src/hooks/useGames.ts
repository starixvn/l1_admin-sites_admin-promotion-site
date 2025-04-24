import { useQuery } from "@tanstack/react-query";
import type { Game } from "@/types/game";

export const useGames = (gameType: number | undefined) => {
  return useQuery<Game[]>({
    queryKey: ["games", gameType],
    queryFn: async (): Promise<Game[]> => {
      if (!gameType) return [];
      const res = await fetch(`/api/games?type=${gameType}`);
      if (!res.ok) throw new Error("Failed to fetch games");
      return res.json();
    },
    enabled: !!gameType,
  });
};
