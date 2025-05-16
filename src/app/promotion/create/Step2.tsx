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
import { useEffect, useState } from "react";
import { CurrencyGroup } from "@/types/currency-group";
import { PlayerListModal } from "./PlayerListModal";
import { Operator } from "@/types/operator";

interface Step2Props {
  mode: string;
  status: string;
  setValue: UseFormSetValue<PromotionFormValues>;
  control: Control<PromotionFormValues>;
  errors: FieldErrors<PromotionFormValues>;
  openBetSettings: boolean;
  setOpenBetSettings: (val: boolean) => void;
  siteInput: string;
  setSiteInput: (val: string) => void;
  games: Game[];
  currencyGroupsInfo: CurrencyGroup[];
  operators: Operator[];
  initialOfferedPlayerIds?: string[];
  isLoadingCurrencyGroups: boolean;
  isLoading: boolean;
  error: Error | null;
  toggleGame: (id: number) => void;
}

interface GameSelectionProps {
  shouldShowGames: boolean;
  isLoading: boolean;
  error: string | null;
  games: { GameId: number; DisplayName: string }[];
  gameIds: number[];
  setValue: UseFormSetValue<PromotionFormValues>;
  isRunning: boolean;
  toggleGame: (id: number) => void;
}

function GameSelection({
  shouldShowGames,
  isLoading,
  error,
  games,
  gameIds,
  setValue,
  isRunning,
  toggleGame,
}: GameSelectionProps) {
  if (!shouldShowGames) {
    return (
      <p className="text-sm text-gray-500 italic">
        No games available. Please select Game Type and Currency Groups.
      </p>
    );
  }
  if (isLoading) {
    return <p className="text-blue-700">Loading games...</p>;
  }
  if (error) {
    return <p className="text-red-500">Failed to load games</p>;
  }
  if (games.length === 0) {
    return (
      <p className="text-sm text-gray-500 italic">
        No games found for the selected configuration.
      </p>
    );
  }

  return (
    <>
      <p className="text-xs text-muted-foreground mb-3">
        + The list of slot games is based on the selected Operator, Game Type,
        and Currency Groups that have been enabled for the promotion.
      </p>
      {/* Check all */}
      <div className="flex items-center space-x-2 mb-4">
        <Checkbox
          id="game-check-all"
          checked={gameIds.length === games.length}
          onCheckedChange={(checked) => {
            const allGameIds = games.map((g: { GameId: number }) => g.GameId);
            setValue("gameIds", checked ? allGameIds : []);
          }}
          disabled={isRunning}
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
                  disabled={isRunning}
                />
                <span className="text-sm">{game.DisplayName}</span>
              </div>
            </label>
          );
        })}
      </div>
    </>
  );
}

