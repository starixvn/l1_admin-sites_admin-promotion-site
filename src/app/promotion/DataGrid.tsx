"use client";

import { GAME_TYPES } from "@/constants/gameTypes";
import { Game } from "@/types/game";
import { useState } from "react";
import BetSettingsDialog from "./create/BetSettingsDialog";
import { useUpdatePromotion } from "@/hooks/useUpdatePromotion";
import PromotionEditDialog from "./edit/PromotionEditDialog";
import { Promotion } from "@/types/promotion";
import { toast } from "react-toastify";
import { getStatus } from "@/constants/promotionStatusMap";
import { format } from "date-fns";

interface DataGridProps {
  promotions: Promotion[];
  loading: boolean;
  error: string | null;
  games: Game[];
  onDelete: (id: string) => Promise<void>;
  onRefresh: () => void;
}

function toGMTString(dateStr: string, gmtOffset: number) {
  if (!dateStr) {
    return "";
  }
  const date = new Date(dateStr);
  const gmtDate = new Date(date.getTime() + gmtOffset * 60 * 60 * 1000);
  return gmtDate
    .toLocaleString("en-GB", {
      hour12: false,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
    .replace(",", "");
}

const getGameTypeName = (gameConfigType: number) => {
  switch (gameConfigType) {
    case GAME_TYPES.CLASSIC:
      return "Classic Slots";
    case GAME_TYPES.CASCADING:
      return "Cascading Slots";
    default:
      return "";
  }
};

export default function DataGrid({
  promotions,
  loading,
  error,
  games,
  onDelete,
  onRefresh,
}: DataGridProps) {
  const [editPromotion, setEditPromotion] = useState<Promotion | null>(null);

  function getStatusColorByDate(promotion: Promotion) {
    const status = getStatus(promotion);
    switch (status) {
      case "upcoming":
        return "text-green-400";
      case "running":
        return "text-blue-500";
      case "completed":
        return "text-red-400";
      default:
        return "text-gray-500";
    }
  }

  const [showDialog, setShowDialog] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(
    null
  );

  const handleShowBetSettings = (promotion: Promotion) => {
    setSelectedPromotion(promotion);
    setShowDialog(true);
  };
  const updatePromotionMutation = useUpdatePromotion();
  const handleSaveBetSettings = (data: {
    currencyGroups: string[];
    betLevels: { currencyGroup: string; betLevel: number }[];
  }) => {
    if (!selectedPromotion) {
      return;
    }

    const payload = {
      name: selectedPromotion.name,
      code: selectedPromotion.code,
      offeredSiteNames: selectedPromotion.offeredSiteNames,
      operatorId: selectedPromotion.operatorId,
      bonusItemCount: selectedPromotion.bonusItemCount,
      gameConfigType: selectedPromotion.gameConfigType,
      gameIds: selectedPromotion.gameIds,
      startDate: selectedPromotion.startDate,
      endDate: selectedPromotion.endDate,
      offeredPlayerIds: selectedPromotion.offeredPlayerIds,
      currencyGroups: data.currencyGroups,
      betLevels: data.betLevels,
    };

    updatePromotionMutation.mutate(
      { id: selectedPromotion._id, data: payload },
      {
        onSuccess: () => {
          setShowDialog(false);
        },
        onError: () => {
          alert("Failed to update promotion");
        },
      }
    );
  };

  const getGameNames = (gameIds: number[]) => {
    if (!gameIds || !games.length) {
      return "";
    }

    return gameIds
      .map((id) => {
        const game = games.find((g) => g.GameId === id);
        return game ? game.DisplayName : id;
      })
      .join(", ");
  };

  const handleDelete = async (id: string) => {
    try {
      await onDelete(id);
    } catch (error) {
      console.error("Failed to delete promotion:", error);
    }
  };

  const handleEdit = (promotion: Promotion) => {
    setEditPromotion(promotion);
  };

  const handleSaveEdit = async (updatedPromotion: Promotion) => {
    try {
      const { _id, ...payload } = updatedPromotion;
      await fetch(`/api/promotions/${_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      toast.success("Promotion updated successfully", {
        position: "top-right",
        autoClose: 3000,
      });
      setEditPromotion(null);
      onRefresh();
    } catch (error) {
      console.error("Failed to update promotion:", error);
    }
  };

  // Sort promotions by createdAt descending
  const sortedPromotions = [...promotions].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (loading) {
    return <div className="text-center py-4">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center py-4">{error}</div>;
  }

  if (promotions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400 text-lg">
        No promotions found
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="overflow-x-auto max-h-[70vh] overflow-y-auto">
        <table className="w-full border-collapse min-w-[1200px]">
          <thead className="sticky top-0 z-10 bg-gray-50">
            <tr>
              <th className="w-[14%] px-3 py-4 bg-gray-50 text-center text-sm font-semibold text-gray-700 border-b border-r border-gray-200 whitespace-nowrap">
                <div className="flex items-center justify-center">
                  <span>Promotion Name</span>
                </div>
              </th>
              <th className="w-[14%] px-3 py-4 bg-gray-50 text-center text-sm font-semibold text-gray-700 border-b border-r border-gray-200 whitespace-nowrap">
                <div className="flex items-center justify-center">
                  <span>Promotion Code</span>
                </div>
              </th>
              <th className="w-[11%] px-3 py-4 bg-gray-50 text-center text-sm font-semibold text-gray-700 border-b border-r border-gray-200 whitespace-nowrap">
                <div className="flex items-center justify-center">
                  <span>Create Date</span>
                </div>
              </th>
              <th className="w-[12%] px-3 py-4 bg-gray-50 text-center text-sm font-semibold text-gray-700 border-b border-r border-gray-200 whitespace-nowrap">
                <div className="flex items-center justify-center">
                  <span>Details</span>
                </div>
              </th>
              <th className="w-[13%] px-3 py-4 bg-gray-50 text-center text-sm font-semibold text-gray-700 border-b border-r border-gray-200 whitespace-nowrap">
                <div className="flex items-center justify-center">
                  <span>Games</span>
                </div>
              </th>
              <th className="w-[8%] px-3 py-4 bg-gray-50 text-center text-sm font-semibold text-gray-700 border-b border-r border-gray-200 whitespace-nowrap">
                <div className="flex items-center justify-center">
                  <span>Operators</span>
                </div>
              </th>
              <th className="w-[8%] px-3 py-4 bg-gray-50 text-center text-sm font-semibold text-gray-700 border-b border-r border-gray-200 whitespace-nowrap">
                <div className="flex items-center justify-center">
                  <span>Bet Settings</span>
                </div>
              </th>
              <th className="w-[9%] px-3 py-4 bg-gray-50 text-center text-sm font-semibold text-gray-700 border-b border-r border-gray-200 whitespace-nowrap">
                <div className="flex items-center justify-center">
                  <span>Start Date (GMT +7)</span>
                </div>
              </th>
              <th className="w-[11%] px-3 py-4 bg-gray-50 text-center text-sm font-semibold text-gray-700 border-b border-r border-gray-200 whitespace-nowrap">
                <div className="flex items-center justify-center">
                  <span>End Date (GMT +7)</span>
                </div>
              </th>
              <th className="w-[5%] px-3 py-4 bg-gray-50 text-center text-sm font-semibold text-gray-700 border-b border-r border-gray-200">
                <div className="flex items-center justify-center">
                  <span>Status</span>
                </div>
              </th>
              <th className="w-[5%] px-3 py-4 bg-gray-50 text-center text-sm font-semibold text-gray-700 border-b border-r border-gray-200">
                <div className="flex items-center justify-center">
                  <span>Notice</span>
                </div>
              </th>
              <th className="w-[4%] px-3 py-4 bg-gray-50 text-center text-sm font-semibold text-gray-700 border-b border-gray-200">
                <div className="flex items-center justify-center">
                  <span>Action</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedPromotions.map((promotion) => {
              const status = getStatus(promotion);
              return (
                <tr key={promotion._id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 text-sm border-b border-r border-gray-200">
                    {promotion.name}
                  </td>
                  <td className="px-3 py-2 text-sm border-b border-r border-gray-200 text-gray-600 break-all">
                    {promotion.code}
                  </td>
                  <td className="px-3 py-2 text-sm border-b border-r border-gray-200 text-gray-600">
                    {promotion.createdAt ? format(new Date(promotion.createdAt), "dd/MM/yyyy HH:mm") : ""}
                  </td>
                  <td className="px-3 py-2 text-sm border-b border-r border-gray-200">
                    <div>{getGameTypeName(promotion.gameConfigType)}</div>
                    <div className="text-gray-500">
                      Free Spins: {promotion.bonusItemCount}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-sm border-b border-r border-gray-200">
                    {promotion.gameIds && promotion.gameIds.length > 0
                      ? getGameNames(promotion.gameIds)
                      : ""}
                  </td>
                  <td className="px-3 py-2 text-sm border-b border-r border-gray-200 text-center">
                    {promotion.operatorId}
                  </td>
                  <td className="px-3 py-2 text-sm border-b border-r border-gray-200 text-center">
                    <button
                      onClick={() => handleShowBetSettings(promotion)}
                      className="text-blue-600 hover:text-blue-800 cursor-pointer"
                    >
                      Details
                    </button>
                  </td>
                  <td className="px-3 py-2 text-sm border-b border-r border-gray-200 text-center whitespace-nowrap">
                    {toGMTString(promotion.startDate, 7)}
                  </td>
                  <td className="px-3 py-2 text-sm border-b border-r border-gray-200 text-center whitespace-nowrap">
                    {toGMTString(promotion.endDate, 7)}
                  </td>
                  <td className="px-3 py-2 text-sm border-b border-r border-gray-200 text-center">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
                      ${getStatusColorByDate(promotion)}`}
                    >
                      {status === "upcoming"
                        ? "Up Coming"
                        : status.charAt(0).toUpperCase() + status.slice(1)}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-sm border-b border-r border-gray-200 text-center">
                    <span className="text-green-400">Linked</span>
                  </td>
                  <td className="px-3 py-2 border-b border-gray-200">
                    <div className="flex flex-col gap-1 items-center">
                      <button
                        onClick={() => handleEdit(promotion)}
                        className={`min-w-[60px] px-3 py-1 rounded text-xs font-medium ${
                          status === "completed"
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-emerald-500 text-white hover:bg-emerald-600 cursor-pointer"
                        }`}
                        disabled={status === "completed"}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(promotion._id)}
                        className={`min-w-[60px] px-3 py-1 rounded text-xs font-medium ${
                          status === "completed" || status === "running"
                            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                            : "bg-red-500 text-white hover:bg-red-600 cursor-pointer"
                        }`}
                        disabled={status === "completed" || status === "running"}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <PromotionEditDialog
        open={!!editPromotion}
        promotion={editPromotion}
        onClose={() => setEditPromotion(null)}
        onSave={handleSaveEdit}
      />
      {selectedPromotion && (
        <BetSettingsDialog
          open={showDialog}
          onClose={() => setShowDialog(false)}
          partnerId={selectedPromotion.operatorId}
          gameType={selectedPromotion.gameConfigType}
          onSave={handleSaveBetSettings}
          games={games}
          readonly={true}
          initialValues={selectedPromotion.betLevels}
        />
      )}
    </div>
  );
}
