export interface CurrencyGroupGame {
  GroupId: string;
  GameId: number;
  GameName: string;
  Enabled: boolean;
  CoinValues: number[];
  BetLevels: number[];
  DefaultBetLevel: number;
  DefaultCoinValue: number;
}
