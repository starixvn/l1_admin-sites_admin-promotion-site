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
import { parseSiteInput } from "@/lib/promotion/promotion.utils";

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
  const selectedGameId = Array.isArray(gameIds) && gameIds.length > 0 ? gameIds[0] : undefined;
  const [filter, setFilter] = useState("");
  const filteredGames = games.filter((game) =>
    game.DisplayName.toLowerCase().includes(filter.toLowerCase())
  );
  if (!shouldShowGames) {
    return (
      <p className="text-sm text-gray-500 italic">
        No games available. Please select a currency group in the{" "}
        <strong>Currency Group Settings.</strong>
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
      {/* Filter input */}
      <div className="mb-3">
        <input
          type="text"
          className="form-input w-full border rounded px-3 py-2 text-sm"
          placeholder="Filter games by name"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          disabled={isRunning}
        />
      </div>
      {/* Game list - radio only */}
      <div className="grid gap-3 max-h-[15rem] overflow-y-auto pr-2">
        {filteredGames.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No games match your filter.</p>
        ) : (
          filteredGames.map((game) => (
            <label
              key={game.GameId}
              htmlFor={`game-${game.GameId}`}
              className={cn(
                "flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer",
                selectedGameId === game.GameId
                  ? "bg-green-50 border-green-200 text-green-800 font-small"
                  : "bg-white border-green-100 hover:bg-green-50"
              )}
            >
              <div className="flex items-center space-x-3">
                <input
                  type="radio"
                  id={`game-${game.GameId}`}
                  name="gameId"
                  checked={selectedGameId === game.GameId}
                  onChange={() => setValue("gameIds", [game.GameId])}
                  disabled={isRunning}
                />
                <span className="text-sm">{game.DisplayName}</span>
              </div>
            </label>
          ))
        )}
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
  const isGiftCode = useWatch({ control, name: "isGiftCode" });
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
  useEffect(() => {
    const array = parseSiteInput(siteInput);
    setValue("offeredSiteNames", array);
  }, [siteInput]);
  return (
    <div className="space-y-6">
      <fieldset className="fieldset-wrapper-operator">
        <legend className="legend-wrapper">⚙️ Configuration</legend>
        {/* Bet Settings */}
        <div className="mb-2">
          {isLoadingCurrencyGroups ? (
            <p className="text-blue-700 font-medium text-sm">
              Loading Currency Groups...
            </p>
          ) : (
            <button
              type="button"
              onClick={() => setOpenBetSettings(true)}
              aria-label="Edit Bet Settings"
              className="h-[35px] px-4 bg-emerald-500 text-white rounded-lg font-medium
            hover:bg-emerald-600 transition-colors flex items-center gap-2
            border border-transparent focus:outline-none focus:border-black cursor-pointer"
            >
              <SquarePen className="w-4 h-4" />
              Currency Group Settings
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
            onChange={(e) => setSiteInput(e.target.value)}
            onBlur={() =>
              setValue("offeredSiteNames", parseSiteInput(siteInput))
            }
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
        <legend className="legend-wrapper">
          🎮 Game Selection <span className="text-red-500">*</span>
        </legend>
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
            value={
              allPlayers 
                ? "all" 
                : (isGiftCode ? "gift-code" : "file")
            }
            onValueChange={(val) => {
              if (val === "all") {
                setValue("allPlayers", true);
                setValue("isGiftCode", false);
                setValue("offeredPlayerIds", []);
                setValue("uploadedFile", undefined);
                setUploadedFile(null);
              } else if (val === "gift-code") {
                setValue("allPlayers", false);
                setValue("isGiftCode", true);
                setValue("offeredPlayerIds", []);
                setValue("uploadedFile", undefined);
                setUploadedFile(null);
              } else if (val === "file") {
                setValue("allPlayers", false);
                setValue("isGiftCode", false);
                if (mode === "edit") {
                  const dummy = new File([], "", {
                    type: "text/csv",
                  });
                  setValue("uploadedFile", dummy);
                  setUploadedFile(dummy);
                  setValue("offeredPlayerIds", initialOfferedPlayerIds || []);
                } else {
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
                value="all"
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
                value="gift-code"
                id="gift-code"
                className="data-[state=checked]:bg-green-500 bg-white border-gray-300"
                disabled={isRunning}
              />
              <label htmlFor="gift-code" className="text-sm">
                Players have Gift Code
              </label>
            </div>
            <div className="flex gap-4 items-center">
              <RadioGroupItem
                value="file"
                id="file"
                className="data-[state=checked]:bg-green-500 bg-white border-gray-300"
                disabled={isRunning}
              />
              <label htmlFor="file" className="text-sm">
                Players from File
              </label>
            </div>
          </RadioGroup>

          {!allPlayers && !isGiftCode && (
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
                href="/sample-files/FSB Players List.csv"
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
            + Only players with a valid code can redeem the PSB.
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
