import { PROMOTION_REPORT_STATUS, promotionStatusMap } from "@/constants/promotionStatusMap";

export const getStatusStyle = (status: string) => {
  switch (status) {
    case PROMOTION_REPORT_STATUS.Running:
      return "bg-green-100 text-green-800";
    case PROMOTION_REPORT_STATUS.Upcoming:
      return "bg-yellow-100 text-yellow-800";
    case PROMOTION_REPORT_STATUS.Completed:
      return "bg-gray-100 text-gray-600";
    case PROMOTION_REPORT_STATUS.Claiming:
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-gray-100 text-gray-500";
  }
}

export const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  };

export const getStatusColor = (status: string) => {
    return promotionStatusMap[status as keyof typeof promotionStatusMap]?.color || "text-gray-500";
};

export const getStatusDot = (status: string) => {
    return promotionStatusMap[status as keyof typeof promotionStatusMap]?.dotColor || "bg-gray-500";
};

export const getProgressColor = (current: number, required: number) => {
    const ratio = current / required;
    if (ratio >= 1) {
        return "bg-green-500";
    }
    if (ratio >= 0.5) {
        return "bg-purple-500";
    }
    return "bg-red-500";
};
