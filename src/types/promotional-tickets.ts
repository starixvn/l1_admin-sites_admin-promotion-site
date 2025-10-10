export interface PromotionalTicket {
  _id: string;
  gameRoundId: string;
  baseBetAmount: number;
  baseWinAmount: number;
  createdAt: string;
  gameId: string;
  displayName: string;
  betAmount: number;
  winAmount: number;
  siteName: string;
  currency: string;
}

export interface PromotionalTicketsResponse {
  success: boolean;
  tickets: PromotionalTicket[];
  pageSize: number;
  totalPages: number;
  metaData: {
    totalCount: number;
    totalBetAmount: number;
    totalWinAmount: number;
    totalBaseBetAmount: number;
    totalBaseWinAmount: number;
  };
}

export interface PromotionalTicketsFilters {
  roundId: string;
  startDate: string;
  endDate: string;
}
