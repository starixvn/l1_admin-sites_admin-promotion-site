"use client";

import { useState, useMemo } from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingFn,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState,
  PaginationState,
} from "@tanstack/react-table";
import { RankingInfo, compareItems } from "@tanstack/match-sorter-utils";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronDown,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import {
  getProgressColor,
  getStatusColor,
  getStatusDot,
} from "@/helper/common";
import { toGMTString } from "@/lib/date-time.utils";
import { GMT_OFFSET, PAGE_SIZE_OPTIONS } from "@/constants/constants";
import { Player } from "@/types/performance-report";
import { roundToTwoDecimals } from "@/lib/promotion/promotion.utils";

interface PlayersTableProps {
  data: Player[];
  metaDataTotalAmount: {
    baseTotalWinAmount: number;
    baseTotalTurnover: number;
    baseTotalBonusClaimed: number;
  };
  pageCount: number;
  totalCount?: number;
  pagination: PaginationState;
  onPaginationChange: (
    updater: PaginationState | ((old: PaginationState) => PaginationState)
  ) => void;
  columnFilters: ColumnFiltersState;
  onColumnFiltersChange: (
    updater:
      | ColumnFiltersState
      | ((old: ColumnFiltersState) => ColumnFiltersState)
  ) => void;
  isLoading?: boolean;
}

const fuzzySort: SortingFn<any> = (rowA, rowB, columnId) => {
  // Only sort by rank if the column has ranking data
  const aRank = rowA.columnFiltersMeta[columnId] as RankingInfo;
  const bRank = rowB.columnFiltersMeta[columnId] as RankingInfo;

  if (aRank && bRank) {
    return compareItems(aRank, bRank);
  }

  return 0;
};

