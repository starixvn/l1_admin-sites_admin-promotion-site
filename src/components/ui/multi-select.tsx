"use client";

import { useState, useRef, useEffect } from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { MultiSelectOption } from "@/types/global";

interface MultiSelectProps {
  options: MultiSelectOption[];
  selectedValues: string[];
  onSelectionChange: (selectedValues: string[]) => void;
  placeholder?: string;
  className?: string;
  searchPlaceholder?: string;
  selectAllText?: string;
  clearAllText?: string;
  selectedText?: string;
  noOptionsText?: string;
  loadingText?: string;
  errorText?: string;
  isLoading?: boolean;
  error?: boolean;
  maxDisplayItems?: number;
  defaultSelectAll?: boolean;
  searchable?: boolean;
  disabled?: boolean;
}

export default function MultiSelect({
  options,
  selectedValues,
  onSelectionChange,
  placeholder = "Select options...",
  className = "",
  searchPlaceholder = "Search options...",
  selectAllText = "Select All",
  clearAllText = "Clear all",
  selectedText = "selected",
  noOptionsText = "No options found",
  loadingText = "Loading...",
  errorText = "Error loading options",
  isLoading = false,
  error = false,
  maxDisplayItems = 4,
  defaultSelectAll = false,
  searchable = true,
  disabled = false,
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const hasInitialized = useRef(false);

  // Set default to select all options when options are loaded and defaultSelectAll is true
  useEffect(() => {
    if (
      options &&
      options.length > 0 &&
      defaultSelectAll &&
      selectedValues.length === 0 &&
      !hasInitialized.current
    ) {
      const allValues = options.map((option) => option.value);
      onSelectionChange(allValues);
      hasInitialized.current = true;
    }
  }, [options, selectedValues.length, defaultSelectAll]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter options based on search term
  const filteredOptions =
    options?.filter((option) => {
      return (
        searchTerm === "" ||
        option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        option.value.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }) || [];

  const handleOptionToggle = (value: string) => {
    const newSelection = selectedValues.includes(value)
      ? selectedValues.filter((selectedValue) => selectedValue !== value)
      : [...selectedValues, value];

    onSelectionChange(newSelection);
  };

  const handleSelectAll = () => {
    // Check if all filtered options are currently selected
    const allFilteredSelected = filteredOptions.every((option) =>
      selectedValues.includes(option.value)
    );

    if (allFilteredSelected && filteredOptions.length > 0) {
      // If all filtered options are selected, deselect all
      onSelectionChange([]);
    } else {
      // Select all filtered options (merge with existing selections)
      const filteredValues = filteredOptions.map((option) => option.value);
      const newSelection = [...new Set([...selectedValues, ...filteredValues])];
      onSelectionChange(newSelection);
    }
  };

  const removeOption = (value: string) => {
    const newSelection = selectedValues.filter(
      (selectedValue) => selectedValue !== value
    );
    onSelectionChange(newSelection);
  };

  const clearAll = () => {
    onSelectionChange([]);
  };

  if (error) {
    return (
      <div
        className={`border border-red-300 rounded-lg p-3 text-red-600 ${className}`}
      >
        {errorText}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Selected options display */}
      <div
        className={`min-h-[42px] border border-gray-300 rounded-lg bg-white p-2 ${
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
        }`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <div className="flex flex-wrap gap-1">
          {selectedValues.length > 0 ? (
            <>
              {selectedValues.slice(0, maxDisplayItems).map((selectedValue) => {
                const option = options?.find(
                  (opt) => opt.value === selectedValue
                );
                return (
                  <span
                    key={selectedValue}
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-800 text-sm rounded-md"
                  >
                    {option?.label || selectedValue}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeOption(selectedValue);
                      }}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                      disabled={disabled}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                );
              })}

              {selectedValues.length > maxDisplayItems && (
                <span className="inline-flex items-center px-2 py-0.5 bg-gray-100 text-gray-600 text-sm rounded-md">
                  +{selectedValues.length - maxDisplayItems} more
                </span>
              )}
            </>
          ) : (
            <span className="text-gray-500 text-sm">{placeholder}</span>
          )}
        </div>
      </div>

      {/* Dropdown button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`absolute right-1 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 ${
          disabled ? "opacity-50 cursor-not-allowed" : ""
        }`}
        disabled={disabled}
      >
        <ChevronDown
          className={`w-4 h-4 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown menu */}
      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-hidden">
          {/* Search input */}
          {searchable && (
            <div className="p-2 border-b border-gray-200">
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              />
            </div>
          )}

          {/* Select All option */}
          <div className="border-b border-gray-200">
            <div
              className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
              onClick={handleSelectAll}
            >
              <div className="flex items-center h-4 w-4 border border-gray-300 rounded mr-3">
                {filteredOptions.every((option) =>
                  selectedValues.includes(option.value)
                ) &&
                  filteredOptions.length > 0 && (
                    <Check className="h-3 w-3 text-blue-600" />
                  )}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">
                  {selectAllText}
                </div>
              </div>
            </div>
          </div>

          {/* Options list */}
          <div className="max-h-48 overflow-y-auto">
            {isLoading ? (
              <div className="p-3 text-center text-gray-500">{loadingText}</div>
            ) : filteredOptions.length === 0 ? (
              <div className="p-3 text-center text-gray-500">
                {noOptionsText}
              </div>
            ) : (
              filteredOptions.map((option) => (
                <div
                  key={option.value}
                  className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleOptionToggle(option.value)}
                >
                  <div className="flex items-center h-4 w-4 border border-gray-300 rounded mr-3">
                    {selectedValues.includes(option.value) && (
                      <Check className="h-3 w-3 text-blue-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">
                      {option.label}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-2 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-between text-xs text-gray-500">
              <span>
                {selectedValues.length} {selectedText}
              </span>
              <button
                type="button"
                onClick={clearAll}
                className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                {clearAllText}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
