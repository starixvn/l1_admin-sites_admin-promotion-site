import { Promotion } from "@/types/promotion";

export const PROMOTION_STATUS_MAP: Record<string, string> = {
    Upcoming: "not_started",
    Running: "running",
    Completed: "ended",
  };

export const PROMOTION_STATUS_OPTIONS = ["All","Upcoming", "Running", "Completed", ];

export function getStatus(
  promotion: Promotion
): "upcoming" | "running" | "completed" {
  const now = new Date();
  const start = new Date(promotion.startDate);
  const end = new Date(promotion.endDate);

  if (now < start) return "upcoming";
  if (now > end) return "completed";
  return "running";
}