export default function PlayersTable({
  data,
  metaDataTotalAmount,
  pageCount,
  totalCount,
  pagination,
  onPaginationChange,
  columnFilters,
  onColumnFiltersChange,
  isLoading = false
}: PlayersTableProps) {
  const [isBaseCurrency, setIsBaseCurrency] = useState<boolean>(true);
  const [sorting, setSorting] = useState<SortingState>([
    {
      id: "dateJoined",
      desc: true,
    },
  ]);

  const columns = useMemo<ColumnDef<Player>[]>(
    () => {
      const bonusClaimedKey = isBaseCurrency ? "baseBonusClaimed" : "bonusClaimed";
      const turnoverKey = isBaseCurrency ? "baseTurnover" : "turnover";
      const bonusWinKey = isBaseCurrency ? "baseBonusWin" : "bonusWin";
      return [
      {
        accessorKey: "id",
        header: "Player ID",
        enableSorting: true,
        size: 100,
        cell: ({ row }) => {
          const playerId = row.getValue("id") as string;
          return (
            <div 
              className="font-medium truncate max-w-[120px]" 
              title={playerId}
            >
              {playerId}
            </div>
          );
        },
      },
      {
        accessorKey: "username",
        header: "Username",
        enableSorting: true,
        size: 120,
        cell: ({ row }) => {
          const username = row.getValue("username") as string;
          return (
            <div 
              className="font-medium truncate max-w-[120px]" 
              title={username}
            >
              {username}
            </div>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        enableSorting: true,
        size: 130,
        cell: ({ row }) => {
          const status = row.getValue("status") as string;
          return (
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${getStatusDot(status)}`}
              ></div>
              <span className={`text-sm font-medium ${getStatusColor(status)}`}>
                {status}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "siteName",
        header: "SiteName",
        enableSorting: true,
        size: 100,
        cell: ({ row }) => (
          <div className="font-medium">{row.getValue("siteName")}</div>
        ),
      },
      {
        accessorKey: "currency",
        header: "Currency",
        enableSorting: true,
        size: 100,
        cell: ({ row }) => (
          <div className="font-medium">{row.getValue("currency")}</div>
        ),
      },
      {
        accessorKey: "dateJoined",
        header: "Date Joined",
        enableSorting: true,
        size: 140,
        cell: ({ row }) => (
          <div>{toGMTString(row.getValue("dateJoined"), GMT_OFFSET)}</div>
        ),
      },
      {
        accessorKey: bonusWinKey,
        header: "Bonus Win",
        enableSorting: true,
        size: 120,
        cell: ({ row }) => (
          <div className="font-medium">
            {roundToTwoDecimals(row.getValue(bonusWinKey))}
          </div>
        ),
      },
      {
        accessorKey: turnoverKey,
        header: "Turnover",
        enableSorting: true,
        size: 120,
        cell: ({ row }) => (
          <div className="font-medium">
            {roundToTwoDecimals(row.getValue(turnoverKey))}
          </div>
        ),
      },
      {
        id: "progress",
        header: "Progress",
        accessorFn: (row) => row.progress.current,
        enableSorting: true,
        size: 140,
        cell: ({ row }) => {
          const progress = row.original.progress as {
            current: number;
            required: number;
          };
          const percentage =
            Math.min((progress.current / progress.required) * 100, 100) || 0;
          return (
            <div className="flex items-center gap-2">
              <div className="w-20 bg-gray-200 rounded-full h-2 flex-shrink-0">
                <div
                  className={`h-2 rounded-full transition-all duration-200 ${getProgressColor(
                    progress.current,
                    progress.required
                  )}`}
                  style={{
                    width: `${percentage}%`,
                  }}
                ></div>
              </div>
              <span className="text-xs text-gray-600 whitespace-nowrap">
                {progress.current}x/{progress.required}x
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: bonusClaimedKey,
        header: "Bonus Claimed",
        enableSorting: true,
        size: 140,
        cell: ({ row }) => (
          <div className="font-medium">
            {roundToTwoDecimals(row.getValue(bonusClaimedKey))}
          </div>
        ),
      },
      {
        accessorKey: "lastActivity",
        header: "Last Activity",
        enableSorting: true,
        size: 140,
        cell: ({ row }) => (
          <div>{toGMTString(row.getValue("lastActivity"), GMT_OFFSET)}</div>
        ),
      },
    ];
    },
    [isBaseCurrency]
  );

  const table = useReactTable({
    data: data || [],
    columns,
    sortingFns: {
      fuzzy: fuzzySort,
    },
    state: {
      sorting,
      columnFilters,
      pagination,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: (updater) => {
      onColumnFiltersChange(updater);
      // Only reset to first page when there are actual filters
      const newFilters =
        typeof updater === "function" ? updater(columnFilters) : updater;
      if (newFilters.length > 0) {
        onPaginationChange({
          ...pagination,
          pageIndex: 0,
        });
      }
    },
    onPaginationChange,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    pageCount: pageCount,
  });

  return (
    <div className="space-y-4">
      {/* Page Size Selector */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center justify-between">
          {totalCount !== undefined && (
            <div className="text-sm text-gray-600">
              Showing {pagination.pageIndex * pagination.pageSize + 1} to{" "}
              {Math.min(
                (pagination.pageIndex + 1) * pagination.pageSize,
                totalCount
              )}{" "}
              of{" "}
              <span className="font-medium text-gray-900">
                {totalCount.toLocaleString()}
              </span>{" "}
              results
            </div>
          )}

          <div className="flex items-center gap-6">
            <div className="flex items-end">
            <div className="flex items-center gap-3 h-[42px] px-4 py-2 border border-gray-300 rounded-lg bg-white">
              <button
                type="button"
                onClick={() => setIsBaseCurrency(!isBaseCurrency)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none cursor-pointer ${
                  isBaseCurrency ? 'bg-blue-500' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isBaseCurrency ? 'translate-x-4' : 'translate-x-0.5'
                  }`}
                />
              </button>
                <span className="text-sm text-gray-700">Base Currency (USD)</span>
              </div>
            </div>
            <nav
              className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
              aria-label="Pagination"
            >
              <button
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">First</span>
                <ChevronsLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Previous</span>
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Next</span>
                <ChevronRight className="h-5 w-5" />
              </button>
              <button
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Last</span>
                <ChevronsRight className="h-5 w-5" />
              </button>
            </nav>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Show:</span>
              <div className="relative">
                <select
                  value={pagination.pageSize}
                  onChange={(e) => {
                    onPaginationChange({
                      ...pagination,
                      pageIndex: 0, // Reset to first page when changing page size
                      pageSize: Number(e.target.value),
                    });
                  }}
                  className="appearance-none w-15 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {PAGE_SIZE_OPTIONS.map((size: number) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-1 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              </div>
              <span className="text-sm text-gray-600">entries</span>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="w-full">
          <table className="w-full table-fixed">
            <thead className="bg-gray-50 border-b border-gray-200">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className={`px-3 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider`}
                      style={{ width: header.column.getSize() }}
                    >
                      {header.isPlaceholder ? null : (
                        <div
                          className={`flex items-center gap-2 ${
                            header.column.getCanSort()
                              ? "cursor-pointer select-none hover:text-blue-600 transition-colors"
                              : ""
                          }`}
                          onClick={header.column.getToggleSortingHandler()}
                          title={
                            header.column.getCanSort()
                              ? "Click to sort"
                              : undefined
                          }
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {header.column.getCanSort() && (
                            <div className="flex items-center justify-end">
                              {header.column.getIsSorted() === "asc" ? (
                                <ArrowUp className="w-4 h-4 text-blue-600" />
                              ) : header.column.getIsSorted() === "desc" ? (
                                <ArrowDown className="w-4 h-4 text-blue-600" />
                              ) : (
                                <ArrowUpDown className="w-4 h-4 text-gray-400 opacity-60 hover:opacity-100 transition-opacity" />
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    Loading...
                  </td>
                </tr>
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="px-3 py-4 text-sm text-gray-900"
                        style={{ width: cell.column.getSize() }}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No results.
                  </td>
                </tr>
              )}
            </tbody>
            {/* Total Row */}
            {!isLoading && table.getRowModel().rows?.length > 0 && (
              <tfoot className="bg-gray-50 border-t-1 border-gray-300">
                <tr>
                  <td className="px-3 py-3 text-sm font-semibold text-gray-900">
                    Total
                    <span className="text-xs text-gray-500 block"> (Base USD)</span>
                  </td>
                  <td className="px-3 py-3 text-sm text-gray-500">-</td>
                  <td className="px-3 py-3 text-sm text-gray-500">-</td>
                  <td className="px-3 py-3 text-sm text-gray-500">-</td>
                  <td className="px-3 py-3 text-sm text-gray-500">-</td>
                  <td className="px-3 py-3 text-sm text-gray-500">-</td>
                  <td className="px-3 py-3 text-sm font-semibold text-gray-900">
                    {roundToTwoDecimals(metaDataTotalAmount.baseTotalWinAmount)}
                  </td>
                  <td className="px-3 py-3 text-sm font-semibold text-gray-900">
                    {roundToTwoDecimals(metaDataTotalAmount.baseTotalTurnover)}
                  </td>
                  <td className="px-3 py-3 text-sm text-gray-500">-</td>
                  <td className="px-3 py-3 text-sm font-semibold text-gray-900">
                    {roundToTwoDecimals(metaDataTotalAmount.baseTotalBonusClaimed)}
                  </td>
                  <td className="px-3 py-3 text-sm text-gray-500">-</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
