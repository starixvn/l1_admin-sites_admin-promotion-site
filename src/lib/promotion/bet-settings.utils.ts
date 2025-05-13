import { CurrencyGroupGame } from "@/types/currency-group-game";
import { GAME_TYPES } from "@/constants/gameTypes";

export const selectSuggestedBetLevel = (
  type: number,
  groupGames: CurrencyGroupGame[],
  gameIds?: number[]
): number => {
  const filtered = groupGames.filter((gg) => gameIds?.includes(gg.GameId));
  if (filtered.length === 0) {
    return type === GAME_TYPES.CASCADING ? 1 : 0.1;
  }
  const index = getSecureRandomIndex(filtered.length);
  const selected = filtered[index];
  return type === GAME_TYPES.CASCADING
    ? selected.DefaultCoinValue ?? 1
    : selected.DefaultBetLevel ?? 0.1;
};

export const validateBetRows = (
  rows: {
    id: string;
    enabled: boolean;
    betLevel: number;
  }[]
): Set<string> => {
  const invalid = new Set<string>();
  rows.forEach((r) => {
    if (r.enabled && r.betLevel === 0) {
      invalid.add(r.id);
    }
  });
  return invalid;
};

export function getSecureRandomIndex(max: number): number {
  const array = new Uint32Array(1);
  window.crypto.getRandomValues(array);
  return array[0] % max;
}

export const getTotalBet = (betLevel: number, gameType: number) => {
  return gameType === GAME_TYPES.CASCADING ? 1 * betLevel * 20 : betLevel * 25;
};
