"use client";

import { useState, useEffect } from "react";
import DatePicker from "./date-picker";
import {
  getTodayAtMidnightGMT7,
  mergeDateAndTime,
} from "@/lib/date-time.utils";

interface DateRangeProps {
  startDate: string;
  endDate: string;
  onDateChange: (startDate: string, endDate: string) => void;
  className?: string;
  disabled?: boolean;
  minDate?: string;
  maxDate?: string;
}

export default function DateRange({
  startDate,
  endDate,
  onDateChange,
  className = "",
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

  // Time states
  const [startHour, setStartHour] = useState("00");
  const [startMinute, setStartMinute] = useState("00");
  const [endHour, setEndHour] = useState("23");
  const [endMinute, setEndMinute] = useState("59");

  // Temporary states for editing
  const [tempStartDate, setTempStartDate] = useState<Date | undefined>(startDateObj);
  const [tempEndDate, setTempEndDate] = useState<Date | undefined>(endDateObj);
  const [tempStartHour, setTempStartHour] = useState(startHour);
  const [tempStartMinute, setTempStartMinute] = useState(startMinute);
  const [tempEndHour, setTempEndHour] = useState(endHour);
  const [tempEndMinute, setTempEndMinute] = useState(endMinute);

  // Initialize time from existing dates
  useEffect(() => {
    if (startDate) {
      const date = new Date(startDate);
      const hour = date.getHours().toString().padStart(2, "0");
      const minute = date.getMinutes().toString().padStart(2, "0");
      setStartHour(hour);
      setStartMinute(minute);
      setTempStartHour(hour);
      setTempStartMinute(minute);
    }
    if (endDate) {
      const date = new Date(endDate);
      const hour = date.getHours().toString().padStart(2, "0");
      const minute = date.getMinutes().toString().padStart(2, "0");
      setEndHour(hour);
      setEndMinute(minute);
      setTempEndHour(hour);
      setTempEndMinute(minute);
    }
  }, [startDate, endDate]);

  const handleStartConfirm = () => {
    if (tempStartDate) {
      const newDate = mergeDateAndTime(tempStartDate, tempStartHour, tempStartMinute);
      onDateChange(newDate.toISOString(), endDate);
      setStartHour(tempStartHour);
      setStartMinute(tempStartMinute);
    }
    setStartOpen(false);
  };

  const handleEndConfirm = () => {
    if (tempEndDate) {
      const newDate = mergeDateAndTime(tempEndDate, tempEndHour, tempEndMinute);
      onDateChange(startDate, newDate.toISOString());
      setEndHour(tempEndHour);
      setEndMinute(tempEndMinute);
    }
    setEndOpen(false);
  };

  const handleStartCancel = () => {
    setTempStartDate(startDateObj);
    setTempStartHour(startHour);
    setTempStartMinute(startMinute);
    setStartOpen(false);
  };

  const handleEndCancel = () => {
    setTempEndDate(endDateObj);
    setTempEndHour(endHour);
    setTempEndMinute(endMinute);
    setEndOpen(false);
  };

  return (
    <div className={`flex gap-2 ${className}`}>
      <DatePicker
        label="Start Date"
        date={startDate}
        tempDate={tempStartDate}
        tempHour={tempStartHour}
        tempMinute={tempStartMinute}
        onDateChange={setTempStartDate}
        onTimeChange={(hour, minute) => {
          setTempStartHour(hour);
          setTempStartMinute(minute);
        }}
        onConfirm={handleStartConfirm}
        onCancel={handleStartCancel}
        isOpen={startOpen}
        onOpenChange={(val) => !disabled && setStartOpen(val)}
        disabled={disabled}
        minDate={minDateObj}
        maxDate={startDateMax}
        defaultMonth={tempStartDate || startDateObj || new Date()}
      />

      <DatePicker
        label="End Date"
        date={endDate}
        tempDate={tempEndDate}
        tempHour={tempEndHour}
        tempMinute={tempEndMinute}
        onDateChange={setTempEndDate}
        onTimeChange={(hour, minute) => {
          setTempEndHour(hour);
          setTempEndMinute(minute);
        }}
        onConfirm={handleEndConfirm}
        onCancel={handleEndCancel}
        isOpen={endOpen}
        onOpenChange={(val) => !disabled && setEndOpen(val)}
        disabled={disabled}
        minDate={endDateMin}
        maxDate={maxDateObj}
        defaultMonth={tempEndDate || endDateObj || new Date()}
      />
    </div>
  );
}
