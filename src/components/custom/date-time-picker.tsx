"use client";

import { useState, useEffect } from "react";
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
  getTodayAtMidnightGMT7,
  mergeDateAndTime,
} from "@/lib/date-time.utils";

interface DateTimePickerProps {
  disabled?: boolean;
  label?: string;
  value?: Date;
  onChange: (val: Date) => void;
  error?: string;
}

export default function DateTimePicker({
  disabled = false,
  label,
  value,
  onChange,
  error,
}: DateTimePickerProps) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date>(value ?? getTodayAtMidnightGMT7());
  const [hour, setHour] = useState("00");
  const [minute, setMinute] = useState("00");

  useEffect(() => {
    if (value) {
      const dateObj = value instanceof Date ? value : new Date(value);
      const hh = dateObj.getHours().toString().padStart(2, "0");
      const mm = dateObj.getMinutes().toString().padStart(2, "0");
      setDate(dateObj);
      setHour(hh);
      setMinute(mm);
    }
  }, [value]);

  const handleDateChange = (selected?: Date) => {
    if (!selected) {
      return;
    }
    const newDate = mergeDateAndTime(selected, hour, minute);
    setDate(newDate);
    onChange(newDate);
  };

  const handleTimeChange = (h: string, m: string) => {
    setHour(h);
    setMinute(m);
    const newDate = mergeDateAndTime(date, h, m);
    setDate(newDate);
    onChange(newDate);
  };

  const hourOptions = generateHourOptions();
  const minuteOptions = generateMinuteOptions();

  return (
    <div className="space-y-1">
      {label && (
        <label className="form-label">
          {label}
          <span className="text-red-500">*</span>{" "}
          <span className="text-gray-400 text-sm ml-1">(GMT+7)</span>
        </label>
      )}

      <Popover open={open} onOpenChange={val => { 
        if (!disabled) {
          setOpen(val); 
        }
      }}>
        <PopoverTrigger asChild className="bg-white mt-1">
          <Button
            variant="outline"
            disabled={disabled}
            className={cn(
              "w-full justify-between px-4 py-3 text-left text-base font-normal border border-gray-300 rounded-xl shadow-sm bg-white focus:ring-2 focus:ring-blue-300 focus:border-blue-300 hover:border-blue-400 transition-all",
              !value && "text-muted-foreground",
              disabled && "pointer-events-none opacity-60"
            )}
          >
            <span>
              {date instanceof Date && !isNaN(date.getTime())
                ? format(date, "dd-MM-yyyy HH:mm")
                : "DD-MM-YYYY hh:mm"}
            </span>
            <CalendarIcon className="h-5 w-5 text-blue-500" />
          </Button>
        </PopoverTrigger>
        {!disabled && (
          <PopoverContent className="w-auto p-4 flex flex-col items-center gap-4 bg-white border border-gray-200 rounded-xl shadow-lg">
            <DayPicker
              mode="single"
              selected={date}
              onSelect={handleDateChange}
              disabled={[disabled, { before: new Date() }]}
              className="custom-day-picker"
            />

            <div className="flex items-center gap-3">
              <select
                value={hour}
                onChange={(e) => handleTimeChange(e.target.value, minute)}
                className="border border-gray-300 rounded-lg px-2 py-1 text-sm bg-white focus:ring-1 focus:ring-blue-300 focus:border-blue-300"
                disabled={disabled}
              >
                {hourOptions.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
              <span className="text-lg font-bold">:</span>
              <select
                value={minute}
                onChange={(e) => handleTimeChange(hour, e.target.value)}
                className="border border-gray-300 rounded-lg px-2 py-1 text-sm bg-white focus:ring-1 focus:ring-blue-300 focus:border-blue-300"
                disabled={disabled}
              >
                {minuteOptions.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                onClick={() => setOpen(false)}
                className="px-5 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm font-medium"
              >
                Cancel
              </Button>
              <Button
                onClick={() => setOpen(false)}
                type="submit"
                className="px-5 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white text-sm font-semibold"
              >
                OK
              </Button>
            </div>
          </PopoverContent>
        )}
      </Popover>

      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}
