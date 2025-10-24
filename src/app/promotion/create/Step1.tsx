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
import { Info, Calculator } from "lucide-react";
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
import { addMonths } from "date-fns";

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

const FORM_INPUT_CLASS = "form-input";
const BORDER_RED_CLASS = "border-red-500";

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
  const invalidKeys = [".", ",", "e", "+", "-", "E"];

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-1 mb-2">
            <Label
              className="form-label flex items-center gap-1"
              htmlFor="promotion-name"
            >
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
                    sideOffset={5}
                    className="tooltip-content-name"
                  >
                    <div>
                      <p>Two different promotions can have the same name.</p>
                      <p>Can include letters, numbers, or underscores.</p>
                      <p>
                        No special characters (e.g. @, #, $, %, etc.) allowed.
                      </p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          <Input
            {...register("name", { required: "Promotion name is required" })}
            id="promotion-name"
            aria-label="Promotion Name"
            aria-required="true"
            maxLength={50}
            className={cn(FORM_INPUT_CLASS, errors.name && BORDER_RED_CLASS)}
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

          {errors.name && (
            <p className="error-message" role="alert">
              {errors.name.message}
            </p>
          )}
        </div>

        <div>
          <div className="flex items-center gap-2">
            <Label className="form-label" htmlFor="promotion-code">
              Promotion Code (Gift Code)<span className="text-red-500">*</span>
            </Label>
            <div className="mb-3">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="tooltip-icon" />
                  </TooltipTrigger>
                  <TooltipContent
                    side="right"
                    sideOffset={5}
                    className="tooltip-content-name"
                  >
                    <div>
                      <p>Must be unique across all promotions. </p>
                      <p>Only letters, numbers, or underscores allowed.</p>
                      <p>
                        No spaces or special characters (e.g. @, #, $, %, etc.)
                        allowed.
                      </p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          <Input
            {...register("code", { required: "Promotion code is required" })}
            id="promotion-code"
            aria-label="Promotion Code"
            aria-required="true"
            disabled={isEdit}
            maxLength={50}
            onChange={() => setCodeEdited(true)}
            className={cn(FORM_INPUT_CLASS, errors.code && BORDER_RED_CLASS)}
          />

          {errors.code && (
            <p className="error-message" role="alert">
              {errors.code.message}
            </p>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div>
          <Label className="form-label mb-1" htmlFor="game-type">
            Game Type<span className="text-red-500">*</span>
          </Label>
          <Select
            value={String(gameConfigType)}
            onValueChange={(val) => {
              const parsed = Number(val) as GameType;
              setValue("gameConfigType", parsed);
            }}
            disabled={isRunning}
          >
            <SelectTrigger
              className={cn(
                FORM_INPUT_CLASS,
                errors.gameConfigType && BORDER_RED_CLASS
              )}
              id="game-type"
              aria-label="Game Type"
              aria-required="true"
            >
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
          {errors.gameConfigType && (
            <p className="error-message" role="alert">
              {errors.gameConfigType.message}
            </p>
          )}
        </div>

        <div>
          <Label className="form-label mb-1" htmlFor="free-spins">
            No. of Free Spins<span className="text-red-500">*</span>
          </Label>
          <Input
            type="number"
            step={1}
            inputMode="numeric"
            pattern="\d*"
            onKeyDown={(e) => invalidKeys.includes(e.key) && e.preventDefault()}
            id="free-spins"
            aria-label="No. of Free Spins"
            aria-required="true"
            {...register("bonusItemCount", {
              required: "Free spins is required",
              min: { value: 1, message: "Free spins must be greater than 0" },
              valueAsNumber: true,
            })}
            onBlur={(e) => {
              const raw = e.target.value.trim();
              const parsed = parseInt(raw, 10);
              if (isNaN(parsed) || parsed < 0) {
                e.target.value = "0";
                setValue("bonusItemCount", 0, { shouldValidate: true });
              }
            }}
            className={cn(
              FORM_INPUT_CLASS,
              errors.bonusItemCount && BORDER_RED_CLASS
            )}
            disabled={isRunning}
          />
          {errors.bonusItemCount && (
            <p className="error-message" role="alert">
              {errors.bonusItemCount.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
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
          onChange={(val) => {
            setValue("endDate", val);
            const oneMonthLater = addMonths(val, 1);
            const claimExpirationDate = new Date(oneMonthLater.getFullYear(), oneMonthLater.getMonth(), oneMonthLater.getDate(), 23, 59, 59, 0);
            setValue("claimExpirationDate", claimExpirationDate);
          }}
          error={errors.endDate?.message}
          disabled={isRunning}
        />
      </div>

      <div className="font-semibold text-lg mb-2">
        Bonus Redemption Settings
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div>
          <Label
            className={`form-label mb-1 p-[5px]`}
            htmlFor="min-turnover-multiplier"
          >
            Minimum Turnover Requirement (X Times)
            <span className="text-red-500">*</span>
          </Label>

          <Input
            type="number"
            step={1}
            inputMode="numeric"
            pattern="\d*"
            onKeyDown={(e) => invalidKeys.includes(e.key) && e.preventDefault()}
            id="min-turnover-multiplier"
            aria-label="Min Turnover Multiplier"
            aria-required="true"
            {...register("minTurnoverMultiplier", {
              required: "Min Turnover Multiplier is required",
              min: {
                value: 2,
                message: "Min Turnover Multiplier must be greater than 2",
              },
              valueAsNumber: true,
            })}
            onBlur={(e) => {
              const raw = e.target.value.trim();
              const parsed = parseInt(raw, 10);
              if (isNaN(parsed) || parsed < 2) {
                e.target.value = "2";
                setValue("minTurnoverMultiplier", 2, { shouldValidate: true });
              }
            }}
            className={cn(
              FORM_INPUT_CLASS,
              errors.minTurnoverMultiplier && BORDER_RED_CLASS
            )}
            disabled={isRunning}
          />
          {errors.minTurnoverMultiplier && (
            <p className="error-message" role="alert">
              {errors.minTurnoverMultiplier.message}
            </p>
          )}
        </div>

        <DateTimePicker
          label="Claim Expiration Date"
          value={useWatch({ control, name: "claimExpirationDate" })}
          onChange={(val) => setValue("claimExpirationDate", val)}
          error={errors.claimExpirationDate?.message}
          disabled={isRunning}
        />
      </div>

      <div className="text-xs text-gray-500 mt-1">
        Players must wager this many times their real money before claiming promotion wins. Minimum: 2x.
      </div>
      <div className="mt-2">
        <div className="bg-gray-50 border border-gray-200 rounded px-4 py-3 flex flex-col gap-1">
          <div className="flex items-center gap-1 mb-0.5">
            <Calculator className="w-4 h-4 text-gray-500" />
            <span className="font-semibold">Turnover Calculation Scope</span>
          </div>
          <div className="text-xs text-gray-600">
            Turnover for this promotion is calculated only on real money wagers
            made in the selected game.
          </div>
        </div>
      </div>
      <div>
        <Label className="form-label mb-1" htmlFor="operator">
          Operator<span className="text-red-500">*</span>
        </Label>
        <Select
          value={useWatch({ control, name: "operatorId" })}
          onValueChange={(val) => setValue("operatorId", val)}
          disabled={isRunning}
        >
          <SelectTrigger
            className={cn(
              FORM_INPUT_CLASS,
              errors.operatorId && BORDER_RED_CLASS
            )}
            id="operator"
            aria-label="Operator"
            aria-required="true"
          >
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
          <p className="error-message" role="alert">
            {errors.operatorId.message}
          </p>
        )}
      </div>
    </div>
  );
}
