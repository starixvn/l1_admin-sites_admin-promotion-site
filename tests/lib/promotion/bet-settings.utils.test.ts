import { GAME_TYPES } from "@/constants/gameTypes";
import {
  selectSuggestedBetLevel,
  validateBetRows,
} from "@/lib/promotion/bet-settings.utils";

describe("selectSuggestedBetLevel", () => {
  const mockGames = [
    {
      GameId: 1,
      DefaultBetLevel: 2,
      DefaultCoinValue: 5,
      GroupId: "cg-1",
      GameName: "Game 1",
      Enabled: true,
      CoinValues: [1, 2, 3],
      BetLevels: [1, 2, 3],
    },
    {
      GameId: 2,
      DefaultBetLevel: 1.5,
      DefaultCoinValue: 3,
      GroupId: "cg-1",
      GameName: "Game 2",
      Enabled: true,
      CoinValues: [1, 2, 3],
      BetLevels: [1, 2, 3],
    },
  ];

  it("returns fallback when no matching game", () => {
    const result = selectSuggestedBetLevel(GAME_TYPES.CLASSIC, mockGames, [99]);
    expect(result).toBe(0.1);
  });

  it("returns one of the matched DefaultBetLevel", () => {
    const result = selectSuggestedBetLevel(GAME_TYPES.CLASSIC, mockGames, [1]);
    expect(result).toBe(2);
  });

  it("returns DefaultCoinValue when cascading", () => {
    const result = selectSuggestedBetLevel(GAME_TYPES.CASCADING, mockGames, [
      2,
    ]);
    expect(result).toBe(3);
  });
});

describe("validateBetRows", () => {
  it("returns empty set if all rows are valid", () => {
    const rows = [{ id: "1", enabled: true, betLevel: 1 }];
    expect(validateBetRows(rows).size).toBe(0);
  });

  it("detects invalid row with zero betLevel", () => {
    const rows = [{ id: "1", enabled: true, betLevel: 0 }];
    expect(validateBetRows(rows)).toEqual(new Set(["1"]));
  });
});
