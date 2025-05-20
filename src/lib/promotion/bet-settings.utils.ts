import { CurrencyGroupGame } from "@/types/currency-group-game";
import { GAME_TYPES } from "@/constants/gameTypes";
import { Operator } from "@/types/operator";

export const selectSuggestedBetLevel = (
  type: number,
  groupGames: CurrencyGroupGame[],
  gameIds?: number[]
): number => {
  const filtered = groupGames
    .filter((gg) => {
      if (type === GAME_TYPES.CLASSIC) {
        return gg.BetLevels?.length > 0 && gg.Enabled;
      }
      if (type === GAME_TYPES.CASCADING) {
        return gg.CoinValues?.length > 0 && gg.Enabled;
      }
      return false;
    })
    .sort((a, b) => b.GameId - a.GameId); // Sort descending by GameId

  if (filtered.length === 0) {
    console.log("No game found");
    return type === GAME_TYPES.CASCADING ? 1 : 0.1;
  }

  const selected = filtered[0];

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

export function createOperatorMap(operators: Operator[]): Map<string, string> {
  return new Map(operators.map((o) => [o.PartnerId, o.Name]));
}
