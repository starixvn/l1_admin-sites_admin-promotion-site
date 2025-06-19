import { GAME_TYPES } from "@/constants/gameTypes";
import type { PromotionFormValues } from "./PromotionForm";
import type { Game } from "@/types/game";
import type { CurrencyGroup } from "@/types/currency-group";
import { getTotalBet } from "@/lib/promotion/bet-settings.utils";
import { useState } from "react";
import { PlayerListModal } from "./PlayerListModal";
import { toGMTString } from "@/lib/date-time.utils";
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
        <h2 className="text-lg font-bold text-gray-800 mb-4 border-l-4 border-blue-500 pl-3">
          📋 General Information
        </h2>
        <div className="space-y-3 text-sm text-gray-800">
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
            value={toGMTString(startDate.toISOString(), 7)}
          />
          <ReadOnlyField
            label="End Date (GMT+7)"
            value={toGMTString(endDate.toISOString(), 7)}
          />
          <ReadOnlyField
            label="Operator Name"
            value={operatorName || operatorId}
          />
        </div>
      </section>
      {/* Section 2: Bet Settings */}
      <section>
        <h2 className="text-lg font-bold text-gray-800 mb-4 border-l-4 border-blue-500 pl-3">
          🎰 Currency Group Settings <span className="text-red-500">*</span>
        </h2>
        <table className="w-full border border-gray-300 rounded-md text-sm shadow-sm">
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
                    {getTotalBet(row.betLevel, gameConfigType).toFixed(2)}
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
        label="Site Offering"
        value={offeredSiteNames?.join("; ") || "All Sites"}
        require={false}
      />

      {/* Section 4: Game List */}
      <section>
        <h2 className="text-lg font-bold text-gray-800 mb-4 border-l-4 border-blue-500 pl-3">
          🎮 Selected Games <span className="text-red-500">*</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pl-10">
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
        <h2 className="text-lg font-bold text-gray-800 mb-4 border-l-4 border-blue-500 pl-3">
          👥 Members
        </h2>
        <p className="text-sm before:content-['•_'] before:mr-1 pl-10">
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
    <div className="grid grid-cols-[220px_1fr] gap-2 text-sm items-start pl-10">
      <label className="flex items-center font-medium text-gray-700">
        {label}
        {require && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className={`text-gray-900 ${alignRight ? "text-right" : ""}`}>
        {value}
      </div>
    </div>
  );
}
