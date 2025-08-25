import { PROMOTION_STATUS_OPTIONS } from "@/constants/promotionStatusMap";

export const getStatusStyle = (status: string) => {
  switch (status) {
    case PROMOTION_STATUS_OPTIONS.Running:
      return "bg-green-100 text-green-800";
    case PROMOTION_STATUS_OPTIONS.Upcoming:
      return "bg-yellow-100 text-yellow-800";
    case PROMOTION_STATUS_OPTIONS.Completed:
      return "bg-gray-100 text-gray-600";
    default:
      return "bg-gray-100 text-gray-500";
  }
}

export const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

export const getStatusColor = (status: string) => {
    switch (status) {
        case "Active":
        return "text-green-500";
        case "Turnover Met":
        return "text-blue-500";
        case "Bonus Redeemed":
        return "text-purple-500";
        case "Ineligible":
        return "text-red-500";
        case "Opted Out":
        return "text-gray-500";
        default:
        return "text-gray-500";
    }
};

export const getStatusDot = (status: string) => {
    switch (status) {
        case "Active":
        return "bg-green-500";
        case "Turnover Met":
        return "bg-blue-500";
        case "Bonus Redeemed":
        return "bg-purple-500";
        case "Ineligible":
        return "bg-red-500";
        case "Opted Out":
        return "bg-gray-500";
        default:
        return "bg-gray-500";
    }
};

export const getProgressColor = (current: number, required: number) => {
    const ratio = current / required;
    if (ratio >= 1) return "bg-green-500";
    if (ratio >= 0.5) return "bg-purple-500";
    return "bg-red-500";
};
