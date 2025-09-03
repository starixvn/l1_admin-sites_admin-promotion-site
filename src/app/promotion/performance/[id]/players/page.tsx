"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQueryPromotion, useQueryPromotionPlayers } from "@/hooks/useQueryPromotionPerformance";
import PerformanceHeader from "@/components/performance/PerformanceHeader";
import PlayersTable from "@/components/performance/PlayersTable";
import PlayerFilter from "@/components/performance/PlayerFilter";
import { PaginationState, ColumnFiltersState } from "@tanstack/react-table";
import { useDebounce } from "@/hooks/useDebounce";
import { DEBOUNCE_TIME } from "@/constants/constants";
import { PlayerPromotionFilters } from "@/types/performance-report";

export default function Page() {
  const params = useParams();
  const router = useRouter();

  // Table state
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0, // TanStack Table uses 0-based indexing internally
    pageSize: 10,
  });
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  // Custom filter states - refactor into single object
  const [filters, setFilters] = useState<PlayerPromotionFilters>({
    searchPlayer: "",
    playerStatus: "",
    startDate: "",
    endDate: "",
    isBaseCurrency: false,
  });

  // Debounce filters to avoid too many API calls
  const debouncedSearchPlayer = useDebounce(filters.searchPlayer, DEBOUNCE_TIME);

  // Reset pagination when filters change
  const resetPagination = () => {
    setPagination((prev) => ({
      ...prev,
      pageIndex: 0,
    }));
  };

  // Generic filter update handler
  const handleFilterChange = (key: keyof PlayerPromotionFilters, value: any) => {
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

  // Handle column filters change
  const handleColumnFiltersChange = (
    updater:
      | ColumnFiltersState
      | ((old: ColumnFiltersState) => ColumnFiltersState)
  ) => {
    setColumnFilters(updater);
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

  const {
    data: playersData,
    error: playersError,
    isPending: playersIsPending,
    isError: playersIsError,
  } = useQueryPromotionPlayers(
    params.id as string,
    pagination.pageIndex + 1, // Convert from 0-based (TanStack) to 1-based (API)
    pagination.pageSize,
    {
      player: debouncedSearchPlayer || undefined,
      status: filters.playerStatus || undefined,
      isBaseCurrency: filters.isBaseCurrency || undefined,
      startDate: filters.startDate || undefined,
      endDate: filters.endDate || undefined,
      ...(columnFilters.length > 0 && {
        columnFilters: columnFilters.reduce((acc, filter) => {
          if (filter.value) {
            acc[filter.id] = filter.value;
          }
          return acc;
        }, {} as Record<string, any>),
      }),
    }
  );

  if (promotionIsPending) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg">Loading promotion data...</div>
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
  const totalCount = playersData?.metadata?.total || 0;
  const pageCount =
    totalCount > 0 ? Math.ceil(totalCount / pagination.pageSize) : 1;

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
          />
          <PlayersTable
            data={players}
            pageCount={pageCount}
            totalCount={totalCount}
            pagination={pagination}
            onPaginationChange={handlePaginationChange}
            columnFilters={columnFilters}
            onColumnFiltersChange={handleColumnFiltersChange}
            isLoading={playersIsPending}
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
