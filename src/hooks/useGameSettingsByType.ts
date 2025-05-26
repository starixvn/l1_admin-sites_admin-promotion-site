import { useQuery } from "@tanstack/react-query";
import { Game } from "@/types/game";

export const useGameSettingsByType = (type: number) => {
  return useQuery<Game[]>({
    queryKey: ["gameSettingsByType", type],
    queryFn: async () => {
      const res = await fetch(`/api/games?type=${type}`);
      if (!res.ok) {
        throw new Error("Failed to fetch game settings by type");
      }
      return res.json();
    },
    enabled: typeof type === "number",
  });
};
