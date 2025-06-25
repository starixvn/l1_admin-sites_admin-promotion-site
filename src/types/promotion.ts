export interface Promotion {
  _id: string;
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
    _id: string;
    createdAt: string;
    updatedAt: string;
  }[];
  isGiftCode: boolean;
  minTurnoverMultiplier: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
  status?: string;
  announcementTitle?: string;
  announcement?: string;
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
  isGiftCode: boolean;
  minTurnoverMultiplier: number;
};

export type PromotionPayload = {
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
  betLevels: { currencyGroup: string; betLevel: number }[];
  isGiftCode: boolean;
  minTurnoverMultiplier: number;
};
