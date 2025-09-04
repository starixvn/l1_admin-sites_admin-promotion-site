import { useQuery } from "@tanstack/react-query";
import { Currency } from "@/types/currencies";

const fetchCurrencies = async (): Promise<Currency[]> => {
  const response = await fetch('/api/currencies');
  if (!response.ok) {
    throw new Error('Failed to fetch currencies');
  }
  return response.json();
};

export default function useCurrencies() {
  return useQuery<Currency[], Error>({
    queryKey: ['currencies'],
    queryFn: fetchCurrencies,
  });
}
