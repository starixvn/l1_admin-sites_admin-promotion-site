"use client";

import { useState, useRef, useEffect } from "react";
import PromotionDialog from "./create/PromotionDialog";
import { PROMOTION_STATUS_OPTIONS_LIST } from "@/constants/promotionStatusMap";
import { Operator } from "@/types/operator";

interface FilterProps {
  onFilterChange: (filters: FilterValues) => void;
  operatorOptions: Operator[];
  initialFilters: FilterValues;
}

interface FilterValues {
  status: string;
  operator: string[];
  promotionCode: string;
  pageIndex: number;
  pageSize: number;
}

export default function Filter({
  onFilterChange,
  operatorOptions,
  initialFilters,
}: FilterProps) {
  const [filters, setFilters] = useState<FilterValues>(initialFilters);
  const [operatorSearch, setOperatorSearch] = useState("");
  const [showOperatorDropdown, setShowOperatorDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLDivElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);

  // Update local filters when initialFilters change
  useEffect(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowOperatorDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (inputRef.current) {
      setIsOverflowing(
        inputRef.current.scrollWidth > inputRef.current.clientWidth
      );
    }
  }, [filters.operator]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange(filters);
  };

  const handleOperatorSelect = (operatorId: string) => {
    setFilters((prev) => {
      const newOperators = [...prev.operator];
      const index = newOperators.indexOf(operatorId);

      if (operatorId === "All") {
        return {
          ...prev,
          operator:
            newOperators.length === operatorOptions.length
              ? []
              : operatorOptions.map((op) => op.PartnerId),
        };
      }

      if (index === -1) {
        newOperators.push(operatorId);
      } else {
        newOperators.splice(index, 1);
      }
      return { ...prev, operator: newOperators };
    });
  };

  const getSelectedOperatorDisplay = () => {
    if (filters.operator.length === 0) {
      return "";
    }
    if (filters.operator.length === operatorOptions.length) {
      return "All";
    }
    if (isOverflowing) {
      return `${filters.operator.length} selected`;
    }

    return filters.operator
      .map((id) => operatorOptions.find((op) => op.PartnerId === id)?.Name)
      .filter(Boolean)
      .join(", ");
  };

  const filteredOperators = operatorOptions.filter(
    (op) =>
      op.Name && op.Name.toLowerCase().includes(operatorSearch.toLowerCase())
  );

  const handleInputChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    if (name === "operator") {
      const select = e.target as HTMLSelectElement;
      const selectedOptions = Array.from(select.selectedOptions).map(
        (option) => option.value
      );

      setFilters((prev) => ({
        ...prev,
        operator: selectedOptions,
      }));
    } else {
      setFilters((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Add a separate function to handle refresh after creating promotion
  const handleRefresh = () => {
    onFilterChange(filters);
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex items-end gap-4">
        {/* Status Filter */}
        <div className="flex flex-col min-w-[140px]">
          <label
            htmlFor="status-select"
            className="text-sm font-medium text-gray-700 mb-2"
          >
            Status
          </label>
          <div className="relative">
            <select
              id="status-select"
              name="status"
              value={filters.status}
              onChange={handleInputChange}
              className="w-full h-[38px] pl-3 pr-8 border border-gray-300 rounded-lg bg-white
              appearance-none focus:outline-none focus:border-black
              text-gray-700 cursor-pointer"
              aria-label="Status"
            >
              {PROMOTION_STATUS_OPTIONS_LIST.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                <path
                  d="M1.41 0.590088L6 5.17009L10.59 0.590088L12 2.00009L6 8.00009L0 2.00009L1.41 0.590088Z"
                  fill="#6B7280"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Operator Filter */}
        <div className="flex flex-col flex-1">
          <label
            htmlFor="operator-select"
            className="text-sm font-medium text-gray-700 mb-2"
          >
            Operator
          </label>
          <div className="relative" ref={dropdownRef}>
            <button
              id="operator-select"
              type="button"
              onClick={() => setShowOperatorDropdown(true)}
              className="w-full h-[38px] px-3 border border-gray-300 rounded-lg bg-white
              flex items-center justify-between cursor-pointer
              focus:outline-none focus:border-black"
              aria-label="Operator"
              aria-expanded={showOperatorDropdown}
              aria-haspopup="listbox"
            >
              <span className="text-gray-700">
                {getSelectedOperatorDisplay() || "Select Operator"}
              </span>
              <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                <path
                  d="M1.41 0.590088L6 5.17009L10.59 0.590088L12 2.00009L6 8.00009L0 2.00009L1.41 0.590088Z"
                  fill="#6B7280"
                />
              </svg>
            </button>

            {showOperatorDropdown && (
              <div
                role="listbox"
                className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-200 
                rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto"
              >
                <div className="py-1">
                  <div className="px-4 py-2">
                    <input
                      type="text"
                      value={operatorSearch}
                      onChange={(e) => setOperatorSearch(e.target.value)}
                      placeholder="Search operators..."
                      className="w-full px-2 py-1 border rounded"
                      aria-label="Search operators"
                    />
                  </div>

                  <div
                    role="option"
                    className="flex items-center px-4 py-2 cursor-pointer hover:bg-gray-100"
                    aria-selected={
                      filters.operator.length === operatorOptions.length
                    }
                    onClick={() => handleOperatorSelect("All")}
                  >
                    <input
                      type="checkbox"
                      checked={
                        filters.operator.length === operatorOptions.length
                      }
                      onChange={() => handleOperatorSelect("All")}
                      onClick={(e) => e.stopPropagation()}
                      className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out cursor-pointer"
                      aria-label="Select all operators"
                    />
                    <span className="ml-2">All</span>
                  </div>

                  {filteredOperators.map((option) => (
                    <div
                      key={option.PartnerId}
                      role="option"
                      className="flex items-center px-4 py-2 cursor-pointer hover:bg-gray-100"
                      aria-selected={filters.operator.includes(
                        option.PartnerId
                      )}
                      onClick={() => handleOperatorSelect(option.PartnerId)}
                    >
                      <input
                        type="checkbox"
                        checked={filters.operator.includes(option.PartnerId)}
                        onChange={() => handleOperatorSelect(option.PartnerId)}
                        onClick={(e) => e.stopPropagation()}
                        className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out cursor-pointer"
                        aria-label={`Select ${option.Name}`}
                      />
                      <span className="ml-2">{option.Name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Promotion Code Input */}
        <div className="flex flex-col flex-1">
          <label
            htmlFor="promotion-code"
            className="text-sm font-medium text-gray-700 mb-2"
          >
            Promotion Code
          </label>
          <input
            id="promotion-code"
            type="text"
            name="promotionCode"
            value={filters.promotionCode}
            onChange={handleInputChange}
            placeholder="Enter promotion code"
            className="w-full h-[38px] px-3 border border-gray-300 rounded-lg
            focus:outline-none focus:border-black
            placeholder-gray-400"
            aria-label="Promotion code"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            type="submit"
            onClick={(e) => handleSubmit(e)}
            className="h-[38px] px-6 bg-[#FF5B6B] text-white rounded-lg font-medium
            hover:bg-[#FF4559] transition-colors border border-transparent
            focus:outline-none focus:border-black cursor-pointer"
            aria-label="Search promotions"
          >
            Search
          </button>
          <button
            type="button"
            onClick={() => setOpenDialog(true)}
            className="h-[38px] px-4 bg-emerald-500 text-white rounded-lg font-medium
            hover:bg-emerald-600 transition-colors flex items-center gap-2
            border border-transparent focus:outline-none focus:border-black cursor-pointer"
            aria-label="Add new promotion"
          >
            <span aria-hidden="true">+</span>
            <span>Add New Promotion</span>
          </button>
        </div>
      </div>

      <PromotionDialog
        open={openDialog}
        onClose={(shouldRefresh = false) => {
          setOpenDialog(false);
          if (shouldRefresh) {
            handleRefresh();
          }
        }}
      />
    </div>
  );
}
