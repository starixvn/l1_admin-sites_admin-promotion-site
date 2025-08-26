import { Promotion } from "@/types/promotion";

export const PROMOTION_STATUS_MAP: Record<string, string> = {
  Upcoming: "not_started",
  Running: "running",
  Completed: "ended",
};

export const PROMOTION_STATUS_OPTIONS = {
  All: "All",
  Upcoming: "Upcoming",
  Running: "Running",
  Completed: "Completed",
} as const;

export const PROMOTION_STATUS_OPTIONS_LIST = [
  PROMOTION_STATUS_OPTIONS.All,
  PROMOTION_STATUS_OPTIONS.Upcoming,
  PROMOTION_STATUS_OPTIONS.Running,
  PROMOTION_STATUS_OPTIONS.Completed,
];

export const PROMOTION_STATUS = {
  ACTIVE: 'Active',
  INELIGIBLE: 'Ineligible',
  TURN_OVER_MET: 'Turnover Met',
  BONUS_REDEEMED: 'Bonus Redeemed',
  OPTED_OUT: 'Opted Out',
} as const;

export const PLAYER_STATUS_OPTIONS = [
  { value: "All Status", label: "All Status" },
  ...Object.entries(PROMOTION_STATUS).map(([key, value]) => ({
    value,
    label: value
  }))
];

export type PromotionStatus = typeof PROMOTION_STATUS[keyof typeof PROMOTION_STATUS];

export const promotionStatusMap = {
  [PROMOTION_STATUS.ACTIVE]: {
    label: 'Active',
    color: 'text-green-500',
    bgColor: 'bg-green-500',
    dotColor: 'bg-green-500'
  },
  [PROMOTION_STATUS.INELIGIBLE]: {
    label: 'Ineligible',
    color: 'text-red-500',
    bgColor: 'bg-red-500',
    dotColor: 'bg-red-500'
  },
  [PROMOTION_STATUS.TURN_OVER_MET]: {
    label: 'Turnover Met',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500',
    dotColor: 'bg-blue-500'
  },
  [PROMOTION_STATUS.BONUS_REDEEMED]: {
    label: 'Bonus Redeemed',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500',
    dotColor: 'bg-purple-500'
  },
  [PROMOTION_STATUS.OPTED_OUT]: {
    label: 'Opted Out',
    color: 'text-gray-500',
    bgColor: 'bg-gray-500',
    dotColor: 'bg-gray-500'
  }
};

export function getStatus(
  promotion: Promotion
): typeof PROMOTION_STATUS_OPTIONS.Upcoming | typeof PROMOTION_STATUS_OPTIONS.Running | typeof PROMOTION_STATUS_OPTIONS.Completed {
  const now = new Date();
  const start = new Date(promotion.startDate);
  const end = new Date(promotion.endDate);

  if (now < start) {
    return PROMOTION_STATUS_OPTIONS.Upcoming;
  }
  if (now > end) {
    return PROMOTION_STATUS_OPTIONS.Completed;
  }
  return PROMOTION_STATUS_OPTIONS.Running;
}
