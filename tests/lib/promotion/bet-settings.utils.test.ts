import { GAME_TYPES } from "@/constants/gameTypes";
import {
  selectSuggestedBetLevel,
  validateBetRows,
  createOperatorMap,
} from "@/lib/promotion/bet-settings.utils";
import { CurrencyGroupGame } from "@/types/currency-group-game";
describe("selectSuggestedBetLevel", () => {
  const mockGames: CurrencyGroupGame[] = [
    {
      GameId: 1,
      DefaultBetLevel: 1.5,
      DefaultCoinValue: 0,
      BetLevels: [1.5],
      CoinValues: [],
      GroupId: "1",
      GameName: "Game 1",
      Enabled: true,
    },
    {
      GameId: 2,
      DefaultBetLevel: 0,
      DefaultCoinValue: 5,
      BetLevels: [],
      CoinValues: [5],
      GroupId: "1",
      GameName: "Game 2",
      Enabled: true,
    },
    {
      GameId: 99,
      DefaultBetLevel: 0,
      DefaultCoinValue: 0,
      BetLevels: [],
      CoinValues: [],
      GroupId: "1",
      GameName: "Game 3",
      Enabled: true,
    },
  ];

  it("returns game and DefaultCoinValue of highest GameId when CASCADING", () => {
    const result = selectSuggestedBetLevel(
      GAME_TYPES.CASCADING,
      mockGames
    );
    expect(result.value).toBe(5);
    expect(result.game?.GameId).toBe(2);
  });

  it("returns game and DefaultBetLevel of highest GameId when CLASSIC", () => {
    const result = selectSuggestedBetLevel(
      GAME_TYPES.CLASSIC,
      mockGames
    );
    expect(result.value).toBe(1.5);
    expect(result.game?.GameId).toBe(1);
  });

  it("returns default value and null game when no enabled games match", () => {
    const result = selectSuggestedBetLevel(GAME_TYPES.CLASSIC, []);
    expect(result.value).toBe(0);
    expect(result.game).toBeNull();
  });
});

describe("validateBetRows", () => {
  it("returns empty set if all rows are valid", () => {
    const rows = [{ id: "1", enabled: true, baseValue: 1 }];
    expect(validateBetRows(rows).size).toBe(0);
  });

  it("detects invalid row with zero betLevel", () => {
    const rows = [{ id: "1", enabled: true, baseValue: 0 }];
    expect(validateBetRows(rows)).toEqual(new Set(["1"]));
  });
  it("ignores disabled rows even if betLevel is 0", () => {
    const rows = [
      { id: "1", enabled: false, baseValue: 0 },
      { id: "2", enabled: false, baseValue: 0 },
    ];
    expect(validateBetRows(rows)).toEqual(new Set());
  });

  it("returns multiple invalid row ids if more than one enabled has 0", () => {
    const rows = [
      { id: "1", enabled: true, baseValue: 0 },
      { id: "2", enabled: true, baseValue: 0 },
      { id: "3", enabled: true, baseValue: 1 },
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
