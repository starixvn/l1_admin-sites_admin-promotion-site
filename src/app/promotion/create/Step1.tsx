import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import DateTimePicker from "@/components/custom/date-time-picker";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { GAME_TYPES, type GameType } from "@/constants/gameTypes";
import { cn } from "@/lib/utils";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  UseFormRegister,
  UseFormSetValue,
  Control,
  FieldErrors,
  useWatch,
} from "react-hook-form";
import type { PromotionFormValues } from "./PromotionForm";
import type { Operator } from "@/types/operator";

interface Step1Props {
  mode: string;
  status: string;
  register: UseFormRegister<PromotionFormValues>;
  setValue: UseFormSetValue<PromotionFormValues>;
  control: Control<PromotionFormValues>;
  errors: FieldErrors<PromotionFormValues>;
  codeEdited: boolean;
  setCodeEdited: (value: boolean) => void;
  operators: Operator[];
}

export default function Step1({
  mode,
  status,
  register,
  setValue,
  control,
  errors,
  codeEdited,
  setCodeEdited,
  operators,
}: Step1Props) {
  const isEdit = mode === "edit";
  const isRunning = isEdit && status === "running";
  const name = useWatch({ control, name: "name" });
  const gameConfigType = useWatch({ control, name: "gameConfigType" });

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-1 mb-2">
          <Label className="form-label flex items-center gap-1">
            Promotion Name<span className="text-red-500">*</span>
          </Label>
          <div className="mb-3">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="tooltip-icon" />
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  className="z-50 max-w-xl break-words p-3 text-sm text-gray-700 leading-relaxed"
                >
                  <p>
                    Each promotion must have a name. Can include letters,
                    numbers, or underscores. No special characters allowed.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <Input
          {...register("name")}
          maxLength={50}
          className="form-input"
          onInput={(e) => {
            const input = e.currentTarget;
            if (input.value.length > 50) {
              input.value = input.value.slice(0, 50);
            }
          }}
          onBlur={() => {
            if (!codeEdited && name && !isEdit) {
              const autoCode = name
                .trim()
                .toLowerCase()
                .replace(/[^a-zA-Z0-9_]/g, "_");
              setValue("code", autoCode);
            }
          }}
        />

        {errors.name && <p className="error-message">{errors.name.message}</p>}
      </div>

      <div>
        <div className="flex items-center gap-2">
          <Label className="form-label">
            Promotion Code<span className="text-red-500">*</span>
          </Label>
          <div className="mb-3">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="tooltip-icon" />
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  className="max-w-xl break-words p-3 text-sm text-gray-700 leading-relaxed"
                >
                  <p>
                    Automatically generated from Promotion Name. Must be unique.
                    Only letters, numbers, or underscores allowed.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <Input
          {...register("code")}
          disabled={isEdit}
          maxLength={50}
          onChange={() => setCodeEdited(true)}
          className="form-input"
        />

        {errors.code && <p className="error-message">{errors.code.message}</p>}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label className="form-label">Game Type<span className="text-red-500">*</span></Label>
          <Select
            value={String(gameConfigType)}
            onValueChange={(val) => {
              const parsed = Number(val) as GameType;
              setValue("gameConfigType", parsed);
            }}
            disabled={isRunning}
          >
            <SelectTrigger className="select-wrapper">
              <SelectValue placeholder="Select game type" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value={String(GAME_TYPES.CLASSIC)}>
                Classic Slot
              </SelectItem>
              <SelectItem value={String(GAME_TYPES.CASCADING)}>
                Cascading Slot
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="form-label">
            No. of Free Spins<span className="text-red-500">*</span>
          </Label>
          <Input
            type="number"
            {...register("bonusItemCount", { valueAsNumber: true })}
            className="form-input"
            disabled={isRunning}
          />
          {errors.bonusItemCount && (
            <p className="error-message">{errors.bonusItemCount.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DateTimePicker
          label="Start Date"
          value={useWatch({ control, name: "startDate" })}
          onChange={(val) => setValue("startDate", val)}
          error={errors.startDate?.message}
          disabled={isRunning}
        />
        <DateTimePicker
          label="End Date"
          value={useWatch({ control, name: "endDate" })}
          onChange={(val) => setValue("endDate", val)}
          error={errors.endDate?.message}
          disabled={isRunning}
        />
      </div>

      <div>
        <Label className="form-label">Operator<span className="text-red-500">*</span></Label>
        <Select
          value={useWatch({ control, name: "operatorId" })}
          onValueChange={(val) => setValue("operatorId", val)}
          disabled={isRunning}
        >
          <SelectTrigger className="select-wrapper">
            <SelectValue placeholder="Select Operator" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            {operators.map((op, index) => (
              <SelectItem
                key={op.PartnerId}
                value={op.PartnerId}
                className={cn(
                  "text-sm py-3 hover:bg-gray-100 cursor-pointer",
                  index % 2 === 0 ? "bg-gray-50" : "bg-white"
                )}
              >
                {op.Name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.operatorId && (
          <p className="error-message">{errors.operatorId.message}</p>
        )}
      </div>
    </div>
  );
}
