"use client";

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronDown,
} from "lucide-react";
import { PAGE_SIZE_OPTIONS } from "@/constants/constants";
import { PaginationState } from "@tanstack/react-table";

interface PaginationControlsProps {
  pagination: PaginationState;
  totalCount: number;
  onPaginationChange: (pagination: PaginationState) => void;
  table: any; // React Table instance
  showCurrencyToggle?: boolean;
  isBaseCurrency?: boolean;
  onCurrencyToggle?: (isBaseCurrency: boolean) => void;
}

export default function PaginationControls({
  pagination,
  totalCount,
  onPaginationChange,
  table,
  showCurrencyToggle = false,
  isBaseCurrency = true,
  onCurrencyToggle,
}: PaginationControlsProps) {
  return (
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
          {showCurrencyToggle && onCurrencyToggle && (
            <div className="flex items-end">
              <div className="flex items-center gap-3 h-[42px] px-4 py-2 border border-gray-300 rounded-lg bg-white">
                <button
                  type="button"
                  onClick={() => onCurrencyToggle(!isBaseCurrency)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none cursor-pointer ${
                    isBaseCurrency ? "bg-blue-500" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isBaseCurrency ? "translate-x-4" : "translate-x-0.5"
                    }`}
                  />
                </button>
                <span className="text-sm text-gray-700">
                  Base Currency (USD)
                </span>
              </div>
            </div>
          )}
          
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
  );
}
