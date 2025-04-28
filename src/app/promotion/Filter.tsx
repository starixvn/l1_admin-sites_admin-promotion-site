"use client";

import { useState } from "react";

interface FilterProps {
  onFilterChange: (filters: FilterValues) => void;
}

interface FilterValues {
  status: string;
  operator: string;
  promotionCode: string;
}

export default function Filter({ onFilterChange }: FilterProps) {
  const [filters, setFilters] = useState<FilterValues>({
    status: "All",
    operator: "All",
    promotionCode: "",
  });

  const statusOptions = ["All", "Running", "Completed", "Upcoming"];
  const operatorOptions = ["All"];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange(filters);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-end gap-4 p-4 border rounded-lg bg-white mb-6 shadow-sm"
      style={{ width: "max-content" }}
    >
      <div className="flex flex-col">
        <label className="text-base font-semibold mb-1">Status</label>
        <select
          name="status"
          value={filters.status}
          onChange={handleInputChange}
          className="border border-gray-400 rounded px-3 py-2 w-40 h-10 font-semibold text-base"
        >
          {statusOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col">
        <label className="text-base font-semibold mb-1">Operator</label>
        <select
          name="operator"
          value={filters.operator}
          onChange={handleInputChange}
          className="border border-gray-400 rounded px-3 py-2 w-40 h-10 font-semibold text-base"
        >
          {operatorOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col">
        <label className="text-base font-semibold mb-1">Promotion Code</label>
        <input
          type="text"
          name="promotionCode"
          value={filters.promotionCode}
          onChange={handleInputChange}
          className="border border-gray-400 rounded px-3 py-2 w-80 h-10 font-semibold text-base"
          placeholder="Enter code"
        />
      </div>

      <div className="flex flex-col justify-end">
        <button
          type="submit"
          className="bg-red-400 text-white font-semibold px-6 h-10 rounded shadow hover:bg-red-500 transition"
          style={{ minWidth: 120 }}
        >
          Submit
        </button>
      </div>
      <div className="flex flex-col justify-end">
        <button
          type="button"
          className="bg-green-400 text-black font-semibold px-6 h-10 rounded shadow hover:bg-green-500 transition"
          style={{ minWidth: 180 }}
        >
          Add New Promotion
        </button>
      </div>
    </form>
  );
}
