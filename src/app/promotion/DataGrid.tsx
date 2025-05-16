"use client";

import { GAME_TYPES, GameType } from "@/constants/gameTypes";
import { useState, useEffect, useMemo } from "react";
import PromotionEditDialog from "./edit/PromotionEditDialog";
import { Promotion } from "@/types/promotion";
import { toast } from "react-toastify";
import {
  getStatus,
  PROMOTION_STATUS_OPTIONS,
} from "@/constants/promotionStatusMap";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { PAGE_SIZE_OPTIONS } from "@/constants/constants";
import PromotionPreviewDialog from "./create/PromotionPreviewDialog";
import { useFilteredGames } from "@/hooks/useFilteredGames";
import { useCurrencyGroups } from "@/hooks/useCurrencyGroups";
import { toGMTString } from "@/lib/date-time.utils";
import { useOperators } from "@/hooks/useOperators";
import { createOperatorMap } from "@/lib/promotion/bet-settings.utils";

interface DataGridProps {
  promotions: Promotion[];
  loading: boolean;
  error: string | null;
  onDelete: (id: string, code: string) => Promise<void>;
  onRefresh: () => void;
  currentPage: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export const getGameTypeName = (gameConfigType: number) => {
  switch (gameConfigType) {
    case GAME_TYPES.CLASSIC:
      return "Classic Slots";
    case GAME_TYPES.CASCADING:
      return "Cascading Slots";
    default:
      return "";
  }
};

export function getStatusStyle(status: string) {
  switch (status) {
    case PROMOTION_STATUS_OPTIONS.Running:
      return "bg-green-100 text-green-800";
    case PROMOTION_STATUS_OPTIONS.Upcoming:
      return "bg-yellow-100 text-yellow-800";
    case PROMOTION_STATUS_OPTIONS.Completed:
      return "bg-gray-100 text-gray-600";
    default:
      return "bg-gray-100 text-gray-500";
  }
}

const Countdown = ({ endDate }: { endDate: Date }) => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const diff = endDate.getTime() - now.getTime();

  let text = "Expired";
  let colorClass = "text-red-500";

