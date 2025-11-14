"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  useQueryPromotion,
  useQueryPromotionPlayers,
} from "@/hooks/useQueryPromotionPerformance";
import PerformanceHeader from "@/components/performance/PerformanceHeader";
import PlayersTable from "@/app/promotion/performance/[id]/players/PlayersTable";
import PlayerFilter from "@/app/promotion/performance/[id]/players/PlayerFilter";
import { PaginationState } from "@tanstack/react-table";
import { useDebounce } from "@/hooks/useDebounce";
import { DEBOUNCE_TIME } from "@/constants/constants";
import { PlayerPromotionFilters } from "@/types/performance-report";

export default function Page() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isBaseCurrencyDefault = searchParams.get("isBaseCurrency") ? searchParams.get("isBaseCurrency") === 'true' : true;
  // Table state
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0, // TanStack Table uses 0-based indexing internally
    pageSize: 10,
  });

  // Custom filter states - refactor into single object
  const [filters, setFilters] = useState<PlayerPromotionFilters>({
    searchPlayer: "",
    gameIds: [],
    playerStatus: "",
    startDate: "",
    endDate: "",
    currencies: [],
  });

  const [isBaseCurrency, setIsBaseCurrency] = useState<boolean>(isBaseCurrencyDefault);

  // Debounce filters to avoid too many API calls
  const debouncedSearchPlayer = useDebounce(
    filters.searchPlayer,
    DEBOUNCE_TIME
  );

  // Reset pagination when filters change
  const resetPagination = () => {
    setPagination((prev) => ({
      ...prev,
      pageIndex: 0,
    }));
  };

  // Generic filter update handler
  const handleFilterChange = (
    key: keyof PlayerPromotionFilters,
    value: any
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
    resetPagination();
  };

  // Handle pagination change
  const handlePaginationChange = (
    updater: PaginationState | ((old: PaginationState) => PaginationState)
  ) => {
    setPagination(updater);
  };

  // Handle export players
  const handleExportPlayers = async () => {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append(
        "gameType",
        promotion?.gameConfigType?.toString() || ""
      );
      queryParams.append(
        "currencyGroups",
        promotion?.currencyGroups?.join(",") || ""
      );
      queryParams.append("startDate", filters.startDate);
      queryParams.append("endDate", filters.endDate);
      queryParams.append("status", filters.playerStatus);
      queryParams.append("player", filters.searchPlayer);
      queryParams.append("currencies", filters.currencies.join(","));
      queryParams.append("gameIds", filters.gameIds.join(","));
      queryParams.append("isBaseCurrency", isBaseCurrency.toString());

      const response = await fetch(
        `/api/promotions/${params.id}/players/export?${queryParams.toString()}`
      );

      if (!response.ok) {
        throw new Error("Failed to export players");
      }

      // Get the filename from the response headers
      const contentDisposition = response.headers.get("content-disposition");
      const filename = contentDisposition
        ? contentDisposition.split("filename=")[1]?.replace(/"/g, "")
        : `promotional-players-${params.id}-${new Date().toISOString().split("T")[0]}.csv`;

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
      console.error("Error exporting players:", error);
      alert("Failed to export players. Please try again.");
    }
  };

  const {
    data: promotion,
    error: promotionError,
    isPending: promotionIsPending,
    isError: promotionIsError,
  } = useQueryPromotion(params.id as string);

  // Set default date range when promotion data is loaded
  useEffect(() => {
    if (promotion && !filters.startDate && !filters.endDate) {
      setFilters((prev) => ({
        ...prev,
        startDate: promotion.startDate,
        endDate: promotion.endDate,
      }));
    }
  }, [promotion, filters.startDate, filters.endDate]);

  const shouldFetchPlayers = !!(
    params.id &&
    filters.startDate &&
    filters.endDate &&
    filters.currencies.length > 0
  );

  const {
    data: playersData,
    error: playersError,
    isPending: playersIsPending,
    isError: playersIsError,
  } = useQueryPromotionPlayers(
    params.id as string,
    promotion?.gameConfigType || 0,
    promotion?.currencyGroups || [],
    pagination.pageIndex + 1, // Convert from 0-based (TanStack) to 1-based (API)
    pagination.pageSize,
    {
      player: debouncedSearchPlayer || undefined,
      gameIds: filters.gameIds.join(",") || undefined,
      status: filters.playerStatus || undefined,
      currencies: filters.currencies.join(",") || undefined,
      startDate: filters.startDate || undefined,
      endDate: filters.endDate || undefined,
    },
    {
      enabled: shouldFetchPlayers,
    }
  );

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

  const players = playersData?.items || [];
  const totalCount = playersData?.metadata?.totalCount || 0;
  const pageCount =
    totalCount > 0 ? Math.ceil(totalCount / pagination.pageSize) : 1;
  const metaDataTotalAmount = {
    baseTotalWinAmount: playersData?.metadata?.baseTotalWinAmount || 0,
    baseTotalTurnover: playersData?.metadata?.baseTotalTurnover || 0,
    baseTotalBonusClaimed: playersData?.metadata?.baseTotalBonusClaimed || 0,
  };

  return (
    <div className="h-full bg-gray-50 flex flex-col">
      {promotion && (
        <PerformanceHeader
          title="Players in Promotion"
          backTitle="Back to Promotion Performance"
          promotion={promotion}
          onBack={() => router.push(`/promotion/performance/${params.id}`)}
        />
      )}

      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <div className="space-y-6">
          <PlayerFilter
            filters={filters}
            onFilterChange={handleFilterChange}
            promotionStartDate={promotion?.startDate}
            promotionEndDate={promotion?.endDate}
            games={promotion?.games || []}
          />
          <PlayersTable
            isBaseCurrency={isBaseCurrency}
            onCurrencyToggle={setIsBaseCurrency}
            data={players}
            metaDataTotalAmount={metaDataTotalAmount}
            pageCount={pageCount}
            totalCount={totalCount}
            pagination={pagination}
            onPaginationChange={handlePaginationChange}
            isLoading={playersIsPending}
            onExportPlayers={handleExportPlayers}
            promotion={promotion}
          />
          {playersIsError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="text-sm text-red-600">
                Error loading players: {playersError?.message}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
