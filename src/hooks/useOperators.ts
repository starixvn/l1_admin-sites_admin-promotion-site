import { useQuery } from "@tanstack/react-query";
import type { Operator } from "@/types/operator";

export const useOperators = () => {
  return useQuery<Operator[]>({
    queryKey: ["operators"],
    queryFn: async (): Promise<Operator[]> => {
      const res = await fetch("/api/operators");
      if (!res.ok) throw new Error("Failed to fetch operators");
      return res.json();
    },
  });
};
