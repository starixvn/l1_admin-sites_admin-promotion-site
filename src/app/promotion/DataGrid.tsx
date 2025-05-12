"use client";

import { GAME_TYPES } from "@/constants/gameTypes";
import { Game } from "@/types/game";
import { useEffect, useRef, useState } from "react";
import BetSettingsDialog from "./create/BetSettingsDialog";
import { useUpdatePromotion } from "@/hooks/useUpdatePromotion";
import PromotionEditDialog from "./edit/PromotionEditDialog";
import { Promotion } from "@/types/promotion";
import { toast } from "react-toastify";
import { getStatus } from "@/constants/promotionStatusMap";
import { format, differenceInDays } from "date-fns";
import { Pencil, Trash2 } from "lucide-react";

interface DataGridProps {
  promotions: Promotion[];
  loading: boolean;
  error: string | null;
  games: Game[];
  onDelete: (id: string, code: string) => Promise<void>;
  onRefresh: () => void;
}

function toGMTString(dateStr: string, gmtOffset: number): string {
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
  const [showDialog, setShowDialog] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(
    null
  );
  const [openGameListId, setOpenGameListId] = useState<string | null>(null);
  const gameListRef = useRef<HTMLDivElement | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const sortedPromotions = [...promotions].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const totalPages = Math.ceil(promotions.length / rowsPerPage);
  const paginatedPromotions = sortedPromotions.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const toggleGameList = (id: string) => {
    setOpenGameListId((prev) => (prev === id ? null : id));
  };

  const getCountdown = (endDate: Date) => {
    const daysLeft = differenceInDays(endDate, new Date());
    const colorClass = daysLeft > 0 ? "text-green-500" : "text-red-500";
    const text = daysLeft > 0 ? `${daysLeft} days left` : "Expired";
    return <div className={`text-xs font-medium ${colorClass}`}>{text}</div>;
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "running":
        return "bg-green-100 text-green-800";
      case "upcoming":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-gray-100 text-gray-600";
      default:
        return "bg-gray-100 text-gray-500";
    }
  };

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
      toast.error("No promotion selected");
      return;
    }
    const payload = {
      ...selectedPromotion,
      currencyGroups: data.currencyGroups,
      betLevels: data.betLevels,
    };
    updatePromotionMutation.mutate(
      { id: selectedPromotion._id, data: payload },
      {
        onSuccess: () => setShowDialog(false),
        onError: () => alert("Failed to update promotion"),
      }
    );
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        gameListRef.current &&
        !gameListRef.current.contains(event.target as Node)
      ) {
        setOpenGameListId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getGameNames = (gameIds: number[]) => {
    return gameIds
      .map((id) => games.find((g) => g.GameId === id)?.DisplayName || id)
      .join(", ");
  };

  const handleDelete = async (id: string, code: string) => {
    try {
      await onDelete(id, code);
    } catch (error) {
      console.error("Failed to delete promotion:", error);
    }
  };

  const handleEdit = (promotion: Promotion) => setEditPromotion(promotion);

  const handleSaveEdit = async (updatedPromotion: Promotion) => {
    try {
      const { _id, ...payload } = updatedPromotion;
      await fetch(`/api/promotions/${_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      toast.success("Promotion updated successfully");
      setEditPromotion(null);
      onRefresh();
    } catch (error) {
      console.error("Failed to update promotion:", error);
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading...</div>;
  }
  if (error) {
    return <div className="text-red-500 text-center py-4">{error}</div>;
  }
  if (promotions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">No promotions found</div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
          <tr>
            <th className="px-4 py-3 text-left">Status</th>
            <th className="px-4 py-3 text-left">Promotion</th>
            <th className="px-4 py-3 text-left">Operator</th>
            <th className="px-4 py-3 text-left">Game List</th>
            <th className="px-4 py-3 text-left">Details</th>
            <th className="px-4 py-3 text-left">Start Date</th>
            <th className="px-4 py-3 text-left">End Date</th>
            <th className="px-4 py-3 text-left">Bet Settings</th>
            <th className="px-4 py-3 text-left">Created At</th>
            <th className="px-4 py-3 text-left">Notice</th>
            <th className="px-4 py-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {paginatedPromotions.map((p) => {
            const status = getStatus(p);
            return (
              <tr key={p._id} className="hover:bg-green-50">
                <td className="px-4 py-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusStyle(
                      status
                    )}`}
                  >
                    {status}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <div className="font-semibold text-gray-800">{p.name}</div>
                  <div className="text-sm text-gray-500 font-mono">
                    {p.code}
                  </div>
                </td>
                <td className="px-4 py-4">{p.operatorId}</td>
                <td className="px-4 py-4 relative">
                  <div>{getGameTypeName(p.gameConfigType)}</div>
                  <div className="text-xs text-gray-500">
                    {p.gameIds.length} games
                  </div>
                  <button
                    onClick={() => toggleGameList(p._id)}
                    className="text-blue-500 text-xs hover:underline mt-1"
                  >
                    View All
                  </button>
                  {openGameListId === p._id && (
                    <div
                      ref={gameListRef}
                      className="absolute z-50 mt-2 bg-white border border-gray-300 shadow-md rounded p-2 text-xs text-gray-800 whitespace-pre-wrap w-64"
                    >
                      {getGameNames(p.gameIds)}
                    </div>
                  )}
                </td>
                <td className="px-4 py-4">
                  <div className="text-gray-500">
                    Free Spins: {p.bonusItemCount}
                  </div>
                </td>
                <td className="px-4 py-4">{toGMTString(p.startDate, 7)}</td>
                <td className="px-4 py-4">
                  <div>{toGMTString(p.endDate, 7)}</div>

                  {getCountdown(new Date(p.endDate))}
                </td>
                <td className="px-4 py-4">
                  <button
                    onClick={() => handleShowBetSettings(p)}
                    className="text-blue-600 hover:text-blue-800 cursor-pointer"
                  >
                    Details
                  </button>
                </td>
                <td className="px-4 py-4">
                  {p.createdAt
                    ? format(new Date(p.createdAt), "dd/MM/yyyy HH:mm")
                    : ""}
                </td>
                <td className="px-4 py-4 text-green-500">Linked</td>
                <td className="px-4 py-4">
                  <div className="flex justify-center gap-3">
                    {status !== "completed" && (
                      <button onClick={() => handleEdit(p)}>
                        <Pencil className="w-4 h-4 text-blue-600" />
                      </button>
                    )}
                    {status !== "completed" && status !== "running" && (
                      <button aria-label="delete-promotion" onClick={() => handleDelete(p._id, p.code)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Pagination UI */}
      <div className="flex items-center justify-between px-4 py-3 text-sm text-gray-500">
        <div>
          Showing {(currentPage - 1) * rowsPerPage + 1} to{" "}
          {Math.min(currentPage * rowsPerPage, promotions.length)} of{" "}
          {promotions.length} results
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            &lt;
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-1 border rounded ${
                page === currentPage ? "bg-blue-500 text-white" : ""
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            &gt;
          </button>
        </div>
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
