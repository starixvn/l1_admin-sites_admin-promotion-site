import { useState } from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { format, setHours, setMinutes } from "date-fns";

interface DateTimePickerProps {
  label?: string;
  value: Date | undefined;
  onChange: (date: Date) => void;
  error?: string;
}

export default function DateTimePicker({ label, value, onChange, error }: DateTimePickerProps) {
  const [open, setOpen] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(value || new Date());
  const [hour, setHour] = useState(tempDate.getHours());
  const [minute, setMinute] = useState(tempDate.getMinutes());

  const handleDateConfirm = () => {
    const newDate = setHours(setMinutes(tempDate, minute), hour);
    onChange(newDate);
    setOpen(false);
  };

  return (
    <div className="space-y-1">
      {label && <Label className="text-sm font-medium text-gray-700">{label}</Label>}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start text-left font-normal"
          >
            {value ? format(value, "dd-MM-yyyy HH:mm") : "Pick a date and time"}
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-[300px] p-4 space-y-4">
          <Calendar
            mode="single"
            selected={tempDate}
            onSelect={(date) => date && setTempDate(date)}
          />

          <div className="flex items-center gap-2">
            <Input
              type="number"
              min={0}
              max={23}
              className="w-16 text-center"
              value={hour}
              onChange={(e) => setHour(Math.min(23, Math.max(0, +e.target.value)))}
            />
            <span className="text-lg">:</span>
            <Input
              type="number"
              min={0}
              max={59}
              className="w-16 text-center"
              value={minute}
              onChange={(e) => setMinute(Math.min(59, Math.max(0, +e.target.value)))}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleDateConfirm}>OK</Button>
          </div>
        </PopoverContent>
      </Popover>

      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
    </div>
  );
}