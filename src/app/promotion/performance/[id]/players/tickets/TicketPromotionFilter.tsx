import { Search, X } from "lucide-react";
import { PromotionalTicketsFilters } from "@/types/promotional-tickets";
import DateRange from "../../../../../../components/ui/date-range";

interface TicketPromotionFilterProps {
  filters: PromotionalTicketsFilters;
  onFilterChange: (key: keyof PromotionalTicketsFilters, value: string) => void;
  promotionStartDate?: string;
  promotionEndDate?: string;
}

export default function TicketPromotionFilter({
  filters,
  onFilterChange,
  promotionStartDate,
  promotionEndDate,
}: TicketPromotionFilterProps) {
  const handleClearFilters = () => {
    onFilterChange("roundId", "");
    onFilterChange("startDate", "");
    onFilterChange("endDate", "");
  };

  return (
    <div className="mb-6">
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Filters</h3>
          <button
            onClick={handleClearFilters}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
            Clear Filters
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
          <div className="flex flex-col">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by Round ID"
                value={filters.roundId}
                onChange={(e) => onFilterChange("roundId", e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="form-label mb-1">
              {"Date Joined"}
              <span className="text-gray-400 text-sm ml-1">(GMT+7)</span>
            </label>
            <DateRange
              startDate={filters.startDate}
              endDate={filters.endDate}
              onDateChange={(startDate, endDate) => {
                onFilterChange("startDate", startDate);
                onFilterChange("endDate", endDate);
              }}
              minDate={promotionStartDate}
              maxDate={promotionEndDate}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
