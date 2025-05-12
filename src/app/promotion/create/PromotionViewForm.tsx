import { Label } from "@/components/ui/label";
import { GAME_TYPES } from "@/constants/gameTypes";
import type { PromotionFormValues } from "./PromotionForm";
import type { Game } from "@/types/game";

interface PromotionViewFormProps {
  data: PromotionFormValues;
  operatorName?: string;
  gameList?: Game[];
}

export default function PromotionViewForm({
  data,
  operatorName,
  gameList,
}: PromotionViewFormProps) {
  const {
    name,
    code,
    gameConfigType,
    bonusItemCount,
    startDate,
    endDate,
    operatorId,
    offeredSiteNames,
    gameIds,
    allPlayers,
    offeredPlayerIds,
    uploadedFile,
    betLevels,
  } = data;

  return (
    <div className="space-y-8 p-6">
      {/* Section 1: Basic Info */}
      <section>
        <h2 className="text-xl font-semibold mb-4">📋 Basic Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ReadOnlyField label="Promotion Name" value={name} />
          <ReadOnlyField label="Promotion Code" value={code} />
          <ReadOnlyField
            label="Game Type"
            value={
              gameConfigType === GAME_TYPES.CLASSIC
                ? "Classic Slot"
                : "Cascading Slot"
            }
          />
          <ReadOnlyField
            label="No. of Free Spins"
            value={String(bonusItemCount)}
          />
          <ReadOnlyField
            label="Start Date"
            value={new Date(startDate).toLocaleString()}
          />
          <ReadOnlyField
            label="End Date"
            value={new Date(endDate).toLocaleString()}
          />
          <ReadOnlyField label="Operator" value={operatorName || operatorId} />
        </div>
      </section>

      {/* Section 2: Site Offering */}
      <section>
        <h2 className="text-xl font-semibold mb-4">🌐 Site Offering</h2>
        <p className="text-gray-700">
          {offeredSiteNames?.join("; ") || "(All sites)"}
        </p>
      </section>

      {/* Section 3: Game List */}
      <section>
        <h2 className="text-xl font-semibold mb-4">🎮 Selected Games</h2>
        <ul className="list-disc pl-6 space-y-1">
          {gameList
            ?.filter((g) => gameIds.includes(g.GameId))
            .map((g) => <li key={g.GameId}>{g.DisplayName}</li>) || (
            <li className="text-gray-500">No games selected</li>
          )}
        </ul>
      </section>

      {/* Section 4: Target Members */}
      <section>
        <h2 className="text-xl font-semibold mb-4">👥 Target Members</h2>
        <p>{allPlayers ? "All Players" : "Players from File"}</p>
        {!allPlayers && (
          <div className="mt-2">
            <p className="font-medium">
              Uploaded File: {uploadedFile?.name || "(none)"}
            </p>
            <ul className="list-decimal pl-6 mt-1 text-sm text-gray-700 max-h-48 overflow-auto border p-2 rounded-md">
              {offeredPlayerIds?.map((id, idx) => (
                <li key={id + idx}>{id}</li>
              )) || <li>No players listed</li>}
            </ul>
          </div>
        )}
      </section>

      {/* Section 5: Bet Settings */}
      <section>
        <h2 className="text-xl font-semibold mb-4">🎰 Bet Settings</h2>
        <table className="w-full border text-sm">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="border px-4 py-2">Currency Group</th>
              <th className="border px-4 py-2">Bet Level</th>
            </tr>
          </thead>
          <tbody>
            {betLevels?.map((row, idx) => (
              <tr key={idx}>
                <td className="border px-4 py-2">{row.currencyGroup}</td>
                <td className="border px-4 py-2">{row.betLevel}</td>
              </tr>
            )) || (
              <tr>
                <td colSpan={2} className="text-center py-4 text-gray-500">
                  No bet settings configured.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <Label className="block mb-1 text-sm font-medium text-gray-700">
        {label}
      </Label>
      <p className="border rounded-md px-3 py-2 bg-gray-50 text-gray-800 text-sm">
        {value}
      </p>
    </div>
  );
}
