export interface Player {
  id: string;
  username: string;
  status: string;
  siteName: string;
  currency: string;
  dateJoined: string;
  bonusReceived: number;
  turnoverContributed: number;
  progress: { current: number; required: number };
  bonusClaimed: number;
  lastActivity: string;
}

export interface PlayersResponse {
  items: Player[];
  metadata: {
    pageIndex: number;
    total: number;
    pageSize: number;
  };
}

export interface PlayerPromotionFilters {
  searchPlayer: string;
  playerStatus: string;
  startDate: string;
  endDate: string;
  isBaseCurrency: boolean;
}

export interface PromotionPerformanceResponse {
  bonusIssued: number;
  bonusRedeemed: number;
  redemptionRate: number;
  totalTurnover: number;
  minRequiredTurnover: number;
  uniquePlayers: number;
  avgBonusPerPlayer: number;
  avgTurnoverPerPlayer: number;
  dailyStats: [];
}