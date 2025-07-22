import { GAME_TYPES } from "@/constants/gameTypes";
import type { PromotionFormValues } from "./PromotionForm";
import type { Game } from "@/types/game";
import type { CurrencyGroup } from "@/types/currency-group";
import { useState } from "react";
import { PlayerListModal } from "./PlayerListModal";
import { toGMTString } from "@/lib/date-time.utils";
import { Info, Settings, Gift, Users, Link2 } from "lucide-react";

interface PromotionViewFormProps {
  data: PromotionFormValues;
  operatorName?: string;
  gameList?: Game[];
  currencyGroupsInfo?: CurrencyGroup[];
  readonly?: boolean;
  announcementTitle?: string;
}

export default function PromotionViewForm({
  data,
  operatorName,
  gameList,
  currencyGroupsInfo,
  readonly,
  announcementTitle,
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
    currencyGroups,
    allPlayers,
    isGiftCode,
    minTurnoverMultiplier,
    claimExpirationDate,
  } = data;
  const [showPlayerList, setShowPlayerList] = useState(false);
  return (
    <div className="space-y-6 p-0 md:p-2">
      {/* Basic Information */}
      <section className="bg-white rounded-xl shadow p-6 mb-2">
        <div className="flex items-center gap-2 mb-4 font-semibold text-gray-800 text-base">
          <Info className="w-5 h-5 text-gray-500" /> Basic Information
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
          <InfoRow label="Promotion Name" value={name} />
          <InfoRow label="Promotion Code" value={code} />
          <InfoRow
            label="Game Type"
            value={
              gameConfigType === GAME_TYPES.CLASSIC
                ? "Classic Slot"
                : "Cascading Slot"
            }
          />
          <InfoRow label="No. of Free Spins" value={String(bonusItemCount)} />
          <InfoRow
            label="Start Date"
            value={
              <>
                <span className="font-semibold">
                  {toGMTString(startDate.toISOString(), 7)} (GMT+7)
                </span>
              </>
            }
          />
          <InfoRow
            label="End Date"
            value={
              <>
                <span className="font-semibold">
                  {toGMTString(endDate.toISOString(), 7)} (GMT+7)
                </span>
              </>
            }
          />
          <InfoRow
            label="Currency Groups"
            value={
              currencyGroups && currencyGroups.length > 0 ? (
                <div className="mt-2">
                  <table className="w-full text-sm border-collapse border border-gray-200">
                    <thead>
                      <tr className="bg-gray-50 text-gray-700 border-b">
                        <th className="px-3 py-2 text-left border-r border-gray-200">Currency Group</th>
                        <th className="px-3 py-2 text-center border-r border-gray-200">Bet Level</th>
                        <th className="px-3 py-2 text-center">Total Bet</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currencyGroups.map((currencyGroupId) => {
                        const currencyGroup = currencyGroupsInfo?.find((cg) => cg.Id === currencyGroupId);
                        const betLevel = data.betLevels?.find((bl) => bl.currencyGroup === currencyGroupId)?.betLevel || 0;
                        const totalBet = gameConfigType === GAME_TYPES.CASCADING ? 1 * betLevel * 20 : betLevel * 25;
                        
                        return (
                          <tr key={currencyGroupId} className="border-b border-gray-100">
                            <td className="px-3 py-2 border-r border-gray-200">{currencyGroup?.Name || currencyGroupId}</td>
                            <td className="px-3 py-2 text-center border-r border-gray-200">{betLevel}</td>
                            <td className="px-3 py-2 text-center">{totalBet.toFixed(2)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                "-"
              )
            }
          />
          <InfoRow
            label="Operator"
            value={
              <span className="font-semibold">
                {operatorName || operatorId}
              </span>
            }
          />
        </div>
      </section>

      {/* Configuration & Game Specifics */}
      <section className="bg-white rounded-xl shadow p-6 mb-2">
        <div className="flex items-center gap-2 mb-4 font-semibold text-gray-800 text-base">
          <Settings className="w-5 h-5 text-gray-500" /> Configuration & Game
          Specifics
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
          <InfoRow
            label="Site Offering"
            value={offeredSiteNames?.join("; ") || "All Sites"}
          />
          <InfoRow
            label="Target Game"
            value={
              gameList
                ?.filter((g) => gameIds.includes(g.GameId))
                .map((g) => g.DisplayName)
                .join(", ") || "-"
            }
          />
          <InfoRow
            label="Announcement"
            value={<LinkedBadge title={announcementTitle} />}
          />
        </div>
      </section>

      {/* Bonus Redemption Details */}
      <section className="bg-white rounded-xl shadow p-6 mb-2">
        <div className="flex items-center gap-2 mb-4 font-semibold text-gray-800 text-base">
          <Gift className="w-5 h-5 text-gray-500" /> Bonus Redemption Details
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
          <InfoRow
            label="Minimum Turnover Requirement"
            value={minTurnoverMultiplier ? `${minTurnoverMultiplier}x` : "-"}
          />
          <InfoRow
            label="Claim Expiration Date"
            value={
              claimExpirationDate
                ? (() => {
                    const dateObj =
                      typeof claimExpirationDate === "string"
                        ? new Date(claimExpirationDate)
                        : claimExpirationDate;
                    return isNaN(dateObj.getTime()) ? (
                      <span className="text-gray-400">-</span>
                    ) : (
                      <span className="font-semibold">
                        {toGMTString(dateObj.toISOString(), 7)} (GMT+7)
                      </span>
                    );
                  })()
                : <span className="text-gray-400">-</span>
            }
          />
        </div>

        <div className="mt-4">
          <div className="text-xs text-gray-500 font-normal">
            Turnover for this promotion is calculated only on real money wagers
            made in the selected game.
          </div>
        </div>
      </section>

      {/* Targeting Information */}
      <section className="bg-white rounded-xl shadow p-6 mb-2">
        <div className="flex items-center gap-2 mb-4 font-semibold text-gray-800 text-base">
          <Users className="w-5 h-5 text-gray-500" /> Targeting Information
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
          <InfoRow
            label="Target Members"
            value={
              allPlayers ? (
                <span className="font-semibold">All Players</span>
              ) : isGiftCode ? (
                <span className="font-semibold">Players have Gift Code</span>
              ) : (
                <span className="font-semibold">Players from File</span>
              )
            }
          />
        </div>
        <div className="text-xs text-gray-400 mt-2">
          {allPlayers &&
            "FSB will be given to everybody who opens the promoted game during the promo period."}
          {isGiftCode && "Only players with a valid code can redeem the FSB."}
          {!allPlayers &&
            !isGiftCode &&
            "Only those players from the upload file will receive FSB during promo campaign."}
        </div>
        {!isGiftCode && !allPlayers && (
          <div className="mt-2">
            <button
              className="inline-block bg-blue-100 text-blue-700 rounded px-3 py-1 text-xs font-medium border border-blue-200 hover:bg-blue-200 transition"
              onClick={() => setShowPlayerList(true)}
            >
              Player List
            </button>
            <PlayerListModal
              showPlayerList={showPlayerList}
              setShowPlayerList={setShowPlayerList}
              offeredPlayerIds={data.offeredPlayerIds}
            />
          </div>
        )}
      </section>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col mb-2">
      <span className="text-gray-500 text-xs mb-0.5">{label}</span>
      <span className="text-gray-900 font-medium text-sm">{value}</span>
    </div>
  );
}

function LinkedBadge({ title }: { title?: string }) {
  if (title) {
    return (
      <>
        <span
          title={title}
          className="inline-block bg-green-100 text-green-700 rounded px-2 py-0.5 text-xs font-medium flex items-center gap-1"
        >
          <Link2 className="w-3 h-3" /> Linked
        </span>
      </>
    );
  }
  return (
    <span className="inline-block bg-red-100 text-red-600 rounded px-2 py-0.5 text-xs font-medium flex items-center gap-1">
      <Link2 className="w-3 h-3 line-through" /> Unlinked
    </span>
  );
}