export default function Step2({
  mode,
  status,
  setValue,
  control,
  errors,
  openBetSettings,
  setOpenBetSettings,
  siteInput,
  setSiteInput,
  games,
  currencyGroupsInfo,
  operators,
  initialOfferedPlayerIds,
  isLoadingCurrencyGroups,
  isLoading,
  error,
  toggleGame,
}: Step2Props) {
  const isEdit = mode === "edit";
  const isRunning = isEdit && status === "running";
  const gameIds = useWatch({ control, name: "gameIds" });
  const operatorId = useWatch({ control, name: "operatorId" });
  const gameConfigType = useWatch({ control, name: "gameConfigType" });
  const allPlayers = useWatch({ control, name: "allPlayers" });
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const betLevels = useWatch({ control, name: "betLevels" });
  const offeredPlayerIds =
    useWatch({ control, name: "offeredPlayerIds" }) ?? [];
  const currencyGroups = useWatch({ control, name: "currencyGroups" }) || [];
  const [showPlayerList, setShowPlayerList] = useState(false);
  const shouldShowGames =
    currencyGroups.length > 0 && gameConfigType !== undefined;
  useEffect(() => {
    const validGameIds = gameIds.filter((id) =>
      games.some((g) => g.GameId === id)
    );

    if (validGameIds.length !== gameIds.length) {
      setValue("gameIds", validGameIds);
    }
  }, [games]);
  return (
    <div className="space-y-6">
      <fieldset className="fieldset-wrapper-operator">
        <legend className="legend-wrapper">⚙️ Configuration</legend>
        {/* Bet Settings */}
        <div className="flex items-center gap-2 mb-2">
          <span className="form-label font-semibold text-base leading-tight">
            Currency Group Settings<span className="text-red-500">*</span>
          </span>
          {isLoadingCurrencyGroups ? (
            <p className="text-blue-700">Loading currency groups...</p>
          ) : (
            <button
              type="button"
              onClick={() => setOpenBetSettings(true)}
              className="text-gray-700 hover:text-blue-600 transition"
              aria-label="Edit Bet Settings"
            >
              <SquarePen className="w-5 mb-3" />
            </button>
          )}
        </div>
        {errors.currencyGroups && (
          <p className="error-message mt-2">{errors.currencyGroups.message}</p>
        )}
        {/* Site Offering */}
        <div className="mt-3">
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
            disabled={isRunning}
          />
          <p className="text-xs text-muted-foreground mt-1">
            + Enter the site names to offer the promotion (Separate multiple
            names with a semicolon ;).
          </p>{" "}
          <p className="text-xs text-muted-foreground mt-1">
            + Leave the field empty to offer the promotion to all sites
            associated with the selected Operator.
          </p>
        </div>
      </fieldset>

      <fieldset className="fieldset-wrapper-games">
        <legend className="legend-wrapper">🎮 Game Selection</legend>
        <GameSelection
          shouldShowGames={shouldShowGames}
          isLoading={isLoading}
          error={error instanceof Error ? error.message : error || null}
          games={games}
          gameIds={gameIds}
          setValue={setValue}
          isRunning={isRunning}
          toggleGame={toggleGame}
        />
        {errors.gameIds && (
          <p className="text-sm text-red-600 mt-2">{errors.gameIds.message}</p>
        )}
      </fieldset>
      <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-1 items-start">
        <div>
          <Label className="form-label">👥 Target Members</Label>
          <RadioGroup
            value={allPlayers ? "true" : "false"}
            onValueChange={(val) => {
              const isAll = val === "true";
              setValue("allPlayers", isAll);

              if (isAll) {
                // ✅ Chuyển sang All Players → xóa dữ liệu player
                setValue("offeredPlayerIds", []);
                setValue("uploadedFile", undefined);
                setUploadedFile(null);
              } else {
                if (mode === "edit") {
                  const dummy = new File([], "", {
                    type: "text/csv",
                  });
                  setValue("uploadedFile", dummy);
                  setUploadedFile(dummy);
                  setValue("offeredPlayerIds", initialOfferedPlayerIds || []);
                } else {
                  // ✅ Add New → reset sạch
                  setValue("offeredPlayerIds", []);
                  setValue("uploadedFile", undefined);
                  setUploadedFile(null);
                }
              }
            }}
            disabled={isRunning}
          >
            <div className="flex gap-4 items-center">
              <RadioGroupItem
                value="true"
                id="all"
                className="data-[state=checked]:bg-green-500 bg-white border-gray-300"
                disabled={isRunning}
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
                disabled={isRunning}
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
                disabled={isRunning}
                setShowPlayerList={setShowPlayerList}
                offeredPlayerIds={offeredPlayerIds || []}
                uploadedFile={uploadedFile}
                onValidFile={(file, data) => {
                  const playerIds = data
                    .map((row) => row.PlayerID?.toString())
                    .filter(Boolean);
                  setUploadedFile(file);
                  setValue("uploadedFile", file);
                  setValue("offeredPlayerIds", playerIds);
                }}
              />

              <a
                href="/sample-files/player-list-template.csv"
                download
                className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 text-sm font-medium"
              >
                📥 Download Sample File
              </a>
              <PlayerListModal
                showPlayerList={showPlayerList}
                setShowPlayerList={setShowPlayerList}
                offeredPlayerIds={offeredPlayerIds}
              />
              {typeof errors.uploadedFile?.message === "string" && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.uploadedFile.message}
                </p>
              )}
            </>
          )}
        </div>
        <div className="text-xs text-muted-foreground space-y-1">
          <p>
            + FSB will be given to everybody who opens Promoted game during
            promo period.
          </p>
          <p>
            + Only those players from the upload file will receive FSB during
            promo campaign.
          </p>
          <p>
            + The file must be saved as a .csv file, and the size cannot be
            bigger than 2MB.
          </p>
        </div>
      </div>

      <BetSettingsDialog
        open={openBetSettings && !isLoadingCurrencyGroups}
        onClose={() => setOpenBetSettings(false)}
        partnerId={operatorId}
        gameType={gameConfigType}
        currencyGroupsInfo={currencyGroupsInfo}
        readonly={isRunning}
        onSave={({ currencyGroups, betLevels }) => {
          setValue("currencyGroups", currencyGroups);
          setValue("betLevels", betLevels);
        }}
        games={games}
        initialValues={betLevels}
        operators={operators}
      />
    </div>
  );
}
