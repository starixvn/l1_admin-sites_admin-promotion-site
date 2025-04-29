"use client";

import { GAME_TYPES } from "@/constants/gameTypes";
import { Game } from "@/types/game";

interface Promotion {
  _id: string;
  name: string;
  code: string;
  operatorId: string;
  offeredSiteNames: string[];
  currencyGroups: string[];
  startDate: string;
  endDate: string;
  bonusItemCount: number;
  offeredPlayerIds: string[];
  gameConfigType: number;
  gameIds: number[];
  betLevels: {
    currencyGroup: string;
    betLevel: number;
    _id: string;
    createdAt: string;
    updatedAt: string;
  }[];
  createdAt: string;
  updatedAt: string;
  __v: number;
  status?: string;
  announcement?: string;
}

interface DataGridProps {
  promotions: Promotion[];
  loading: boolean;
  error: string | null;
  games: Game[];
  onDelete: (id: string) => Promise<void>;
}

function toGMTString(dateStr: string, gmtOffset: number) {
  if (!dateStr) return "";
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
}: DataGridProps) {
  function getStatus(
    promotion: Promotion
  ): "upcoming" | "running" | "completed" {
    const now = new Date();
    const start = new Date(promotion.startDate);
    const end = new Date(promotion.endDate);

    if (now < start) return "upcoming";
    if (now > end) return "completed";
    return "running";
  }

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

  const getGameNames = (gameIds: number[]) => {
    if (!gameIds || !games.length) return "";

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
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <table className="w-full border-collapse min-w-[1200px]">
        <thead>
          <tr>
            <th className="w-[15%] px-3 py-4 bg-gray-50 text-left text-sm font-semibold text-gray-700 border-b border-r border-gray-200">
              <div className="flex items-center">
                <span>Promotion Name</span>
              </div>
            </th>
            <th className="w-[15%] px-3 py-4 bg-gray-50 text-left text-sm font-semibold text-gray-700 border-b border-r border-gray-200">
              <div className="flex items-center">
                <span>Promotion Code</span>
              </div>
            </th>
            <th className="w-[18%] px-3 py-4 bg-gray-50 text-left text-sm font-semibold text-gray-700 border-b border-r border-gray-200">
              <div className="flex items-center">
                <span>Details</span>
              </div>
            </th>
            <th className="w-[15%] px-3 py-4 bg-gray-50 text-left text-sm font-semibold text-gray-700 border-b border-r border-gray-200">
              <div className="flex items-center">
                <span>Games</span>
              </div>
            </th>
            <th className="w-[8%] px-3 py-4 bg-gray-50 text-center text-sm font-semibold text-gray-700 border-b border-r border-gray-200">
              <div className="flex items-center justify-center">
                <span>Operators</span>
              </div>
            </th>
            <th className="w-[9%] px-3 py-4 bg-gray-50 text-center text-sm font-semibold text-gray-700 border-b border-r border-gray-200 whitespace-nowrap">
              <div className="flex items-center justify-center">
                <span>Bet Settings</span>
              </div>
            </th>
            <th className="w-[7%] px-3 py-4 bg-gray-50 text-center text-sm font-semibold text-gray-700 border-b border-r border-gray-200">
              <div className="flex items-center justify-center">
                <span>Start</span>
              </div>
            </th>
            <th className="w-[7%] px-3 py-4 bg-gray-50 text-center text-sm font-semibold text-gray-700 border-b border-r border-gray-200">
              <div className="flex items-center justify-center">
                <span>End</span>
              </div>
            </th>
            <th className="w-[6%] px-3 py-4 bg-gray-50 text-center text-sm font-semibold text-gray-700 border-b border-r border-gray-200">
              <div className="flex items-center justify-center">
                <span>Status</span>
              </div>
            </th>
            <th className="w-[6%] px-3 py-4 bg-gray-50 text-center text-sm font-semibold text-gray-700 border-b border-r border-gray-200">
              <div className="flex items-center justify-center">
                <span>Notice</span>
              </div>
            </th>
            <th className="w-[7%] px-3 py-4 bg-gray-50 text-center text-sm font-semibold text-gray-700 border-b border-gray-200">
              <div className="flex items-center justify-center">
                <span>Action</span>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {promotions.map((promotion) => {
            const status = getStatus(promotion);
            return (
              <tr key={promotion._id} className="hover:bg-gray-50">
                <td className="px-3 py-2 text-sm border-b border-r border-gray-200">
                  {promotion.name}
                </td>
                <td className="px-3 py-2 text-sm border-b border-r border-gray-200 text-gray-600">
                  {promotion.code}
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
                  <button className="text-blue-600 hover:text-blue-800 cursor-pointer">
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
  );
}
