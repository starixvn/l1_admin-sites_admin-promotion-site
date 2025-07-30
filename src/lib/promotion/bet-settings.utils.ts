import { CurrencyGroupGame } from "@/types/currency-group-game";
import { GAME_TYPES } from "@/constants/gameTypes";
import { Operator } from "@/types/operator";

export const selectSuggestedBetLevel = (
  type: number,
  groupGames: CurrencyGroupGame[]
): { game: CurrencyGroupGame | null; value: number } => {
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
    .sort((a, b) => b.GameId - a.GameId);
    if (filtered.length === 0) {
      return {
        game: null,
        value: 0,
      };
    }
  const selected = filtered[0];

  const value =
    type === GAME_TYPES.CASCADING
      ? selected?.DefaultCoinValue ?? 0
      : selected?.DefaultBetLevel ?? 0;

  return { game: selected, value };
};

export const validateBetRows = (
  rows: {
    id: string;
    enabled: boolean;
    baseValue: number;
  }[]
): Set<string> => {
  const invalid = new Set<string>();
  rows.forEach((r) => {
    if (r.enabled && r.baseValue === 0) {
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
