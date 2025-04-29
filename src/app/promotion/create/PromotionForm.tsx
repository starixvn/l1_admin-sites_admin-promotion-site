import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { cn } from "@/lib/utils";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import BetSettingsDialog from "./BetSettingsDialog";
import { useOperators } from "@/hooks/useOperators";
import { useFilteredGames } from "@/hooks/useFilteredGames";
import type { Game } from "@/types/game";
import type { Operator } from "@/types/operator";
import { GAME_TYPES, type GameType } from "@/constants/gameTypes";
import DateTimePicker from "@/components/custom/date-time-picker";
import { useCreatePromotion } from "@/hooks/useCreatePromotion";
import { Pencil } from "lucide-react";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const getNowInGMT7 = () => {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utc + 7 * 60 * 60 * 1000);
};

const promotionSchema = z
  .object({
    name: z
      .string()
      .min(1, "Promotion name is required")
      .max(50)
      .regex(
        /^[a-zA-Z0-9_ ]+$/,
        "Only letters, numbers, and underscores allowed"
      ),
    code: z
      .string()
      .min(1, "Promotion code is required")
      .max(50)
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "Only letters, numbers, and underscores allowed"
      ),
    bonusItemCount: z.coerce
      .number()
      .min(1, "Free spins must be greater than 0"),
    startDate: z.coerce.date({
      required_error: "Start date is required",
      invalid_type_error: "Invalid start date",
    }),
    endDate: z.coerce.date({
      required_error: "End date is required",
      invalid_type_error: "Invalid end date",
    }),
    operatorId: z.coerce.string().min(1, { message: "Operator is required" }),
    offeredSiteNames: z.array(z.string()).optional(),
    gameIds: z.array(z.coerce.number()).min(1, "Select at least one game"),
    currencyGroups: z
      .array(z.string().nonempty("Currency group cannot be empty"))
      .min(1, "At least one currency group is required"),
    allPlayers: z.boolean(),
    offeredPlayerIds: z.array(z.string()).optional(),
    uploadedFile: z.any().optional(),
    gameConfigType: z.nativeEnum(GAME_TYPES),
    betLevels: z
      .array(
        z.object({
          currencyGroup: z.string().min(1, "Currency Group is required"),
          betLevel: z.coerce
            .number()
            .min(0.01, "Bet Level must be greater than 0"),
        })
      )
      .optional(),
  })
  .refine((data) => data.endDate > data.startDate, {
    message: "End date must be after start date",
    path: ["endDate"],
  });

export type PromotionFormValues = z.infer<typeof promotionSchema>;

