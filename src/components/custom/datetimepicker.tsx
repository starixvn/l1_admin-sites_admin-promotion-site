"use client";

import { useState, useEffect } from "react";
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

export default function DateTimePicker({
  label,
  value,
  onChange,
  error,
}: Props) {
  const [open, setOpen] = useState(false);
  const [localDate, setLocalDate] = useState<Date | undefined>(value);
  const [time, setTime] = useState("00:00");

  useEffect(() => {
    if (value) {
      const hh = value.getHours().toString().padStart(2, "0");
      const mm = value.getMinutes().toString().padStart(2, "0");
      setTime(`${hh}:${mm}`);
    }
  }, [value]);

  const handleDateChange = (date?: Date) => {
    if (!date) return;
    const [hh, mm] = time.split(":").map(Number);
    date.setHours(hh);
    date.setMinutes(mm);
    onChange(date);
    setLocalDate(date);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [hh, mm] = e.target.value.split(":").map(Number);
    setTime(e.target.value);
    if (localDate) {
      const newDate = new Date(localDate);
      newDate.setHours(hh);
      newDate.setMinutes(mm);
      onChange(newDate);
    }
  };

  return (
    <div className="space-y-1">
      {label && <Label className="font-semibold">{label}</Label>}
      <p className="text-xs text-muted-foreground mb-1">Date & Time (GMT +7)</p>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-between px-3 py-2 text-left font-normal border border-gray-400 rounded",
              !value && "text-muted-foreground"
            )}
          >
            <span>
              {value ? format(value, "dd-MM-yyyy HH:mm") : "DD-MM-YYYY   hh:mm"}
            </span>
            <CalendarIcon className="h-4 w-4 text-gray-500" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-4 space-y-4 bg-white dark:bg-slate-900">
          <DayPicker
            mode="single"
            selected={value}
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