  if (diff > 0) {
    const daysLeft = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (daysLeft > 0) {
      text = `${daysLeft} days left`;
      colorClass = "text-green-500";
    } else {
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      text = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
        2,
        "0"
      )}:${String(seconds).padStart(2, "0")} left`;
      colorClass = "text-yellow-500";
    }
  }

  return <div className={`text-xs font-medium ${colorClass}`}>{text}</div>;
};

export default function DataGrid({
  promotions = [],
  loading,
  error,
  onDelete,
  onRefresh,
  currentPage,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
}: DataGridProps) {
  const [editPromotion, setEditPromotion] = useState<Promotion | null>(null);
  const [viewPromotion, setViewPromotion] = useState<Promotion | null>(null);
  const totalPages = Math.ceil(totalItems / pageSize);
  const { data: currencyGroupsInfo = [] } = useCurrencyGroups(
    viewPromotion?.operatorId,
    {
      enabled: !!viewPromotion?.operatorId,
    }
  );

  const { data: gameList = [] } = useFilteredGames(
    viewPromotion?.currencyGroups || [],
    viewPromotion?.gameConfigType as GameType,
    {
      enabled:
        !!viewPromotion?.currencyGroups?.length &&
        !!viewPromotion?.gameConfigType,
    }
  );
  const { data: operators = [] } = useOperators();
  const operatorMap = useMemo(() => createOperatorMap(operators), [operators]);
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
  if (!Array.isArray(promotions) || promotions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">No results found</div>
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
            <th className="px-4 py-3 text-center">No. of Free Spins</th>
            <th className="px-4 py-3 text-left">Start Date</th>
            <th className="px-4 py-3 text-left">End Date</th>
            {/* <th className="px-4 py-3 text-left">Notice</th> */}
            <th className="px-4 py-3 text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {promotions.map((p) => {
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
                <td className="px-4 py-4">
                  {operatorMap.get(p.operatorId) || p.operatorId}
                </td>
                <td className="px-4 py-4">
                  <div className="text-gray-500 text-center">
                    {p.bonusItemCount}
                  </div>
                </td>
                <td className="px-4 py-4">{toGMTString(p.startDate, 7)}</td>
                <td className="px-4 py-4">
                  <div>{toGMTString(p.endDate, 7)}</div>

                  <Countdown endDate={new Date(p.endDate)} />
                </td>
                {/* <td className="px-4 py-4 text-green-500">Linked</td> */}
                <td className="px-4 py-4">
                  <div className="flex justify-center gap-3">
                    <button
                      onClick={() => setViewPromotion(p)}
                      aria-label="view-promotion"
                      className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <Eye className="w-4 h-4 text-gray-600 hover:text-black" />
                    </button>
                    {status === PROMOTION_STATUS_OPTIONS.Upcoming && (
                      <button onClick={() => handleEdit(p)}>
                        <Pencil className="w-4 h-4 text-blue-600" />
                      </button>
                    )}
                    {status === PROMOTION_STATUS_OPTIONS.Upcoming && (
                      <button
                        aria-label="delete-promotion"
                        onClick={() => handleDelete(p._id, p.code)}
                      >
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between px-4 py-3 text-sm text-gray-500 gap-2">
        <div>
          <span>
            Showing{" "}
            <span className="font-semibold">
              {(currentPage - 1) * pageSize + 1}
            </span>{" "}
            to{" "}
            <span className="font-semibold">
              {Math.min(currentPage * pageSize, totalItems)}
            </span>{" "}
            of <span className="font-semibold">{totalItems}</span> results
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-300 bg-white hover:bg-gray-100 transition disabled:opacity-50"
              aria-label="Previous page"
            >
              <span className="sr-only">Previous</span>
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                <path
                  d="M15 19l-7-7 7-7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(
                (page) =>
                  page === 1 ||
                  page === totalPages ||
                  Math.abs(page - currentPage) <= 1
              )
              .map((page, idx, arr) => {
                // Add dots if needed
                if (idx > 0 && page - arr[idx - 1] > 1) {
                  return (
                    <span
                      key={`dots-${page}`}
                      className="px-2 text-gray-400 select-none"
                    >
                      ...
                    </span>
                  );
                }
                return (
                  <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={`w-9 h-9 flex items-center justify-center rounded-full border transition
                      ${
                        page === currentPage
                          ? "bg-blue-600 text-white border-blue-600 font-bold shadow"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-blue-50"
                      }
                    `}
                    aria-current={page === currentPage ? "page" : undefined}
                  >
                    {page}
                  </button>
                );
              })}
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-300 bg-white hover:bg-gray-100 transition disabled:opacity-50"
              aria-label="Next page"
            >
              <span className="sr-only">Next</span>
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                <path
                  d="M9 5l7 7-7 7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
          <label className="flex items-center gap-1 ml-4">
            <span>Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="border rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500"
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <PromotionEditDialog
        open={!!editPromotion}
        promotion={editPromotion}
        onClose={() => setEditPromotion(null)}
        onSave={handleSaveEdit}
      />
      {viewPromotion && (
        <PromotionPreviewDialog
          open={!!viewPromotion}
          onClose={() => setViewPromotion(null)}
          data={{
            ...viewPromotion,
            gameConfigType: viewPromotion.gameConfigType as GameType,
            bonusItemCount: viewPromotion.bonusItemCount,
            code: viewPromotion.code,
            currencyGroups: viewPromotion.currencyGroups,
            endDate: new Date(viewPromotion.endDate),
            gameIds: viewPromotion.gameIds,
            name: viewPromotion.name,
            offeredPlayerIds: viewPromotion.offeredPlayerIds,
            offeredSiteNames: viewPromotion.offeredSiteNames,
            operatorId: viewPromotion.operatorId,
            startDate: new Date(viewPromotion.startDate),
            allPlayers:
              !viewPromotion.offeredPlayerIds ||
              viewPromotion.offeredPlayerIds.length === 0,
            uploadedFile: undefined,
            betLevels: viewPromotion.betLevels,
          }}
          operatorName={
            operatorMap.get(viewPromotion.operatorId) ||
            viewPromotion.operatorId
          }
          gameList={gameList}
          currencyGroupsInfo={currencyGroupsInfo}
          isSubmitting={false}
          mode="edit"
          onConfirm={() => {}}
          readonly={true}
        />
      )}
    </div>
  );
}
