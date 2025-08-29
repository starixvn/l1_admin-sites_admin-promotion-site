"use client";

import { Search, X } from "lucide-react";
import DateRange from "@/components/ui/date-range";
import { PLAYER_STATUS_OPTIONS } from "@/constants/promotionStatusMap";

interface PlayerFilterProps {
  searchPlayer: string;
  setSearchPlayer: (value: string) => void;
  playerStatus: string;
  setPlayerStatus: (value: string) => void;
  startDate: string;
  endDate: string;
  onDateChange: (startDate: string, endDate: string) => void;
  isBaseCurrency: boolean;
  setIsBaseCurrency: (value: boolean) => void;
  promotionStartDate?: string;
  promotionEndDate?: string;
}

export default function PlayerFilter({
  searchPlayer,
  setSearchPlayer,
  playerStatus,
  setPlayerStatus,
  startDate,
  endDate,
  onDateChange,
  isBaseCurrency,
  setIsBaseCurrency,
  promotionStartDate,
  promotionEndDate,
}: PlayerFilterProps) {
  // Check if any filter is active
  const hasActiveFilters =
    searchPlayer || playerStatus || startDate || endDate || isBaseCurrency;

  // Clear all filters function
  const handleClearFilters = () => {
    setSearchPlayer("");
    setPlayerStatus("");
    onDateChange("", "");
    setIsBaseCurrency(false);
  };

  return (
    <div className="mb-6">
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Filters</h3>
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            >
              <X className="w-4 h-4" />
              Clear Filters
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative flex items-end">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by Player ID or Username"
                value={searchPlayer}
                onChange={(e) => setSearchPlayer(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-end">
            <select
              value={playerStatus}
              onChange={(e) => setPlayerStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {PLAYER_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <DateRange
              startDate={startDate}
              endDate={endDate}
              onDateChange={onDateChange}
              minDate={promotionStartDate}
              maxDate={promotionEndDate}
            />
          </div>
          <div className="flex items-end">
            <div className="flex items-center gap-2 h-[42px] px-4 py-2 border border-gray-300 rounded-lg bg-white">
              <input
                name="baseCurrency"
                type="checkbox"
                checked={isBaseCurrency}
                onChange={(e) => setIsBaseCurrency(e.target.checked)}
                className="w-4 h-4 cursor-pointer text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <span className="text-sm text-gray-700">Base Currency</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
