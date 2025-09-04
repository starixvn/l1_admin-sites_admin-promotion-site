"use client";

import { useState, useEffect } from "react";
import DatePicker from "./date-picker";
import {
  getTodayAtMidnightGMT7,
} from "@/lib/date-time.utils";

interface DateRangeProps {
  startDate: string;
  endDate: string;
  onDateChange: (startDate: string, endDate: string) => void;
  disabled?: boolean;
  minDate?: string;
  maxDate?: string;
}

export default function DateRange({
  startDate,
  endDate,
  onDateChange,
  disabled = false,
  minDate,
  maxDate,
}: DateRangeProps) {
  const [startOpen, setStartOpen] = useState(false);
  const [endOpen, setEndOpen] = useState(false);
  // Convert string dates to Date objects
  const startDateObj = startDate ? new Date(startDate) : getTodayAtMidnightGMT7();
  const endDateObj = endDate ? new Date(endDate) : getTodayAtMidnightGMT7();

  const minDateObj = minDate ? new Date(minDate) : undefined;
  const maxDateObj = maxDate ? new Date(maxDate) : undefined;

  // Dynamic constraints based on current values
  const startDateMax = endDateObj ? endDateObj : maxDateObj;
  const endDateMin = startDateObj ? startDateObj : minDateObj;

  const [tempStartDate, setTempStartDate] = useState<Date>(startDateObj);
  const [tempEndDate, setTempEndDate] = useState<Date>(endDateObj);

  // Update temp dates when props change
  useEffect(() => {
    if (startDate) {
      setTempStartDate(new Date(startDate));
    }
    if (endDate) {
      setTempEndDate(new Date(endDate));
    }
  }, [startDate, endDate]);

  const handleStartConfirm = () => {
    if (tempStartDate) {
      onDateChange(tempStartDate.toISOString(), endDate);
    }
    setStartOpen(false);
  };

  const handleEndConfirm = () => {
    if (tempEndDate) {
      onDateChange(startDate, tempEndDate.toISOString());
    }
    setEndOpen(false);
  };

  const handleStartCancel = () => {
    setTempStartDate(startDateObj);
    setStartOpen(false);
  };

  const handleEndCancel = () => {
    setTempEndDate(endDateObj);
    setEndOpen(false);
  };

  // Helper function to update date with time
  const handleStartDateTimeChange = (date: Date | undefined, hour?: string, minute?: string) => {
    if (date) {
      const newDate = new Date(date);
      if (hour !== undefined && minute !== undefined) {
        newDate.setHours(parseInt(hour), parseInt(minute), 0, 0);
      }
      setTempStartDate(newDate);
    }
  };

  const handleEndDateTimeChange = (date: Date | undefined, hour?: string, minute?: string) => {
    if (date) {
      const newDate = new Date(date);
      if (hour !== undefined && minute !== undefined) {
        newDate.setHours(parseInt(hour), parseInt(minute), 0, 0);
      }
      setTempEndDate(newDate);
    }
  };

  return (
    <div className={`flex gap-2`}>
      <DatePicker
        date={startDate}
        tempDate={tempStartDate}
        onDateChange={(date) => handleStartDateTimeChange(date)}
        onTimeChange={(hour, minute) => handleStartDateTimeChange(tempStartDate, hour, minute)}
        onConfirm={handleStartConfirm}
        onCancel={handleStartCancel}
        isOpen={startOpen}
        onOpenChange={(val) => !disabled && setStartOpen(val)}
        disabled={disabled}
        minDate={minDateObj}
        maxDate={startDateMax}
        defaultMonth={tempStartDate}
      />
      <div className="flex items-center justify-center min-w-[20px]">
        <span className="text-black-600 font-medium select-none">{"to"}</span>
      </div>
      <DatePicker
        date={endDate}
        tempDate={tempEndDate}
        onDateChange={(date) => handleEndDateTimeChange(date)}
        onTimeChange={(hour, minute) => handleEndDateTimeChange(tempEndDate, hour, minute)}
        onConfirm={handleEndConfirm}
        onCancel={handleEndCancel}
        isOpen={endOpen}
        onOpenChange={(val) => !disabled && setEndOpen(val)}
        disabled={disabled}
        minDate={endDateMin}
        maxDate={maxDateObj}
        defaultMonth={tempEndDate}
      />
    </div>
  );
}
