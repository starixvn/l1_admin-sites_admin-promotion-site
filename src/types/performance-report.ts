export interface Player {
  playerId: string;
  playerPromotionId: string;
  currencyGroup: string;
  gameId: number;
  siteId: string;
  username: string;
  status: string;
  siteName: string;
  currency: string;
  dateJoined: string;
  bonusWin: number;
  baseBonusWin: number;
  turnover: number;
  baseTurnover: number;
  progress: { current: number; required: number };
  bonusClaimed: number;
  baseBonusClaimed: number;
  lastActivity: string;
  remainingBonusItems: number;
  initialBonusItem: number;
}

export interface PlayersResponse {
  items: Player[];
  metadata: {
    pageIndex: number;
    totalCount: number;
    baseTotalWinAmount: number;
    baseTotalTurnover: number;
    baseTotalBonusClaimed: number;
    pageSize: number;
  };
}

export interface PlayerPromotionFilters {
  searchPlayer: string;
  gameIds: number[];
  playerStatus: string;
  startDate: string;
  endDate: string;
  currencies: string[];
}

export interface PromotionPerformanceResponse {
  bonusWin: number;
  bonusClaimed: number;
  redemptionRate: number;
  totalTurnover: number;
  minRequiredTurnover: number;
  uniquePlayers: number;
  avgBonusPerPlayer: number;
  avgTurnoverPerPlayer: number;
  dailyStats: [];
}