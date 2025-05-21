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
