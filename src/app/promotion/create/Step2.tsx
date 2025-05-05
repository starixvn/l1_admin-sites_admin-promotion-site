import BetSettingsDialog from "./BetSettingsDialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import {
  UseFormSetValue,
  Control,
  FieldErrors,
  useWatch,
} from "react-hook-form";
import type { PromotionFormValues } from "./PromotionForm";
import type { Game } from "@/types/game";
import { SquarePen } from "lucide-react";
import PlayerFileUploader from "./PlayerFileUploader";
import { useState } from "react";

interface Step2Props {
  setValue: UseFormSetValue<PromotionFormValues>;
  control: Control<PromotionFormValues>;
  errors: FieldErrors<PromotionFormValues>;
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
  control,
  errors,
  openBetSettings,
  setOpenBetSettings,
  siteInput,
  setSiteInput,
  games,
  isLoading,
  error,
  toggleGame,
}: Step2Props) {
  const gameIds = useWatch({ control, name: "gameIds" });
  const operatorId = useWatch({ control, name: "operatorId" });
  const gameConfigType = useWatch({ control, name: "gameConfigType" });
  const allPlayers = useWatch({ control, name: "allPlayers" });
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const betLevels = useWatch({ control, name: "betLevels" });

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
        {errors.currencyGroups && (
          <p className="error-message mt-2">{errors.currencyGroups.message}</p>
        )}

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
          <p className="text-xs text-muted-foreground mt-1">
            ** Enter the site names to offer the promotion (Separate multiple
            names with a semicolon ;). Leave the field empty to offer the
            promotion to all sites associated with the selected Operator.
          </p>
        </div>
      </fieldset>

      <fieldset className="fieldset-wrapper-games">
        <legend className="legend-wrapper">🎮 Game Selection</legend>
        {isLoading && <p className="text-blue-700">Loading games...</p>}
        {error && <p className="text-red-500">Failed to load games</p>}

        {/* Check all */}
        <div className="flex items-center space-x-2 mb-4">
          <Checkbox
            id="game-check-all"
            checked={games.length > 0 && gameIds.length === games.length}
            onCheckedChange={(checked) => {
              const allGameIds = games.map((g) => g.GameId);
              setValue("gameIds", checked ? allGameIds : []);
            }}
          />
          <label
            htmlFor="game-check-all"
            className="text-sm font-semibold text-gray-800"
          >
            Check All
          </label>
        </div>
        <div className="border-b mb-4" />

        {/* Game list */}
        <div className="grid gap-3 max-h-[15rem] overflow-y-auto pr-2">
          {games.map((game) => {
            const isChecked = gameIds.includes(game.GameId);
            return (
              <label
                key={game.GameId}
                htmlFor={`game-${game.GameId}`}
                className={cn(
                  "flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer",
                  isChecked
                    ? "bg-green-50 border-green-200 text-green-800 font-small"
                    : "bg-white border-green-100 hover:bg-green-50"
                )}
              >
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id={`game-${game.GameId}`}
                    checked={isChecked}
                    onCheckedChange={() => toggleGame(game.GameId)}
                  />
                  <span className="text-sm">{game.DisplayName}</span>
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
          value={allPlayers ? "true" : "false"}
          onValueChange={(val) => {
            setValue("allPlayers", val === "true");
            setValue("offeredPlayerIds", []);
          }}
        >
          <div className="flex gap-4 items-center">
            <RadioGroupItem
              value="true"
              id="all"
              className="data-[state=checked]:bg-green-500 bg-white border-gray-300"
            />
            <label htmlFor="all" className="text-sm">
              All Players
            </label>
          </div>
          <div className="flex gap-4 items-center">
            <RadioGroupItem
              value="false"
              id="file"
              className="data-[state=checked]:bg-green-500 bg-white border-gray-300"
            />
            <label htmlFor="file" className="text-sm">
              Players from File
            </label>
          </div>
        </RadioGroup>

        {!allPlayers && (
          <>
            <PlayerFileUploader
              operatorId={operatorId}
              onValidFile={(file, data) => {
                const playerIds = data
                  .map((row) => row.PlayerID?.toString())
                  .filter(Boolean);
                setUploadedFile(file);
                setValue("uploadedFile", file);
                setValue("offeredPlayerIds", playerIds);
              }}
            />
            {uploadedFile && (
              <a
                href={URL.createObjectURL(uploadedFile)}
                download={uploadedFile.name}
                className="block text-blue-700 hover:underline text-sm mt-2"
              >
                📎 {uploadedFile.name}
              </a>
            )}
          </>
        )}
      </div>

      <BetSettingsDialog
        open={openBetSettings}
        onClose={() => setOpenBetSettings(false)}
        partnerId={operatorId}
        gameType={gameConfigType}
        initialBetLevels={betLevels}
        onSave={({ currencyGroups, betLevels }) => {
          setValue("currencyGroups", currencyGroups);
          setValue("betLevels", betLevels);
        }}
      />
    </div>
  );
}