export default function PromotionForm({ onClose }: { onClose?: () => void }) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PromotionFormValues>({
    resolver: zodResolver(promotionSchema),
    defaultValues: {
      name: "",
      code: "",
      bonusItemCount: 0,
      startDate: getNowInGMT7(),
      endDate: getNowInGMT7(),
      operatorId: "",
      offeredSiteNames: [],
      gameIds: [],
      currencyGroups: [],
      allPlayers: true,
      offeredPlayerIds: [],
      uploadedFile: undefined,
      gameConfigType: GAME_TYPES.CLASSIC,
      betLevels: [],
    },
  });

  const [codeEdited, setCodeEdited] = useState(false);
  const [openBetSettings, setOpenBetSettings] = useState(false);
  const name = watch("name");
  const gameIds = watch("gameIds");
  const watchGameType = watch("gameConfigType");
  const watchOperatorId = watch("operatorId");

  const { data: operators = [] } = useOperators();
  const {
    data: games = [],
    isLoading,
    error,
  } = useFilteredGames(watchOperatorId, watchGameType);

  useEffect(() => {
    console.log("Validation errors:", errors);
  }, [errors]);

  useEffect(() => {
    if (!codeEdited && name) {
      const autoCode = name
        .trim()
        .toLowerCase()
        .replace(/[^a-zA-Z0-9_]/g, "_");
      setValue("code", autoCode);
    }
  }, [name, codeEdited, setValue]);

  const toggleGame = (id: number) => {
    const updated = gameIds.includes(id)
      ? gameIds.filter((gid) => gid !== id)
      : [...gameIds, id];
    setValue("gameIds", updated);
  };

  const { mutate: createPromotion, isPending } = useCreatePromotion();

  const onSubmit = (data: PromotionFormValues) => {
    const payload = {
      name: data.name,
      code: data.code,
      operatorId: data.operatorId,
      offeredSiteNames: data.offeredSiteNames ?? [],
      currencyGroups: data.currencyGroups,
      startDate: new Date(data.startDate).toISOString(),
      endDate: new Date(data.endDate).toISOString(),
      bonusItemCount: data.bonusItemCount,
      offeredPlayerIds: data.offeredPlayerIds ?? [],
      gameConfigType: data.gameConfigType,
      gameIds: data.gameIds,
      betLevels: data.betLevels ?? [],
    };

    console.log("Sending payload:", payload);

    createPromotion(payload, {
      onSuccess: (res) => {
        console.log("Promotion created:", res);
        onClose?.();
      },
      onError: (err) => {
        console.error("Failed to create promotion", err);
      },
    });
  };
  const [siteInput, setSiteInput] = useState("");
  return (
    <div>
      <form
        className="max-w-5xl mx-auto bg-gray-100 rounded-md shadow p-6 space-y-6"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Label
                htmlFor="name"
                className="text-lg font-semibold text-gray-700"
              >
                Promotion Name
              </Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="w-4 h-4 text-blue-500" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      Each promotion must have a name. Can include letters,
                      numbers, or underscores. No special characters allowed.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Input
              {...register("name")}
              maxLength={50}
              className="bg-white mt-1"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Label
                htmlFor="code"
                className="text-lg font-semibold text-gray-700"
              >
                Promotion Code
              </Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="w-4 h-4 text-blue-500" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      Automatically generated from Promotion Name. Must be
                      unique. Only letters, numbers, or underscores allowed.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Input
              {...register("code")}
              maxLength={50}
              onChange={() => setCodeEdited(true)}
              className="bg-white mt-1"
            />
            {errors.code && (
              <p className="text-red-500 text-sm mt-1">{errors.code.message}</p>
            )}
          </div>

          <div>
            <Label className="text-lg font-semibold text-gray-700">
              Game Type
            </Label>

            <Select
              defaultValue="2"
              onValueChange={(val) => {
                const parsed = Number(val) as GameType;
                setValue("gameConfigType", parsed);
              }}
            >
              <SelectTrigger className="bg-white border-gray-300 focus:ring-2 focus:ring-primary/50">
                <SelectValue placeholder="Select game type" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem
                  value={String(GAME_TYPES.CLASSIC)}
                  className={cn(
                    "text-base py-3 hover:bg-gray-100 cursor-pointer",
                    "bg-white"
                  )}
                >
                  Classic Slot
                </SelectItem>
                <SelectItem
                  value={String(GAME_TYPES.CASCADING)}
                  className={cn(
                    "text-base py-3 hover:bg-gray-100 cursor-pointer",
                    "bg-gray-50"
                  )}
                >
                  Cascading Slot
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-lg font-semibold text-gray-700">
              No. of Free Spins
            </Label>
            <Input
              type="number"
              className="bg-white mt-1"
              {...register("bonusItemCount", {
                valueAsNumber: true,
              })}
            />

            {errors.bonusItemCount && (
              <p className="text-red-500 text-sm">
                {errors.bonusItemCount.message}
              </p>
            )}
          </div>
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <DateTimePicker
            label="* Start Date"
            value={watch("startDate")}
            onChange={(val) => setValue("startDate", val)}
            error={errors.startDate?.message}
          />
          <DateTimePicker
            label="* End Date"
            value={watch("endDate")}
            onChange={(val) => setValue("endDate", val)}
            error={errors.endDate?.message}
          />
        </div>

        <fieldset className="bg-white rounded-md border p-6 shadow-sm">
          <legend className="text-lg font-semibold">Operator Settings</legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div className="col-span-1 md:col-span-2 flex items-center gap-4">
              <Label
                htmlFor="operatorId"
                className="text-lg font-semibold text-gray-700"
              >
                * Operator Name
              </Label>
              <Select
                value={watch("operatorId") ?? ""}
                onValueChange={(val) => setValue("operatorId", val)}
              >
                <SelectTrigger
                  id="operatorId"
                  className="bg-white border-gray-300 focus:ring-2 focus:ring-primary/50"
                >
                  <SelectValue placeholder="Select Operator" />
                </SelectTrigger>
                <SelectContent className="bg-white border text-gray-800 shadow-lg text-base">
                  {operators.map((op: Operator, index: number) => (
                    <SelectItem
                      key={op.PartnerId}
                      value={op.PartnerId}
                      className={cn(
                        "text-base py-3 hover:bg-gray-100 cursor-pointer",
                        index % 2 === 0 ? "bg-gray-50" : "bg-white"
                      )}
                    >
                      {op.Name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.operatorId && (
                <p className="text-red-500 text-sm mt-1 md:col-span-2">
                  {errors.operatorId.message}
                </p>
              )}
            </div>
            <div className="col-span-1 md:col-span-2 flex items-center gap-2 mt-2">
              <Label className="text-lg font-semibold text-gray-700">
                * Bet Settings
              </Label>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setOpenBetSettings(true)}
                className="h-8 w-8"
              >
                <Pencil className="h-4 w-4 text-muted-foreground" />
              </Button>
              {errors.currencyGroups && (
                <p className="text-red-500 text-sm mt-1 md:col-span-2">
                  {errors.currencyGroups.message}
                </p>
              )}
            </div>
            <div className="md:col-span-2">
              <Label className="text-lg font-semibold text-gray-700">
                Site Offering
              </Label>
              <Input
                className="mt-1"
                placeholder="e.g. site1;site2"
                value={siteInput}
                onChange={(e) => {
                  const value = e.target.value;
                  setSiteInput(value); // vẫn cho gõ tự do

                  // 👉 Parse array: tách theo dấu ;, trim, bỏ rỗng, remove duplicate
                  const array = Array.from(
                    new Set(
                      value
                        .split(";")
                        .map((s) => s.trim())
                        .filter(Boolean)
                    )
                  );

                  setValue("offeredSiteNames", array); // cập nhật vào form
                }}
              />

              <p className="text-xs text-muted-foreground mt-1">
                ** Enter the site names to offer the promotion (Separate
                multiple names with a semicolon ;). Leave the field empty to
                offer the promotion to all sites associated with the selected
                Operator.
              </p>
            </div>
          </div>
        </fieldset>

        <div>
          <Label className="text-lg font-semibold mb-3 block">* Games</Label>
          {isLoading && <p>Loading games...</p>}
          {error && <p className="text-red-500">Failed to load games</p>}

          <div className="border p-4 max-w-md rounded-md bg-white">
            <div className="flex items-center space-x-2 mb-4">
              <Checkbox
                id="game-check-all"
                checked={games.length > 0 && gameIds.length === games.length}
                onCheckedChange={(checked) => {
                  const allGameIds = games.map((g: Game) => g.GameId);
                  setValue("gameIds", checked ? allGameIds : []);
                }}
              />
              <label htmlFor="game-check-all" className="text-sm font-semibold">
                Check All
              </label>
            </div>
            <div className="border-b mb-3" />
            <div className="max-h-[18rem] overflow-y-auto pr-2 space-y-2">
              {games.map((game: Game) => (
                <div key={game.GameId} className="flex items-center space-x-2">
                  <Checkbox
                    id={`game-${game.GameId}`}
                    checked={gameIds.includes(game.GameId)}
                    onCheckedChange={() => toggleGame(game.GameId)}
                  />
                  <label htmlFor={`game-${game.GameId}`} className="text-sm">
                    {game.DisplayName}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {errors.gameIds && (
            <p className="text-red-500 text-sm mt-2">
              {errors.gameIds.message}
            </p>
          )}
        </div>

        <div>
          <Label className="text-lg font-semibold mb-2 block">Members</Label>
          <RadioGroup
            value={watch("allPlayers") ? "true" : "false"}
            onValueChange={(val) => setValue("allPlayers", val === "true")}
            className="space-y-2"
          >
            <div className="flex items-start gap-2">
              <RadioGroupItem value="true" id="all" className="bg-white" />
              <div>
                <label htmlFor="all" className="text-sm font-medium">
                  All Players
                </label>
                <p className="text-xs text-muted-foreground">
                  FSB will be given to everybody who opens the promoted game
                  during the promo period.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <RadioGroupItem value="false" id="file" className="bg-white" />
              <div>
                <label htmlFor="file" className="text-sm font-medium">
                  Players from the file
                </label>
                <p className="text-xs text-muted-foreground">
                  Only the players from the uploaded file will receive the Free
                  Spins Bonus.
                </p>
              </div>
            </div>
          </RadioGroup>

          {!watch("allPlayers") && (
            <div className="mt-4 space-y-1">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <span className="bg-white border border-gray-300 px-3 py-1 text-sm rounded shadow-sm">
                  Choose File
                </span>
                <input
                  type="file"
                  accept=".csv"
                  {...register("uploadedFile")}
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file && file.size > 2 * 1024 * 1024) {
                      alert("File size exceeds 2MB limit");
                      e.target.value = "";
                      return;
                    }
                  }}
                />
              </label>
              {watch("uploadedFile")?.[0]?.name && (
                <p className="text-sm text-blue-600 underline cursor-pointer">
                  {watch("uploadedFile")[0].name} (click to preview)
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Must be a .csv file, maximum size 2MB. Uploading a new file will
                override the existing one.
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-between">
          <Button
            type="button"
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-700"
          >
            Close
          </Button>

          <Button
            type="submit"
            className="bg-red-600 hover:bg-red-700"
            disabled={isPending}
          >
            {isPending ? "Saving..." : "Save"}
          </Button>
        </div>
      </form>
      <BetSettingsDialog
        open={openBetSettings}
        onClose={() => setOpenBetSettings(false)}
        partnerId={watchOperatorId}
        gameType={watchGameType}
        onSave={({ currencyGroups, betLevels }) => {
          setValue("currencyGroups", currencyGroups);
          setValue("betLevels", betLevels);
        }}
      />
    </div>
  );
}
