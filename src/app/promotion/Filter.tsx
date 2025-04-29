"use client";

import { useState, useRef, useEffect } from "react";

interface Operator {
  name: string;
  id: string;
}

interface FilterProps {
  onFilterChange: (filters: FilterValues) => void;
  operatorOptions: Operator[];
}

interface FilterValues {
  status: string;
  operator: string[];
  promotionCode: string;
}

export default function Filter({ onFilterChange, operatorOptions }: FilterProps) {
  const [filters, setFilters] = useState<FilterValues>({
    status: "All",
    operator: [],
    promotionCode: "",
  });

  const [operatorSearch, setOperatorSearch] = useState("");
  const [showOperatorDropdown, setShowOperatorDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLDivElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    if (operatorOptions.length > 0) {
      setFilters(prev => ({
        ...prev,
        operator: operatorOptions.map(op => op.id)
      }));
    }
  }, [operatorOptions]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowOperatorDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (inputRef.current) {
      const isTextOverflowing = inputRef.current.scrollWidth > inputRef.current.clientWidth;
      setIsOverflowing(isTextOverflowing);
    }
  }, [filters.operator]);

  const getSelectedOperatorDisplay = () => {
    if (filters.operator.length === 0) return "";
    if (filters.operator.length === operatorOptions.length) return "All";
    if (isOverflowing) return `${filters.operator.length} selected`;
    
    return filters.operator
      .map(id => operatorOptions.find(op => op.id === id)?.name)
      .filter(Boolean)
      .join(", ");
  };

  const statusOptions = ["All", "Running", "Completed", "Upcoming"];

  const filteredOperators = operatorOptions.filter(op => 
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
    if (name === 'operator') {
      const select = e.target as HTMLSelectElement;
      const selectedOptions = Array.from(select.selectedOptions).map(option => option.value);
      
      setFilters(prev => ({
        ...prev,
        operator: selectedOptions
      }));
    } else {
      setFilters(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleOperatorSelect = (operatorId: string) => {
    setFilters(prev => {
      const newOperators = [...prev.operator];
      const index = newOperators.indexOf(operatorId);
      
      if (operatorId === 'All') {
        return {
          ...prev,
          operator: newOperators.length === operatorOptions.length ? [] : operatorOptions.map(op => op.id)
        };
      }

      if (index === -1) {
        newOperators.push(operatorId);
      } else {
        newOperators.splice(index, 1);
      }
      return {
        ...prev,
        operator: newOperators
      };
    });
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
          className="border border-gray-400 rounded px-3 pr-8 h-10 w-40 text-base font-semibold appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEuNDEgMC41OTAwODhMNiA1LjE3MDA5TDEwLjU5IDAuNTkwMDg4TDEyIDIuMDAwMDlMNiA4LjAwMDA5TDAgMi4wMDAwOUwxLjQxIDAuNTkwMDg4WiIgZmlsbD0iIzMyMzIzMiIvPjwvc3ZnPg==')] bg-no-repeat bg-[right_10px_center] bg-[length:12px_8px]"
        >
          {statusOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col relative" ref={dropdownRef}>
        <label className="text-base font-semibold mb-1">Operator</label>
        <div 
          className="border border-gray-400 rounded w-40 bg-white cursor-pointer relative"
          onClick={() => setShowOperatorDropdown(true)}
        >
          <div
            ref={inputRef}
            className="w-full h-10 px-3 pr-8 flex items-center text-base font-semibold outline-none truncate"
          >
            {showOperatorDropdown ? (
              <input
                type="text"
                value={operatorSearch}
                onChange={(e) => setOperatorSearch(e.target.value)}
                className="w-full outline-none font-semibold"
                placeholder="search"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span className="text-gray-700 font-semibold">
                {getSelectedOperatorDisplay() || "Select operator"}
              </span>
            )}
          </div>
          <div 
            className={`absolute right-2 top-1/2 -translate-y-1/2 transition-transform duration-200 ${showOperatorDropdown ? 'rotate-180' : ''}`}
          >
            <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1.41 0.590088L6 5.17009L10.59 0.590088L12 2.00009L6 8.00009L0 2.00009L1.41 0.590088Z" fill="#323232"/>
            </svg>
          </div>
          {showOperatorDropdown && (
            <div className="absolute top-full left-0 w-full bg-white border border-gray-300 rounded-b shadow-lg z-10 max-h-60 overflow-y-auto mt-1">
              <div className="py-1">
                <label className="flex items-center px-4 py-2 cursor-pointer hover:bg-gray-100">
                  <input
                    type="checkbox"
                    checked={filters.operator.length === operatorOptions.length}
                    onChange={() => handleOperatorSelect('All')}
                    className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                  />
                  <span className="ml-2">All</span>
                </label>
                {filteredOperators.map((option) => (
                  <label key={option.id} className="flex items-center px-4 py-2 cursor-pointer hover:bg-gray-100">
                    <input
                      type="checkbox"
                      checked={filters.operator.includes(option.id)}
                      onChange={() => handleOperatorSelect(option.id)}
                      className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                    />
                    <span className="ml-2">{option.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
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
