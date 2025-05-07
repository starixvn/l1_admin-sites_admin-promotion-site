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

interface DateTimePickerProps {
  disabled?: boolean;
  label?: string;
  value?: Date;
  onChange: (val: Date) => void;
  error?: string;
}

const getNowInGMT7 = () => {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utc + 7 * 60 * 60 * 1000);
};

export default function DateTimePicker({
  disabled = false,
  label,
  value,
  onChange,
  error,
}: DateTimePickerProps) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date>(value ?? getNowInGMT7());
  const [hour, setHour] = useState("00");
  const [minute, setMinute] = useState("00");

  useEffect(() => {
    if (value) {
      const hh = value.getHours().toString().padStart(2, "0");
      const mm = value.getMinutes().toString().padStart(2, "0");
      setDate(value);
      setHour(hh);
      setMinute(mm);
    }
  }, [value]);

  const handleDateChange = (selected?: Date) => {
    if (!selected) {
      return;
    }
    const newDate = new Date(selected);
    newDate.setHours(Number(hour));
    newDate.setMinutes(Number(minute));
    setDate(newDate);
    onChange(newDate);
  };

  const handleTimeChange = (h: string, m: string) => {
    setHour(h);
    setMinute(m);
    const newDate = new Date(date);
    newDate.setHours(Number(h));
    newDate.setMinutes(Number(m));
    setDate(newDate);
    onChange(newDate);
  };

  const hourOptions = Array.from({ length: 24 }, (_, i) =>
    i.toString().padStart(2, "0")
  );
  const minuteOptions = Array.from({ length: 60 }, (_, i) =>
    i.toString().padStart(2, "0")
  );

  return (
    <div className="space-y-1">
      {label && (
        <label className="form-label">
          {label} <span className="text-gray-400 text-sm ml-1">(GMT+7)</span>
        </label>
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild className="bg-white mt-1">
          <Button
            variant="outline"
            className={cn(
              "w-full justify-between px-4 py-3 text-left text-base font-normal border border-gray-300 rounded-xl shadow-sm bg-white focus:ring-2 focus:ring-blue-300 focus:border-blue-300 hover:border-blue-400 transition-all",
              !value && "text-muted-foreground"
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

        <PopoverContent className="w-auto p-4 flex flex-col items-center gap-4 bg-white border border-gray-200 rounded-xl shadow-lg">
          <DayPicker
            mode="single"
            selected={date}
            onSelect={handleDateChange}
            disabled={disabled}
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
      </Popover>

      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}
