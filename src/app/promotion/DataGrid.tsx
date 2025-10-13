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
import { Eye, Pencil, Trash2, BarChart3, X } from "lucide-react";
import { PAGE_SIZE_OPTIONS } from "@/constants/constants";
import PromotionPreviewDialog from "./create/PromotionPreviewDialog";
import { useFilteredSelectedGames } from "@/hooks/useFilteredSelectedGames";
import { useCurrencyGroups } from "@/hooks/useCurrencyGroups";
import { toGMTString } from "@/lib/date-time.utils";
import { useOperators } from "@/hooks/useOperators";
import { createOperatorMap } from "@/lib/promotion/bet-settings.utils";
import { getStatusStyle } from "@/helper/common";
import ConfirmModal from "@/components/ConfirmDialog";

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
  onPerformanceClick: (promotionId: string) => void;
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

const Countdown = ({ endDate }: { endDate: Date }) => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const diff = endDate.getTime() - now.getTime();

  let text = "";
  let colorClass = "";

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
  onPerformanceClick,
}: DataGridProps) {
  const [editPromotion, setEditPromotion] = useState<Promotion | null>(null);
  const [viewPromotion, setViewPromotion] = useState<Promotion | null>(null);
  const [cancelPromotion, setCancelPromotion] = useState<Promotion | null>(
    null
  );
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const totalPages = Math.ceil(totalItems / pageSize);
  const { data: currencyGroupsInfo = [] } = useCurrencyGroups(
    viewPromotion?.operatorId,
    {
      enabled: !!viewPromotion?.operatorId,
    }
  );

  const { data: gameList = [] } = useFilteredSelectedGames({
    currencyGroups: viewPromotion?.currencyGroups || [],
    gameType: viewPromotion?.gameConfigType as GameType,
    gameIds: viewPromotion?.gameIds || [],
  });
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

  const handleCancel = async () => {
    try {
      // TODO: Implement cancel promotion API call
      onRefresh();
    } catch (error) {
      console.error("Failed to cancel promotion:", error);
      toast.error("Failed to cancel promotion");
    }
  };

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
            <th className="px-4 py-3 text-center">Free Spins</th>
            <th className="px-4 py-3 text-left">Period</th>
            <th className="px-4 py-3 text-left">Expiration / Turnover (x)</th>
            <th className="px-4 py-3 text-left">Announcement</th>
            <th className="px-4 py-3 text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {promotions.map((p) => {
            const status = getStatus(p);
            return (
              <tr key={p._id} className="hover:bg-green-50 align-top">
                <td className="px-4 py-4">
                  <div className="flex flex-col items-start gap-1">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusStyle(
                        status
                      )}`}
                    >
                      {status}
                    </span>
                    <Countdown
                      endDate={
                        status === PROMOTION_STATUS_OPTIONS.Upcoming
                          ? new Date(p.startDate)
                          : new Date(p.endDate)
                      }
                    />
                  </div>
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
                <td className="px-4 py-4">
                  <div>
                    <div>
                      <span className="inline-block w-12">Start:</span>
                      <span>{toGMTString(p.startDate, 7)}</span>
                    </div>
                    <div>
                      <span className="inline-block w-12">End:</span>
                      <span>{toGMTString(p.endDate, 7)}</span>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex flex-col">
                    {p.claimExpirationDate && (
                      <div>{toGMTString(p.claimExpirationDate, 7)}</div>
                    )}
                    <span className="font-semibold text-black">
                      {p.minTurnoverMultiplier
                        ? `${p.minTurnoverMultiplier}x`
                        : "-"}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-4">
                  {p.announcementTitle ? (
                    <span className="text-green-500">Linked</span>
                  ) : (
                    <span className="text-red-500">Unlinked</span>
                  )}
                  {p.announcementTitle && <div>{p.announcementTitle}</div>}
                </td>
                <td className="px-4 py-4">
                  <div className="flex justify-center gap-3">
                    <button
                      onClick={() => setViewPromotion(p)}
                      aria-label="view-promotion"
                      className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                      title="View"
                    >
                      <Eye className="w-4 h-4 text-gray-600 hover:text-black" />
                    </button>
                    <button
                      onClick={() => onPerformanceClick(p._id)}
                      aria-label="performance"
                      className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                      title="Performance Details"
                    >
                      <BarChart3 className="w-4 h-4 text-purple-600 hover:text-purple-800" />
                    </button>
                    {status === PROMOTION_STATUS_OPTIONS.Upcoming && (
                      <>
                        <button onClick={() => handleEdit(p)} title="Edit">
                          <Pencil className="w-4 h-4 text-blue-600" />
                        </button>
                        <button
                          aria-label="delete-promotion"
                          onClick={() => handleDelete(p._id, p.code)}
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </>
                    )}
                    {status === PROMOTION_STATUS_OPTIONS.Running && (
                      <button
                        aria-label="cancel-promotion"
                        onClick={() => {
                          setIsCancelModalOpen(true);
                          setCancelPromotion(p);
                        }}
                        title="Cancel Promotion"
                        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <X className="w-4 h-4 text-orange-600 hover:text-orange-800" />
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

      <ConfirmModal
        open={isCancelModalOpen}
        title="Confirm Promotion Cancellation"
        message={`Are you sure you want to cancel promotion with code <strong style="color: black; font-weight: 600;">${cancelPromotion?.code}</strong>? 
        This action is permanent and cannot be undone.`}
        confirmText="Confirm"
        cancelText="Cancel"
        onCancel={() => {
          setIsCancelModalOpen(false);
        }}
        onConfirm={handleCancel}
      />

      {viewPromotion && (
        <PromotionPreviewDialog
          open={!!viewPromotion}
          onClose={() => setViewPromotion(null)}
          announcementTitle={viewPromotion.announcementTitle}
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
            allPlayers: viewPromotion.isGiftCode
              ? false
              : !viewPromotion.offeredPlayerIds ||
                viewPromotion.offeredPlayerIds.length === 0,
            uploadedFile: undefined,
            betLevels: viewPromotion.betLevels,
            claimExpirationDate: new Date(viewPromotion.claimExpirationDate),
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
