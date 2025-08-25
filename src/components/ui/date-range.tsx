"use client";

import { useState } from "react";
import { Calendar } from "lucide-react";

interface DateRangeProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  className?: string;
  disabled?: boolean;
  minDate?: string;
  maxDate?: string;
}

export default function DateRange({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  className = "",
  disabled = false,
  minDate,
  maxDate,
}: DateRangeProps) {
  const [isStartFocused, setIsStartFocused] = useState(false);
  const [isEndFocused, setIsEndFocused] = useState(false);

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            onFocus={() => setIsStartFocused(true)}
            onBlur={() => setIsStartFocused(false)}
            disabled={disabled}
            min={minDate}
            max={endDate || maxDate}
            className={`w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white"
            } ${isStartFocused ? "border-blue-500" : ""}`}
          />
        </div>

        <div className="relative flex-1">
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            onFocus={() => setIsEndFocused(true)}
            onBlur={() => setIsEndFocused(false)}
            disabled={disabled}
            min={startDate || minDate}
            max={maxDate}
            className={`w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white"
            } ${isEndFocused ? "border-blue-500" : ""}`}
          />
        </div>
      </div>
    </div>
  );
}
