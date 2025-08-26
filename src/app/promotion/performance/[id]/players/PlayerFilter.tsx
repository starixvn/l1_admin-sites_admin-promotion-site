"use client";

import { Search } from "lucide-react";
import DateRange from "@/components/ui/date-range";
import { PLAYER_STATUS_OPTIONS } from "@/constants/promotionStatusMap";
import { convertToGMTDate } from "@/lib/date-time.utils";
import { GMT_OFFSET } from "@/constants/constants";

interface PlayerFilterProps {
  searchPlayer: string;
  setSearchPlayer: (value: string) => void;
  playerStatus: string;
  setPlayerStatus: (value: string) => void;
  startDate: string;
  endDate: string;
  setStartDate: (date: string) => void;
  setEndDate: (date: string) => void;
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
  setStartDate,
  setEndDate,
  promotionStartDate,
  promotionEndDate,
}: PlayerFilterProps) {
  return (
    <div className="px-6 mb-6">
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by Player ID or Username"
              value={searchPlayer}
              onChange={(e) => setSearchPlayer(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
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

          <DateRange
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            minDate={convertToGMTDate(promotionStartDate ?? "", GMT_OFFSET)}
            maxDate={convertToGMTDate(promotionEndDate ?? "", GMT_OFFSET)}
          />
        </div>
      </div>
    </div>
  );
}
