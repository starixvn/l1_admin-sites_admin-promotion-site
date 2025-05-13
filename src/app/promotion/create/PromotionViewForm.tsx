import { GAME_TYPES } from "@/constants/gameTypes";
import type { PromotionFormValues } from "./PromotionForm";
import type { Game } from "@/types/game";
import type { CurrencyGroup } from "@/types/currency-group";
import { getTotalBet } from "@/lib/promotion/bet-settings.utils";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlayerListModal } from "./PlayerListModal";
interface PromotionViewFormProps {
  data: PromotionFormValues;
  operatorName?: string;
  gameList?: Game[];
  currencyGroupsInfo?: CurrencyGroup[];
  readonly?: boolean;
}

export default function PromotionViewForm({
  data,
  operatorName,
  gameList,
  currencyGroupsInfo,
  readonly,
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
    betLevels,
  } = data;
  const [showPlayerList, setShowPlayerList] = useState(false);
  return (
    <div className="space-y-4 p-0 text-sm text-gray-800">
      {/* Section 1: General Info */}
      <section>
        <h2 className="text-md font-semibold mb-4">📋 General Information</h2>
        <div className="space-y-2 text-sm text-gray-800">
          <ReadOnlyField label="Promotion Name" value={name} />
          <ReadOnlyField label="Promotion Code" value={code} />
          <ReadOnlyField
            label="Game Type"
            value={
              gameConfigType === GAME_TYPES.CLASSIC
                ? "Classic Slot"
                : "Cascading Slot"
            }
            require={false}
          />
          <ReadOnlyField
            label="No. of Free Spins"
            value={String(bonusItemCount)}
          />
          <ReadOnlyField
            label="Start Date (GMT+7)"
            value={new Date(startDate).toLocaleString()}
          />
          <ReadOnlyField
            label="End Date (GMT+7)"
            value={new Date(endDate).toLocaleString()}
          />
          <ReadOnlyField
            label="Operator Name"
            value={operatorName || operatorId}
          />
        </div>
      </section>
      {/* Section 2: Bet Settings */}
      <section>
        <h2 className="text-md font-semibold mb-4">
          🎰 Currency Group Settings <span className="text-red-500">*</span>
        </h2>
        <table className="w-full border text-sm">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className=" text-center border px-4 py-2">Currency Group</th>
              <th className=" text-center border px-4 py-2">
                {gameConfigType === GAME_TYPES.CLASSIC
                  ? "Bet Level"
                  : "Coin Value"}
              </th>
              <th className=" text-center border px-4 py-2">Total Bet</th>
            </tr>
          </thead>
          <tbody>
            {betLevels?.map((row, idx) => {
              const groupName =
                currencyGroupsInfo?.find((cg) => cg.Id === row.currencyGroup)
                  ?.Name ?? row.currencyGroup;

              return (
                <tr key={idx}>
                  <td className=" text-center border px-4 py-2">{groupName}</td>
                  <td className=" text-center border px-4 py-2">
                    {row.betLevel}
                  </td>
                  <td className=" text-center border px-4 py-2">
                    {getTotalBet(row.betLevel, gameConfigType)}
                  </td>
                </tr>
              );
            }) || (
              <tr>
                <td colSpan={2} className="text-center py-4 text-gray-500">
                  No bet settings configured.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
      <ReadOnlyField
        label="Site Offering:"
        value={offeredSiteNames?.join("; ") || ""}
        require={false}
      />

      {/* Section 4: Game List */}
      <section>
        <h2 className="text-md font-semibold mb-4">
          🎮 Selected Games <span className="text-red-500">*</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-1 pl-2">
          {gameList
            ?.filter((g) => gameIds.includes(g.GameId))
            .map((g) => (
              <div key={g.GameId} className="before:content-['•_'] before:mr-1">
                {g.DisplayName}
              </div>
            )) || <div className="text-gray-500">No games selected</div>}
        </div>
      </section>

      {/* Section 5: Target Members */}
      <section>
        <h2 className="text-md font-semibold mb-4">👥 Members</h2>
        <p className="text-sm before:content-['•_'] before:mr-1">
          {allPlayers ? (
            "All Players"
          ) : (
            <>
              Players from File
              {readonly && (
                <button
                  className="btn-player-list ml-3"
                  onClick={() => setShowPlayerList(true)}
                >
                  Player List
                </button>
              )}
            </>
          )}
        </p>
      </section>
      {readonly && (
        <PlayerListModal
          showPlayerList={showPlayerList}
          setShowPlayerList={setShowPlayerList}
          offeredPlayerIds={data.offeredPlayerIds}
        />
      )}
    </div>
  );
}
function ReadOnlyField({
  label,
  value,
  require = true,
  alignRight = false,
}: {
  label: string;
  value: string;
  require?: boolean;
  alignRight?: boolean;
}) {
  return (
    <div className="grid grid-cols-[160px_1fr] gap-2 text-sm">
      <div className="flex items-center gap-1 ml-2">
        <span className="font-semibold">{label}</span>
        {require && <span className="text-red-500">*</span>}
      </div>
      <span className={`text-gray-900 ${alignRight ? "text-right" : ""}`}>
        {value}
      </span>
    </div>
  );
}
