"use client";

import { useState, useMemo } from "react";
import {
  ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState,
  PaginationState,
} from "@tanstack/react-table";
import {
  Download,
  Ticket,
} from "lucide-react";
import { toGMTStringWithSeconds } from "@/lib/date-time.utils";
import { GMT_OFFSET } from "@/constants/constants";
import { PromotionalTicket } from "@/types/promotional-tickets";
import { roundToDecimals } from "@/lib/promotion/promotion.utils";
import { fuzzySort } from "@/lib/table-utils";
import PaginationControls from "@/components/common/PaginationControls";
import TableHeader from "@/components/common/TableHeader";
import TableBody from "@/components/common/TableBody";

// Basic ticket information columns
const getBasicTicketColumns = (): ColumnDef<PromotionalTicket>[] => [
  {
    accessorKey: "gameRoundId",
    header: "Round ID",
    enableSorting: true,
    size: 150,
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("gameRoundId")}</div>
    ),
  },
  {
    accessorKey: "gameId",
    header: "Game ID / Name",
    enableSorting: true,
    size: 200,
    cell: ({ row }) => {
      const gameId = row.getValue("gameId") as string;
      const displayName = row.original.displayName;
      return (
        <div className="font-medium">
          {gameId} / {displayName}
        </div>
      );
    },
  },
];

// Amount-related columns with currency toggle
const getAmountColumns = (isBaseCurrency: boolean): ColumnDef<PromotionalTicket>[] => {
  const betAmountKey = isBaseCurrency ? "baseBetAmount" : "betAmount";
  const winAmountKey = isBaseCurrency ? "baseWinAmount" : "winAmount";

  return [
    {
      accessorKey: betAmountKey,
      header: 'Bet Amount',
      enableSorting: true,
      size: 160,
      cell: ({ row }) => (
        <div className="font-medium">
          {roundToDecimals(row.getValue(betAmountKey))}
        </div>
      ),
    },
    {
      accessorKey: winAmountKey,
      header: 'Win Amount',
      enableSorting: true,
      size: 160,
      cell: ({ row }) => (
        <div className="font-medium">
          {roundToDecimals(row.getValue(winAmountKey))}
        </div>
      ),
    },
    {
      accessorKey: "siteName",
      header: "Site Name",
      enableSorting: true,
      size: 120,
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("siteName")}</div>
      ),
    },
  ];
};

// Created date column
const getCreatedAtColumn = (): ColumnDef<PromotionalTicket> => ({
  accessorKey: "createdAt",
  header: "Date Time (GMT+7)",
  enableSorting: true,
  size: 180,
  cell: ({ row }) => (
    <div className="font-medium">
      {toGMTStringWithSeconds(row.getValue("createdAt"), GMT_OFFSET)}
    </div>
  ),
});

interface TicketPromotionTableProps {
  tickets: PromotionalTicket[];
  totalCount: number;
  totalPages: number;
  isLoading: boolean;
  metaData: {
    totalBetAmount: number;
    totalWinAmount: number;
    totalBaseBetAmount: number;
    totalBaseWinAmount: number;
  };
  error: Error | null;
  onRefetch: () => void;
  onExportTickets: () => void;
  pagination: {
    pageIndex: number;
    pageSize: number;
  };
  onPaginationChange: (pagination: { pageIndex: number; pageSize: number }) => void;
  isBaseCurrency: boolean;
}

export default function TicketPromotionTable({
  tickets,
  totalCount,
  totalPages,
  metaData,
  isLoading,
  error,
  onRefetch,
  onExportTickets,
  pagination,
  onPaginationChange,
  isBaseCurrency,
}: TicketPromotionTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    {
      id: "createdAt",
      desc: true,
    },
  ]);

  const columns = useMemo<ColumnDef<PromotionalTicket>[]>(() => {
    return [
      getCreatedAtColumn(),
      ...getBasicTicketColumns(),
      ...getAmountColumns(isBaseCurrency),
    ];
  }, [isBaseCurrency]);

  // Handle pagination change
  const handlePaginationChange = (
    updater: PaginationState | ((old: PaginationState) => PaginationState)
  ) => {
    const newPagination = typeof updater === 'function' ? updater(pagination) : updater;
    onPaginationChange(newPagination);
  };

  const table = useReactTable({
    data: tickets,
    columns,
    sortingFns: {
      fuzzy: fuzzySort,
    },
    state: {
      sorting,
      pagination,
    },
    onSortingChange: setSorting,
    onPaginationChange: handlePaginationChange,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    pageCount: totalPages,
  });

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Ticket className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">
            Promotional Tickets
          </h2>
        </div>
        <button 
          onClick={onExportTickets}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>
      
      <PaginationControls
        pagination={pagination}
        totalCount={totalCount}
        onPaginationChange={handlePaginationChange}
        table={table}
      />

      <div className="overflow-x-auto">
        <table className="w-full">
          <TableHeader table={table} />
          <TableBody
            table={table}
            columns={columns}
            isLoading={isLoading}
            error={error}
            onRefetch={onRefetch}
            loadingText="Loading tickets..."
            errorText="Error loading tickets"
            emptyText="No tickets found."
          />
          {/* Total Row */}
          {!isLoading && tickets.length > 0 && (
            <tfoot className="bg-gray-50 border-t-1 border-gray-300">
              <tr>
                <td className="px-6 py-3 text-sm font-semibold text-gray-900">
                    Total
                    <span className="text-xs text-gray-500 block">
                      {" "}
                      {isBaseCurrency ? 'Base USD' : ''}
                    </span>
                  </td>
                <td className="px-6 py-3 text-sm text-gray-500">-</td>
                <td className="px-6 py-3 text-sm text-gray-500">-</td>
                <td className="px-6 py-3 text-sm font-semibold text-gray-900">
                  {roundToDecimals(isBaseCurrency ? metaData.totalBaseBetAmount : metaData.totalBetAmount)}
                </td>
                <td className="px-6 py-3 text-sm font-semibold text-gray-900">
                  {roundToDecimals(isBaseCurrency ? metaData.totalBaseWinAmount : metaData.totalWinAmount)}
                </td>
                <td className="px-6 py-3 text-sm text-gray-500">-</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
