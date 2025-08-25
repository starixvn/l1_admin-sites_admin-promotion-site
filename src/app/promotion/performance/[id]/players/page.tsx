"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Search, Eye, Users } from "lucide-react";
import DateRange from "@/components/ui/date-range";
import { formatCurrency, getProgressColor, getStatusColor, getStatusDot } from "@/helper/common";
import PerformanceHeader from "@/components/performance/PerformanceHeader";
import { usePromotionData } from "@/hooks/usePromotionData";
import { convertToGMTDate } from "@/lib/date-time.utils";



export default function PlayersPage() {
  const params = useParams();
  const router = useRouter();
  
  interface Player {
    id: string;
    username: string;
    status: string;
    dateJoined: string;
    bonusReceived: number;
    turnoverContributed: number;
    progress: { current: number; required: number };
    bonusRedeemed: number;
    lastActivity: string;
  }

  interface PlayersData {
    players: Player[];
  }

  const {
    promotion,
    data: playersData,
    startDate,
    endDate,
    loading,
    error,
    setStartDate,
    setEndDate,
    refetch
  } = usePromotionData<PlayersData>(params.id as string, {
    gmtOffset: 7,
    promotionApiUrl: `/api/promotions/${params.id}`,
    dataApiUrl: `/api/promotions/${params.id}/performance/players`
  });
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [playerStatus, setPlayerStatus] = useState("All Players");

  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  const clearFilters = () => {
    setSearchTerm("");
    setPlayerStatus("All Players");
    if (promotion) {
      setStartDate(promotion.startDate);
      setEndDate(promotion.endDate);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg text-red-500">Error: {error}</div>
      </div>
    );
  }

  if (!promotion || !playersData) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg text-red-500">Data not found</div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50 flex flex-col">
      <PerformanceHeader 
        title="Players in Promotion"
        backTitle="Back to Promotion Performance"
        promotion={promotion} 
        onBack={() => router.push(`/promotion/performance/${params.id}`)} 
      />

      <div className="px-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by Player ID or Username"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <select
                value={playerStatus}
                onChange={(e) => setPlayerStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="All Players">All Players</option>
                <option value="Active">Active</option>
                <option value="Turnover Met">Turnover Met</option>
                <option value="Bonus Redeemed">Bonus Redeemed</option>
                <option value="Ineligible">Ineligible</option>
                <option value="Opted Out">Opted Out</option>
              </select>
            </div>

             <DateRange
               startDate={startDate}
               endDate={endDate}
               onStartDateChange={setStartDate}
               onEndDateChange={setEndDate}
               minDate={convertToGMTDate(promotion.startDate)}
               maxDate={convertToGMTDate(promotion.endDate)}
             />

            <button
              onClick={clearFilters}
              className="px-4 py-2 text-gray-600 hover:text-gray-700 font-medium"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Player List</h2>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                <tr>
                  <th className="px-6 py-3 text-left">Player ID/Username</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-left">Date Joined</th>
                  <th className="px-6 py-3 text-right">Bonus Received</th>
                  <th className="px-6 py-3 text-right">Turnover Contributed</th>
                  <th className="px-6 py-3 text-center">Progress</th>
                  <th className="px-6 py-3 text-right">Bonus Redeemed</th>
                  <th className="px-6 py-3 text-left">Last Activity</th>
                  <th className="px-6 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {playersData.players.map((player) => (
                  <tr key={player.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{player.username}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getStatusDot(player.status)}`}></div>
                        <span className={`text-sm font-medium ${getStatusColor(player.status)}`}>
                          {player.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(player.dateJoined)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 text-right">
                      {formatCurrency(player.bonusReceived)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 text-right">
                      {formatCurrency(player.turnoverContributed)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${getProgressColor(player.progress.current, player.progress.required)}`}
                            style={{
                              width: `${Math.min((player.progress.current / player.progress.required) * 100, 100)}%`
                            }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-600">
                          {player.progress.current}x/{player.progress.required}x
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 text-right">
                      {formatCurrency(player.bonusRedeemed)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(player.lastActivity)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <button
                          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4 text-gray-600 hover:text-black" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
