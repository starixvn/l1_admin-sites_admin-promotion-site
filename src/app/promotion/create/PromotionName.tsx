import { memo } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PromotionNameProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
}

const PromotionName = memo(({
  value,
  onChange,
  onBlur,
  error
}: PromotionNameProps) => {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Label className="form-label">Promotion Name</Label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="tooltip-icon" />
            </TooltipTrigger>
            <TooltipContent side="right" className="z-50 max-w-xl break-words p-3 text-base text-gray-700 leading-relaxed">
              <p>Each promotion must have a name. Can include letters, numbers, or underscores. No special characters allowed.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <Input
        value={value}
        onChange={(e) => {
          const input = e.target;
          if (input.value.length <= 50) {
            onChange(input.value);
          }
        }}
        onBlur={onBlur}
        maxLength={50}
        className="form-input"
      />
      {error && <p className="error-message">{error}</p>}
    </div>
  );
});

PromotionName.displayName = 'PromotionName';

export default PromotionName;