"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { usePromotionalTickets } from "@/hooks/usePromotionalTickets";
import { ArrowLeft } from "lucide-react";
import { DEBOUNCE_TIME } from "@/constants/constants";
import { PromotionalTicketsFilters } from "@/types/promotional-tickets";
import { useQueryPromotion } from "@/hooks/useQueryPromotionPerformance";
import { useDebounce } from "@/hooks/useDebounce";
import TicketPromotionTable from "./TicketPromotionTable";
import TicketPromotionFilter from "./TicketPromotionFilter";

export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const playerId = searchParams.get("playerId") || "UnknownPlayer";
  const username = searchParams.get("username") || "UnknownUsername";
  const isBaseCurrency = searchParams.get("isBaseCurrency") === 'true';
  const promotionId = params.id as string;
  const playerPromotionId = searchParams.get("playerPromotionId") || "UnknownPlayerPromotion";

  const [filters, setFilters] = useState<PromotionalTicketsFilters>({
    roundId: "",
    startDate: "",
    endDate: "",
  });

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const debouncedSearchPlayer = useDebounce(filters.roundId, DEBOUNCE_TIME);
  // Reset pagination when filters change
  const resetPagination = () => {
    setPagination((prev) => ({
      ...prev,
      pageIndex: 0,
    }));
  };

  const {
    data: promotion,
    error: promotionError,
    isPending: promotionIsPending,
    isError: promotionIsError,
  } = useQueryPromotion(params.id as string);

  useEffect(() => {
    if (promotion && !filters.startDate && !filters.endDate) {
      setFilters((prev) => ({
        ...prev,
        startDate: promotion.startDate,
        endDate: promotion.endDate,
      }));
    }
  }, [promotion, filters.startDate, filters.endDate]);

  const shouldFetchTickets = !!(
    params.id &&
    filters.startDate &&
    filters.endDate &&
    playerId
  );
  // Use the API hook to fetch data
  const {
    data: ticketsData,
    isLoading,
    error,
    refetch,
  } = usePromotionalTickets({
    promotionId,
    playerPromotionId,
    gameType: promotion?.gameConfigType || 0,
    currencyGroups: promotion?.currencyGroups || [],
    playerId,
    filters: {
      roundId: debouncedSearchPlayer || "",
      startDate: filters.startDate || "",
      endDate: filters.endDate || "",
    },
    pageIndex: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
    enabled: shouldFetchTickets,
  });
  const tickets = ticketsData?.tickets || [];
  const totalPages = ticketsData?.totalPages || 0;
  const totalCount = ticketsData?.metaData?.totalCount || 0;
  const handleFilterChange = (
    key: keyof PromotionalTicketsFilters,
    value: string
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    resetPagination();
  };

  const handleBackToPlayers = () => {
    // Navigate back to the players page
    router.push(`/promotion/performance/${promotionId}/players?isBaseCurrency=${isBaseCurrency.toString()}`);
  };

  const handleExportTickets = async () => {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('playerId', playerId);
      queryParams.append('roundId', filters.roundId);
      queryParams.append('startDate', filters.startDate);
      queryParams.append('endDate', filters.endDate);
      queryParams.append('isBaseCurrency', isBaseCurrency.toString());
      queryParams.append('gameType', promotion?.gameConfigType?.toString() || "");
      queryParams.append('currencyGroups', promotion?.currencyGroups?.join(",") || "");
      queryParams.append('playerPromotionId', playerPromotionId);
      const response = await fetch(
        `/api/promotions/${promotionId}/tickets/export?${queryParams.toString()}`
      );

      if (!response.ok) {
        throw new Error("Failed to export tickets");
      }

      // Get the filename from the response headers
      const contentDisposition = response.headers.get("content-disposition");
      const filename = contentDisposition
        ? contentDisposition.split("filename=")[1]?.replace(/"/g, "")
        : `promotional-tickets-${playerId}-${
            new Date().toISOString().split("T")[0]
          }.csv`;

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting tickets:", error);
      // You could add a toast notification here
      alert("Failed to export tickets. Please try again.");
    }
  };

  if (promotionIsPending) {
    return (
      <div className="flex items-center justify-center gap-2">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        Loading promotion data...
      </div>
    );
  }

  if (promotionIsError) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg text-red-500">
          Error loading promotion: {promotionError?.message}
        </div>
      </div>
    );
  }

  // Show loading if promotionId is not available yet
  if (!promotionId) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50 flex flex-col">
      {/* Header Section */}
      <div className="w-full px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Promotional Tickets: {username}
            </h1>
          </div>
          <button
            onClick={handleBackToPlayers}
            className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Players
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <div className="space-y-6">
          {/* Search & Filter Section */}
          <TicketPromotionFilter
            filters={filters}
            onFilterChange={handleFilterChange}
            promotionStartDate={promotion?.startDate}
            promotionEndDate={promotion?.endDate}
          />
          {/* Promotional Tickets Table */}
          <TicketPromotionTable
            tickets={tickets}
            metaData={ticketsData?.metaData || {
              totalCount: 0,
              totalBetAmount: 0,
              totalWinAmount: 0,
              totalBaseBetAmount: 0,
              totalBaseWinAmount: 0,
            }}
            totalCount={totalCount}
            totalPages={totalPages}
            isLoading={isLoading}
            error={error}
            onRefetch={refetch}
            onExportTickets={handleExportTickets}
            pagination={pagination}
            onPaginationChange={setPagination}
            isBaseCurrency={isBaseCurrency}
          />
        </div>
      </div>
    </div>
  );
}
