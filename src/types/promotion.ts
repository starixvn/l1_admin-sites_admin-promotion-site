export interface Promotion {
  name: string;
  code: string;
  operatorId: string;
  offeredSiteNames: [string];
  currencyGroups: [string];
  startDate: Date;
  endDate: Date;
}

export type CreatePromotionResponse = {
  name: string;
  code: string;
  operatorId: string;
  offeredSiteNames: string[];
  currencyGroups: string[];
  startDate: string;
  endDate: string;
  bonusItemCount: number;
  offeredPlayerIds: string[];
  gameConfigType: number;
  gameIds: number[];
  betLevels: {
    currencyGroup: string;
    betLevel: number;
  }[];
};
