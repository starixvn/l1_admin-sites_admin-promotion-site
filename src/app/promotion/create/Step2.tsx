import BetSettingsDialog from "./BetSettingsDialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import type {
  UseFormSetValue,
  UseFormWatch,
  FieldErrors,
} from "react-hook-form";
import type { PromotionFormValues } from "./PromotionForm";
import type { Game } from "@/types/game";
import { SquarePen } from "lucide-react";
import PlayerFileUploader from "./PlayerFileUploader";

interface Step2Props {
  setValue: UseFormSetValue<PromotionFormValues>;
  watch: UseFormWatch<PromotionFormValues>;
  errors: FieldErrors<PromotionFormValues>;
  isPending: boolean;
  onBack: () => void;
  openBetSettings: boolean;
  setOpenBetSettings: (val: boolean) => void;
  siteInput: string;
  setSiteInput: (val: string) => void;
  games: Game[];
  isLoading: boolean;
  error: Error | null;
  toggleGame: (id: number) => void;
}

export default function Step2({
  setValue,
  watch,
  errors,
  isPending,
  onBack,
  openBetSettings,
  setOpenBetSettings,
  siteInput,
  setSiteInput,
  games,
  isLoading,
  error,
  toggleGame,
}: Step2Props) {
  return (
    <div className="space-y-6">
      <fieldset className="fieldset-wrapper-operator">
        <legend className="legend-wrapper">⚙️ Configuration</legend>
        {/* Bet Settings */}
        <div className="flex items-center gap-2 mb-6">
          <span className="form-label font-semibold text-base">
            * Bet Settings
          </span>
          <button
            type="button"
            onClick={() => setOpenBetSettings(true)}
            className="text-gray-700 hover:text-blue-600 transition"
            aria-label="Edit Bet Settings"
          >
            <SquarePen className="w-5 h-5" />
          </button>
        </div>

        {/* Site Offering */}
        <div>
          <Label className="form-label">Site Offering</Label>
          <Input
            className="form-input"
            placeholder="e.g. site1;site2"
            value={siteInput}
            onChange={(e) => {
              const value = e.target.value;
              setSiteInput(value);
              const array = Array.from(
                new Set(
                  value
                    .split(";")
                    .map((s) => s.trim())
                    .filter(Boolean)
                )
              );
              setValue("offeredSiteNames", array);
            }}
          />
          <p className="text-medium text-muted-foreground mt-1">
            ** Enter the site names to offer the promotion (Separate multiple
            names with a semicolon ;). Leave the field empty to offer the
            promotion to all sites associated with the selected Operator.
          </p>
        </div>

        {errors.currencyGroups && (
          <p className="error-message mt-2">{errors.currencyGroups.message}</p>
        )}
      </fieldset>

      <fieldset className="fieldset-wrapper-games">
        <legend className="legend-wrapper">🎮 Game Selection</legend>
        {isLoading && <p className="text-blue-700">Loading games...</p>}
        {error && <p className="text-red-500">Failed to load games</p>}

        {/* Check all */}
        <div className="flex items-center space-x-2 mb-4">
          <Checkbox
            id="game-check-all"
            checked={
              games.length > 0 && watch("gameIds").length === games.length
            }
            onCheckedChange={(checked) => {
              const allGameIds = games.map((g) => g.GameId);
              setValue("gameIds", checked ? allGameIds : []);
            }}
          />
          <label
            htmlFor="game-check-all"
            className="text-md font-semibold text-blue-800"
          >
            Check All
          </label>
        </div>
        <div className="border-b mb-4" />

        {/* Game list */}
        <div className="grid gap-3 max-h-[15rem] overflow-y-auto pr-2">
          {games.map((game) => {
            const isChecked = watch("gameIds").includes(game.GameId);
            return (
              <label
                key={game.GameId}
                htmlFor={`game-${game.GameId}`}
                className={cn(
                  "flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer",
                  isChecked
                    ? "bg-blue-50 border-blue-200 text-blue-800 font-medium"
                    : "bg-white border-blue-100 hover:bg-blue-50"
                )}
              >
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id={`game-${game.GameId}`}
                    checked={isChecked}
                    onCheckedChange={() => toggleGame(game.GameId)}
                  />
                  <span className="text-base">{game.DisplayName}</span>
                </div>
              </label>
            );
          })}
        </div>

        {errors.gameIds && (
          <p className="error-message mt-2">{errors.gameIds.message}</p>
        )}
      </fieldset>

      <div>
        <Label className="form-label">👥 Target Members</Label>
        <RadioGroup
          value={watch("allPlayers") ? "true" : "false"}
          onValueChange={(val) => setValue("allPlayers", val === "true")}
        >
          <div className="flex gap-4 items-center">
            <RadioGroupItem value="true" id="all" />
            <label htmlFor="all">All Players</label>
          </div>
          <div className="flex gap-4 items-center">
            <RadioGroupItem value="false" id="file" />
            <label htmlFor="file">Players from File</label>
          </div>
        </RadioGroup>
        {!watch("allPlayers") && (
          <PlayerFileUploader
            onValidFile={(file, data) => {
              const playerIds = data
                .map((row) => row.PlayerID?.toString())
                .filter(Boolean);
              console.log("File hợp lệ:", file);
              console.log("Parsed data:", data);
              setValue("uploadedFile", file);
              setValue("offeredPlayerIds", playerIds);
            }}
          />
        )}
      </div>
      <div className="flex justify-between">
        <button type="button" className="btn-cancel" onClick={onBack}>
          ← Back
        </button>
        <button type="submit" className="btn-primary" disabled={isPending}>
          {isPending ? "Saving..." : "Save Promotion"}
        </button>
      </div>

      <BetSettingsDialog
        open={openBetSettings}
        onClose={() => setOpenBetSettings(false)}
        partnerId={watch("operatorId")}
        gameType={watch("gameConfigType")}
        onSave={({ currencyGroups, betLevels }) => {
          setValue("currencyGroups", currencyGroups);
          setValue("betLevels", betLevels);
        }}
      />
    </div>
  );
}
