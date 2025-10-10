"use client";

import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { flexRender } from "@tanstack/react-table";

interface TableHeaderProps {
  table: any; // React Table instance
}

export default function TableHeader({ table }: TableHeaderProps) {
  return (
    <thead className="bg-gray-50 border-b border-gray-200">
      {table.getHeaderGroups().map((headerGroup: any) => (
        <tr key={headerGroup.id}>
          {headerGroup.headers.map((header: any) => (
            <th
              key={header.id}
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
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
                    <div className="flex items-center">
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
  );
}
