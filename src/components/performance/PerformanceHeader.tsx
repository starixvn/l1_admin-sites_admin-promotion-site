import { ArrowLeft } from "lucide-react";
import { Promotion } from "@/types/promotion";
import { getStatus } from "@/constants/promotionStatusMap";
import { getStatusStyle } from "@/helper/common";

interface PerformanceHeaderProps {
  promotion: Promotion;
  onBack: () => void;
  title: string;
  backTitle: string;
}

export default function PerformanceHeader({
  promotion,
  onBack,
  title,
  backTitle,
}: PerformanceHeaderProps) {
  const status = getStatus(promotion);
  return (
    <div className="w-full px-6 py-4 flex-shrink-0">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {title}: {promotion.name}
          </h1>
          <div className="flex items-center gap-4 mt-2">
            <span className="text-sm text-gray-600">
              Promotion Code:{" "}
              <span className="font-mono font-semibold">{promotion.code}</span>
            </span>
            <span
              className={`px-3 py-1.5 rounded-full text-sm font-medium ${getStatusStyle(
                status
              )}`}
            >
              {status}
            </span>
          </div>
        </div>
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-700 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          {backTitle}
        </button>
      </div>
    </div>
  );
}
