"use client";

import { GAME_TYPES } from '@/constants/gameTypes';
import { Game } from '@/types/game';

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
}

function toGMTString(dateStr: string, gmtOffset: number) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const gmtDate = new Date(date.getTime() + gmtOffset * 60 * 60 * 1000);
  return gmtDate.toLocaleString("en-GB", {
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
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
    
    return gameIds.map(id => {
      const game = games.find(g => g.GameId === id);
      return game ? game.DisplayName : id;
    }).join(", ");
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
    <div className="overflow-x-auto border rounded-lg bg-white shadow">
      <table className="min-w-full border-collapse">
        <thead>
          <tr>
            {[
              "Promotion name",
              "Promotion Code",
              "Details",
              "Games",
              "Operators",
              "Bet Settings",
              "Start date (GMT +7)",
              "End date (GMT +7)",
              "Status",
              "Announcement",
              "Action",
            ].map((header) => (
              <th
                key={header}
                className="border border-gray-300 px-3 py-2 text-base font-bold text-gray-700 bg-gray-50 text-center"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {promotions.map((promotion) => {
            const status = getStatus(promotion);
            return (
              <tr key={promotion._id} className="hover:bg-gray-100">
                <td className="border border-gray-300 px-3 py-2 align-middle text-center">
                  {promotion.name}
                </td>
                <td className="border border-gray-300 px-3 py-2 align-middle text-center">
                  {promotion.code}
                </td>
                <td className="border border-gray-300 px-3 py-2 align-top">
                  <div>{getGameTypeName(promotion.gameConfigType)}</div>
                  <div className="text-xs">Number of Free Spin</div>
                  <input
                    type="text"
                    value={promotion.bonusItemCount}
                    readOnly
                    className="border rounded bg-gray-100 w-18 text-center mt-1"
                  />
                </td>
                <td className="border border-gray-300 px-3 py-2 align-top">
                  {promotion.gameIds && promotion.gameIds.length > 0
                    ? getGameNames(promotion.gameIds)
                    : ""}
                </td>
                <td className="border border-gray-300 px-3 py-2 align-middle text-center">
                  {promotion.operatorId}
                </td>
                <td className="border border-gray-300 px-3 py-2 align-middle text-center">
                  <button className="text-blue-600 hover:text-blue-800 cursor-pointer">
                    Details
                  </button>
                </td>
                <td className="border border-gray-300 px-3 py-2 align-middle text-center">
                  {toGMTString(promotion.startDate, 7)}
                </td>
                <td className="border border-gray-300 px-3 py-2 align-middle text-center">
                  {toGMTString(promotion.endDate, 7)}
                </td>
                <td
                  className={`border border-gray-300 px-3 py-2 align-middle text-center font-semibold ${getStatusColorByDate(
                    promotion
                  )}`}
                >
                  {status === "upcoming"
                    ? "Up Coming"
                    : status.charAt(0).toUpperCase() + status.slice(1)}
                </td>
                <td className="border border-gray-300 px-3 py-2 align-middle text-center">
                  <span className="text-green-400 font-medium">Linked</span>
                </td>
                <td className="border border-gray-300 px-3 py-2 align-middle text-center">
                  <div className="flex flex-col gap-2">
                    <button
                      className={`w-16 py-1 rounded font-semibold ${
                        status === "completed"
                          ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                          : "bg-green-500 text-white hover:bg-green-600 cursor-pointer"
                      }`}
                      disabled={status === "completed"}
                    >
                      Edit
                    </button>
                    <button
                      className={`w-16 py-1 rounded font-semibold ${
                        status === "completed" || status === "running"
                          ? "bg-gray-300 text-gray-600 cursor-not-allowed"
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
