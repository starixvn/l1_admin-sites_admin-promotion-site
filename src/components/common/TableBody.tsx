"use client";

import { flexRender } from "@tanstack/react-table";

interface TableBodyProps {
  table: any; // React Table instance
  columns: any[];
  isLoading?: boolean;
  error?: Error | null;
  onRefetch?: () => void;
  loadingText?: string;
  errorText?: string;
  emptyText?: string;
}

export default function TableBody({
  table,
  columns,
  isLoading = false,
  error = null,
  onRefetch,
  loadingText = "Loading...",
  errorText = "Error loading data",
  emptyText = "No data found.",
}: TableBodyProps) {
  return (
    <tbody className="bg-white divide-y divide-gray-200">
      {isLoading ? (
        <tr>
          <td
            colSpan={columns.length}
            className="px-6 py-8 text-center text-gray-500"
          >
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              {loadingText}
            </div>
          </td>
        </tr>
      ) : error ? (
        <tr>
          <td
            colSpan={columns.length}
            className="px-6 py-8 text-center text-red-500"
          >
            <div className="flex flex-col items-center gap-2">
              <span>
                {errorText}:{" "}
                {error instanceof Error
                  ? error.message
                  : "Unknown error"}
              </span>
              {onRefetch && (
                <button
                  onClick={onRefetch}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Retry
                </button>
              )}
            </div>
          </td>
        </tr>
      ) : table.getRowModel().rows?.length ? (
        table.getRowModel().rows.map((row: any) => (
          <tr key={row.id} className="hover:bg-gray-50">
            {row.getVisibleCells().map((cell: any) => (
              <td
                key={cell.id}
                className="px-6 py-4 text-sm text-gray-900"
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
            {emptyText}
          </td>
        </tr>
      )}
    </tbody>
  );
}
