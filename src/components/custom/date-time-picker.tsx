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
    if (!selected) return;
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
      {label && <label className="form-label">{label}</label>}
      <p className="text-xs text-muted-foreground mb-1">Date & Time (GMT+7)</p>

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

        <PopoverContent className="w-auto p-6 flex flex-col items-center gap-6 bg-white border border-gray-300 rounded-2xl shadow-md">
          <DayPicker
            mode="single"
            selected={date}
            onSelect={handleDateChange}
            className="custom-day-picker"
          />

          <div className="flex items-center gap-3">
            <select
              value={hour}
              onChange={(e) => handleTimeChange(e.target.value, minute)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-300 focus:border-blue-300 hover:border-gray-400"
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
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-300 focus:border-blue-300 hover:border-gray-400"
            >
              {minuteOptions.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-4 pt-2">
            <Button
              type="button"
              variant="outline"
              className="btn-cancel"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => setOpen(false)}
              type="submit"
              className="btn-primary"
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
