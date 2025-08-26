"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Eye, Users } from "lucide-react";
import Pagination from "@/components/ui/pagination";
import { formatCurrency, getProgressColor, getStatusColor, getStatusDot } from "@/helper/common";
import { PAGE_SIZE_OPTIONS } from "@/constants/constants";
import PerformanceHeader from "@/components/performance/PerformanceHeader";
import { usePromotionData } from "@/hooks/usePromotionData";
import { useDebounce } from "@/hooks/useDebounce";
import PlayerFilter from "./PlayerFilter";



export default function Page() {
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

  interface PlayersResponse {
    items: Player[];
    metadata: {
      pageIndex: number;
      total: number;
      pageSize: number;
    };
  }

  // Filter states
  const [searchPlayer, setSearchPlayer] = useState("");
  const [playerStatus, setPlayerStatus] = useState("All Status");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(PAGE_SIZE_OPTIONS[0]);

  // Debounce search player input
  const debouncedSearchPlayer = useDebounce(searchPlayer, 500);

  const {
    promotion,
    data: playersResponse,
    startDate,
    endDate,
    loading,
    setStartDate,
    setEndDate,
  } = usePromotionData<PlayersResponse>(params.id as string, {
    promotionApiUrl: `/api/promotions/${params.id}`,
    dataApiUrl: `/api/promotions/${params.id}/performance/players`,
    status: playerStatus,
    player: debouncedSearchPlayer,
    pageIndex: currentPage,
    pageSize: itemsPerPage
  });

  const playersData = playersResponse?.items || [];
  const metadata = playersResponse?.metadata;
  const totalPages = metadata ? Math.ceil(metadata.total / metadata.pageSize) : 0;

  // Reset page index to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchPlayer, playerStatus, startDate, endDate, itemsPerPage]);
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  if (loading && !promotion && !playersResponse) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50 flex flex-col">
      {promotion && <PerformanceHeader 
        title="Players in Promotion"
        backTitle="Back to Promotion Performance"
        promotion={promotion} 
        onBack={() => router.push(`/promotion/performance/${params.id}`)} 
      />}

      <PlayerFilter
        searchPlayer={searchPlayer}
        setSearchPlayer={setSearchPlayer}
        playerStatus={playerStatus}
        setPlayerStatus={setPlayerStatus}
        startDate={startDate}
        endDate={endDate}
        setStartDate={setStartDate}
        setEndDate={setEndDate}
        promotionStartDate={promotion?.startDate}
        promotionEndDate={promotion?.endDate}
      />

      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="text-lg text-gray-600">Loading players data...</div>
          </div>
        )}
        
        {!loading && playersResponse && (
          <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-2 mb-4">
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
                {playersData.map((player) => (
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
          
          {metadata && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {((metadata.pageIndex - 1) * metadata.pageSize) + 1} to {Math.min(metadata.pageIndex * metadata.pageSize, metadata.total)} of {metadata.total} results
                </div>
                <div className="flex items-center gap-4">
                  {metadata.total > metadata.pageSize && (
                    <Pagination
                      currentPage={metadata.pageIndex}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                    />
                  )}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Rows per page:</span>
                    <select 
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                      }}
                      className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {PAGE_SIZE_OPTIONS.map((size) => (
                        <option key={size} value={size}>{size}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        )}
      </div>
    </div>
  );
}
