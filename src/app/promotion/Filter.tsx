"use client";

import { useState, useRef, useEffect } from "react";
import PromotionDialog from "./create/PromotionDialog";
import { PROMOTION_STATUS_OPTIONS } from "@/constants/promotionStatusMap";

interface Operator {
  name: string;
  id: string;
}

interface FilterProps {
  onFilterChange: (filters: FilterValues) => void;
  operatorOptions: Operator[];
  initialFilters: FilterValues;
}

interface FilterValues {
  status: string;
  operator: string[];
  promotionCode: string;
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

  useEffect(() => {
    if (operatorOptions.length > 0) {
      setFilters((prev) => ({
        ...prev,
        operator: operatorOptions.map((op) => op.id),
      }));
    }
  }, [operatorOptions]);

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
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (inputRef.current) {
      const isTextOverflowing =
        inputRef.current.scrollWidth > inputRef.current.clientWidth;
      setIsOverflowing(isTextOverflowing);
    }
  }, [filters.operator]);

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
      .map((id) => operatorOptions.find((op) => op.id === id)?.name)
      .filter(Boolean)
      .join(", ");
  };

  const filteredOperators = operatorOptions.filter((op) =>
    op.name.toLowerCase().includes(operatorSearch.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange(filters);
  };

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
              : operatorOptions.map((op) => op.id),
        };
      }

      if (index === -1) {
        newOperators.push(operatorId);
      } else {
        newOperators.splice(index, 1);
      }
      return {
        ...prev,
        operator: newOperators,
      };
    });
  };

  const triggerSubmit = () => {
    onFilterChange(filters);
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex items-end gap-4">
        {/* Status Filter */}
        <div className="flex flex-col min-w-[140px]">
          <label className="text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <div className="relative">
            <select
              name="status"
              value={filters.status}
              onChange={handleInputChange}
              className="w-full h-[38px] pl-3 pr-8 border border-gray-300 rounded-lg bg-white
              appearance-none focus:outline-none focus:border-black
              text-gray-700 cursor-pointer"
            >
              {PROMOTION_STATUS_OPTIONS.map((option) => (
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
          <label className="text-sm font-medium text-gray-700 mb-2">
            Operator
          </label>
          <div className="relative" ref={dropdownRef}>
            <div
              onClick={() => setShowOperatorDropdown(true)}
              className="w-full h-[38px] px-3 border border-gray-300 rounded-lg bg-white
              flex items-center justify-between cursor-pointer
              focus:outline-none focus:border-black"
            >
              <span className="text-gray-700">
                {getSelectedOperatorDisplay() || "All"}
              </span>
              <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                <path
                  d="M1.41 0.590088L6 5.17009L10.59 0.590088L12 2.00009L6 8.00009L0 2.00009L1.41 0.590088Z"
                  fill="#6B7280"
                />
              </svg>
            </div>
            {showOperatorDropdown && (
              <div
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
                    />
                  </div>

                  <label className="flex items-center px-4 py-2 cursor-pointer hover:bg-gray-100">
                    <input
                      type="checkbox"
                      checked={
                        filters.operator.length === operatorOptions.length
                      }
                      onChange={() => handleOperatorSelect("All")}
                      className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out cursor-pointer"
                    />
                    <span className="ml-2">All</span>
                  </label>
                  {filteredOperators.map((option) => (
                    <label
                      key={option.id}
                      className="flex items-center px-4 py-2 cursor-pointer hover:bg-gray-100"
                    >
                      <input
                        type="checkbox"
                        checked={filters.operator.includes(option.id)}
                        onChange={() => handleOperatorSelect(option.id)}
                        className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out cursor-pointer"
                      />
                      <span className="ml-2">{option.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Promotion Code Input */}
        <div className="flex flex-col flex-1">
          <label className="text-sm font-medium text-gray-700 mb-2">
            Promotion Code
          </label>
          <input
            type="text"
            name="promotionCode"
            value={filters.promotionCode}
            onChange={handleInputChange}
            placeholder="Enter promotion code"
            className="w-full h-[38px] px-3 border border-gray-300 rounded-lg
            focus:outline-none focus:border-black
            placeholder-gray-400"
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
          >
            Search
          </button>
          <button
            type="button"
            onClick={() => setOpenDialog(true)}
            className="h-[38px] px-4 bg-emerald-500 text-white rounded-lg font-medium
            hover:bg-emerald-600 transition-colors flex items-center gap-2
            border border-transparent focus:outline-none focus:border-black cursor-pointer"
          >
            <span>+</span>
            Add New Promotion
          </button>
        </div>
      </div>

      <PromotionDialog
        open={openDialog}
        onClose={(shouldRefresh = false) => {
          setOpenDialog(false);
          if (shouldRefresh) {
            triggerSubmit();
          }
        }}
      />
    </div>
  );
}
