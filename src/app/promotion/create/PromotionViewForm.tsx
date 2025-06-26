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
    allPlayers,
    isGiftCode,
    minTurnoverMultiplier,
    expireClaimableDate,
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
          <InfoRow label="Game Type" value={gameConfigType === GAME_TYPES.CLASSIC ? "Classic Slot" : "Cascading Slot"} />
          <InfoRow label="No. of Free Spins" value={String(bonusItemCount)} />
          <InfoRow label="Operator" value={<span className="font-semibold">{operatorName || operatorId}</span>} />
          <InfoRow label="Start Date" value={<><span className="font-semibold">{toGMTString(startDate.toISOString(), 0)} (UTC)</span></>} />
          <InfoRow label="End Date" value={<><span className="font-semibold">{toGMTString(endDate.toISOString(), 0)} (UTC)</span></>} />
          <InfoRow label="Expire Claimable Date" value={<><span className="font-semibold">{toGMTString(expireClaimableDate.toISOString(), 0)} (UTC)</span></>} />
        </div>
      </section>

      {/* Configuration & Game Specifics */}
      <section className="bg-white rounded-xl shadow p-6 mb-2">
        <div className="flex items-center gap-2 mb-4 font-semibold text-gray-800 text-base">
          <Settings className="w-5 h-5 text-gray-500" /> Configuration & Game Specifics
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
          <InfoRow label="Site Offering" value={offeredSiteNames?.join('; ') || 'All Sites'} />
          <InfoRow label="Target Game" value={gameList?.filter((g) => gameIds.includes(g.GameId)).map((g) => g.DisplayName).join(', ') || '-'} />
          <InfoRow label="Announcement" value={<LinkedBadge title={announcementTitle} />} />
        </div>
      </section>

      {/* Bonus Redemption Details */}
      <section className="bg-white rounded-xl shadow p-6 mb-2">
        <div className="flex items-center gap-2 mb-4 font-semibold text-gray-800 text-base">
          <Gift className="w-5 h-5 text-gray-500" /> Bonus Redemption Details
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
          <InfoRow label="Minimum Turnover Requirement" value={minTurnoverMultiplier ? `${minTurnoverMultiplier}x` : '-'} />
        </div>
        <div className="mt-4">
          <div className="text-xs text-gray-500 font-normal">
            Turnover for this promotion is calculated only on real money wagers made in the selected game.
          </div>
        </div>
      </section>

      {/* Targeting Information */}
      <section className="bg-white rounded-xl shadow p-6 mb-2">
        <div className="flex items-center gap-2 mb-4 font-semibold text-gray-800 text-base">
          <Users className="w-5 h-5 text-gray-500" /> Targeting Information
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
          <InfoRow label="Target Members" value={
            allPlayers ? (
              <span className="font-semibold">All Players</span>
            ) : isGiftCode ? (
              <span className="font-semibold">Players have Gift Code</span>
            ) : (
              <span className="font-semibold">Players from File</span>
            )
          } />
        </div>
        <div className="text-xs text-gray-400 mt-2">
          {allPlayers && 'FSB will be given to everybody who opens the promoted game during the promo period.'}
          {isGiftCode && 'Only players with a valid code can redeem the PSB.'}
          {!allPlayers && !isGiftCode && 'Only those players from the upload file will receive FSB during promo campaign.'}
        </div>
        {readonly && !isGiftCode && (
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
        <span title={title} className="inline-block bg-green-100 text-green-700 rounded px-2 py-0.5 text-xs font-medium flex items-center gap-1">
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
