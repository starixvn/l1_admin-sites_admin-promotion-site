"use client";

import { Search, X } from "lucide-react";
import DateRange from "@/components/ui/date-range";
import { PLAYER_STATUS_OPTIONS } from "@/constants/promotionStatusMap";
import { PlayerPromotionFilters } from "@/types/performance-report";
import CurrencyMultiSelect from "./CurrencyMultiselect";
import useCurrencies from "@/hooks/useCurrencies";
import { Currency } from "@/types/currencies";
import { MultiSelectOption } from "@/types/global";

interface PlayerFilterProps {
  filters: PlayerPromotionFilters;
  onFilterChange: (key: keyof PlayerPromotionFilters, value: any) => void;
  promotionStartDate?: string;
  promotionEndDate?: string;
}

export default function PlayerFilter({
  filters,
  onFilterChange,
  promotionStartDate,
  promotionEndDate,
}: PlayerFilterProps) {
  
  const { data: currencies, isLoading, error } = useCurrencies();
// Transform currencies to MultiSelectOption format and remove duplicates
  const currencyOptions: MultiSelectOption[] = currencies
    ?.filter((currency, index, self) => 
      self.findIndex(c => c.Name === currency.Name) === index
    )
    .map((currency: Currency) => ({
      value: currency.Name,
      label: currency.Name,
      ...currency, // Include all currency properties
    })) || [];

  // Clear all filters function
  const handleClearFilters = () => {
    onFilterChange("searchPlayer", "");
    onFilterChange("playerStatus", "");
    onFilterChange("startDate", "");
    onFilterChange("endDate", "");
    onFilterChange("currencies", currencyOptions.map((currency: MultiSelectOption) => currency.value) || []);
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
                placeholder="Search by Player ID or Username"
                value={filters.searchPlayer}
                onChange={(e) => onFilterChange("searchPlayer", e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-[42px] text-sm"
              />
            </div>
          </div>

          <div className="flex flex-col">
            <select
              value={filters.playerStatus}
              onChange={(e) => onFilterChange("playerStatus", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-[42px]"
            >
              {PLAYER_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
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
          
          <div className="flex flex-col col-span-2">
            <label className="form-label mb-1">Currencies</label>
            <div className="h-[42px]">
              <CurrencyMultiSelect
                currencyOptions={currencyOptions || []}
                isLoading={isLoading}
                error={!!error}
                selectedCurrencies={filters.currencies || []}
                onSelectionChange={(currencies) => onFilterChange("currencies", currencies)}
                placeholder="Select currencies..."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
