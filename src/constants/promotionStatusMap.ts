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

export const PROMOTION_REPORT_STATUS = {
  All: "All",
  Upcoming: "Upcoming",
  Running: "Running",
  Claiming: "Claiming",
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
  TURN_OVER_MET: 'Turnover Met',
  BONUS_CLAIMED: 'Bonus Claimed',
  EXPIRED: 'Expired',
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
  [PROMOTION_STATUS.TURN_OVER_MET]: {
    label: 'Turnover Met',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500',
    dotColor: 'bg-blue-500'
  },
  [PROMOTION_STATUS.BONUS_CLAIMED]: {
    label: 'Bonus Claimed',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500',
    dotColor: 'bg-purple-500'
  },
  [PROMOTION_STATUS.EXPIRED]: {
    label: 'Expired',
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

export function getPromotionStatus(
  promotion: Promotion
): typeof PROMOTION_REPORT_STATUS[keyof typeof PROMOTION_REPORT_STATUS] {
  const now = new Date();
  const start = new Date(promotion.startDate);
  const end = new Date(promotion.endDate);
  const claimExpiration = promotion.claimExpirationDate ? new Date(promotion.claimExpirationDate) : null;

  // Upcoming: Before start date
  if (now < start) {
    return PROMOTION_REPORT_STATUS.Upcoming;
  }
  
  // Running: Between start date and end date
  if (now >= start && now <= end) {
    return PROMOTION_REPORT_STATUS.Running;
  }
  
  // Claiming: After end date but before claim expiration
  if (claimExpiration && now > end && now <= claimExpiration) {
    return PROMOTION_REPORT_STATUS.Claiming;
  }
  
  // Completed: After claim expiration (or after end date if no claim expiration)
  return PROMOTION_REPORT_STATUS.Completed;
}
