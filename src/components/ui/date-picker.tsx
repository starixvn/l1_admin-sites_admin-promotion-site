"use client";

import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import {
  generateHourOptions,
  generateMinuteOptions,
} from "@/lib/date-time.utils";

interface DatePickerProps {
  label: string;
  date: string;
  tempDate: Date | undefined;
  tempHour: string;
  tempMinute: string;
  onDateChange: (date: Date | undefined) => void;
  onTimeChange: (hour: string, minute: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  disabled: boolean;
  minDate?: Date;
  maxDate?: Date;
  defaultMonth?: Date;
}

export default function DatePicker({
  label,
  date,
  tempDate,
  tempHour,
  tempMinute,
  onDateChange,
  onTimeChange,
  onConfirm,
  onCancel,
  isOpen,
  onOpenChange,
  disabled,
  minDate,
  maxDate,
  defaultMonth,
}: DatePickerProps) {
  const dateObj = date ? new Date(date) : undefined;
  const hourOptions = generateHourOptions();
  const minuteOptions = generateMinuteOptions();

  const disabledDates = [
    ...(minDate ? [{ before: minDate }] : []),
    ...(maxDate ? [{ after: maxDate }] : [])
  ];

  return (
    <div className="flex-1 flex items-end">
      <div className="w-full">
        <label className="form-label mb-1">
          {label}
          <span className="text-red-500">*</span>{" "}
          <span className="text-gray-400 text-sm ml-1">(GMT+7)</span>
        </label>
        <Popover open={isOpen} onOpenChange={onOpenChange}>
          <PopoverTrigger asChild className="bg-white">
            <Button
              variant="outline"
              disabled={disabled}
              className={cn(
                "w-full justify-between px-4 py-2 text-left text-base font-normal border border-gray-300 rounded-lg shadow-sm bg-white focus:ring-2 focus:ring-blue-300 focus:border-blue-300 hover:border-blue-400 transition-all h-[42px]",
                !date && "text-muted-foreground",
                disabled && "pointer-events-none opacity-60"
              )}
            >
              <span>
                {dateObj instanceof Date && !isNaN(dateObj.getTime())
                  ? format(dateObj, "dd-MM-yyyy HH:mm")
                  : `Select ${label.toLowerCase()}`}
              </span>
              <CalendarIcon className="h-5 w-5 text-blue-500" />
            </Button>
          </PopoverTrigger>
          {!disabled && (
            <PopoverContent className="w-auto p-4 flex flex-col items-center gap-4 bg-white border border-gray-200 rounded-xl shadow-lg">
              <DayPicker
                mode="single"
                selected={tempDate}
                onSelect={onDateChange}
                defaultMonth={defaultMonth}
                disabled={disabledDates}
                className="custom-day-picker"
              />

              <div className="flex items-center gap-3">
                <select
                  value={tempHour}
                  onChange={(e) => onTimeChange(e.target.value, tempMinute)}
                  className="border border-gray-300 rounded-lg px-2 py-1 text-sm bg-white focus:ring-1 focus:ring-blue-300 focus:border-blue-300"
                  disabled={disabled}
                >
                  {hourOptions.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
                <span className="text-lg font-bold">:</span>
                <select
                  value={tempMinute}
                  onChange={(e) => onTimeChange(tempHour, e.target.value)}
                  className="border border-gray-300 rounded-lg px-2 py-1 text-sm bg-white focus:ring-1 focus:ring-blue-300 focus:border-blue-300"
                  disabled={disabled}
                >
                  {minuteOptions.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  onClick={onCancel}
                  className="px-5 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm font-medium"
                >
                  Cancel
                </Button>
                <Button
                  onClick={onConfirm}
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white text-sm font-semibold"
                >
                  OK
                </Button>
              </div>
            </PopoverContent>
          )}
        </Popover>
      </div>
    </div>
  );
}