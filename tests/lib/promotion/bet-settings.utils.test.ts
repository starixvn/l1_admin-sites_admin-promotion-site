import { GAME_TYPES } from "@/constants/gameTypes";
import {
  selectSuggestedBetLevel,
  validateBetRows,
  createOperatorMap
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
  it("returns fallback value 1 when no matching game and gameType is CASCADING", () => {
    const result = selectSuggestedBetLevel(GAME_TYPES.CASCADING, mockGames, [
      99,
    ]);
    expect(result).toBe(1);
  });

  it("returns DefaultBetLevel when both games match but only one is returned randomly", () => {
    const gameIds = [1, 2];
    const result = selectSuggestedBetLevel(
      GAME_TYPES.CLASSIC,
      mockGames,
      gameIds
    );
    expect([1.5, 2]).toContain(result); // random case
  });

  it("returns DefaultCoinValue when both games match for CASCADING type", () => {
    const gameIds = [1, 2];
    const result = selectSuggestedBetLevel(
      GAME_TYPES.CASCADING,
      mockGames,
      gameIds
    );
    expect([3, 5]).toContain(result); // random case
  });

  it("returns fallback if gameIds is undefined", () => {
    const result = selectSuggestedBetLevel(
      GAME_TYPES.CLASSIC,
      mockGames,
      undefined
    );
    expect(result).toBe(0.1);
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
  it("ignores disabled rows even if betLevel is 0", () => {
    const rows = [
      { id: "1", enabled: false, betLevel: 0 },
      { id: "2", enabled: false, betLevel: 0 },
    ];
    expect(validateBetRows(rows)).toEqual(new Set());
  });

  it("returns multiple invalid row ids if more than one enabled has 0", () => {
    const rows = [
      { id: "1", enabled: true, betLevel: 0 },
      { id: "2", enabled: true, betLevel: 0 },
      { id: "3", enabled: true, betLevel: 1 },
    ];
    expect(validateBetRows(rows)).toEqual(new Set(["1", "2"]));
  });

  it("handles empty row array", () => {
    expect(validateBetRows([])).toEqual(new Set());
  });
});

describe("createOperatorMap", () => {
  it("should return a map of PartnerId to Name", () => {
    const mockOperators = [
      { PartnerId: "op1", Name: "Operator One" },
      { PartnerId: "op2", Name: "Operator Two" },
    ];

    const map = createOperatorMap(mockOperators);

    expect(map.get("op1")).toBe("Operator One");
    expect(map.get("op2")).toBe("Operator Two");
    expect(map.size).toBe(2);
  });
});
