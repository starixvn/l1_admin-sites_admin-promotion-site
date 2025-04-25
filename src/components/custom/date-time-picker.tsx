"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { CalendarIcon, Clock } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type Props = {
  label?: string;
  value?: Date;
  onChange: (val: Date) => void;
  error?: string;
};

// 🔁 Get current date in GMT+7
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
}: Props) {
  const defaultDate = value ?? getNowInGMT7();
  const [open, setOpen] = useState(false);
  const [localDate, setLocalDate] = useState<Date>(defaultDate);
  const [time, setTime] = useState("00:00");

  // ⏰ Sync time with date
  useEffect(() => {
    const val = value ?? getNowInGMT7();
    const hh = val.getHours().toString().padStart(2, "0");
    const mm = val.getMinutes().toString().padStart(2, "0");
    setLocalDate(val);
    setTime(`${hh}:${mm}`);
  }, [value]);

  const handleDateChange = (date?: Date) => {
    if (!date) return;
    const [hh, mm] = time.split(":").map(Number);
    date.setHours(hh);
    date.setMinutes(mm);
    setLocalDate(date);
    onChange(date);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [hh, mm] = e.target.value.split(":").map(Number);
    setTime(e.target.value);
    const base = localDate ?? getNowInGMT7();
    const newDate = new Date(base);
    newDate.setHours(hh);
    newDate.setMinutes(mm);
    setLocalDate(newDate);
    onChange(newDate);
  };

  return (
    <div className="space-y-1">
      {label && <Label className="text-lg font-semibold text-gray-700">{label}</Label>}
      <p className="text-xs text-muted-foreground mb-1">Date & Time (GMT +7)</p>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild className="bg-white">
          <Button
            variant="outline"
            className={cn(
              "w-full justify-between px-3 py-2 text-left font-normal border border-gray-400 rounded",
              !value && "text-muted-foreground"
            )}
          >
            <span>
              {value instanceof Date && !isNaN(value.getTime())
                ? format(value, "dd-MM-yyyy HH:mm")
                : "DD-MM-YYYY   hh:mm"}
            </span>
            <CalendarIcon className="h-4 w-4 text-gray-500" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-auto p-4 space-y-4 bg-white dark:bg-slate-900">
          <DayPicker
            mode="single"
            selected={localDate}
            onSelect={handleDateChange}
          />
          <div className="flex items-center gap-2">
            <div className="rounded-md bg-gray-100 dark:bg-slate-800 p-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
            </div>
            <Input
              type="time"
              className="w-28 appearance-none leading-tight px-2 py-1 text-sm"
              value={time}
              onChange={handleTimeChange}
            />
          </div>
        </PopoverContent>
      </Popover>

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
