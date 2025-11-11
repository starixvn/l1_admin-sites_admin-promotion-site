"use client";

import MultiSelect from "@/components/ui/multi-select";
import { MultiSelectOption } from "@/types/global";
import { useMaxDisplayItems } from "@/hooks/useMaxDisplayItems";

interface CurrencyMultiSelectProps {
  currencyOptions: MultiSelectOption[];
  isLoading: boolean;
  error: boolean;
  selectedCurrencies: string[];
  onSelectionChange: (selectedCodes: string[]) => void;
  placeholder?: string;
  className?: string;
}

export default function CurrencyMultiSelect({
  currencyOptions,
  isLoading,
  error,
  selectedCurrencies,
  onSelectionChange,
  placeholder = "Select currencies...",
  className = "",
}: CurrencyMultiSelectProps) {
  const { containerRef, maxDisplayItems } = useMaxDisplayItems({
    selectedValues: Array.isArray(selectedCurrencies) ? selectedCurrencies : [],
    options: currencyOptions || [],
  });

  return (
    <div ref={containerRef}>
      <MultiSelect
        options={currencyOptions}
        selectedValues={selectedCurrencies}
        onSelectionChange={onSelectionChange}
        placeholder={placeholder}
        className={className}
        searchPlaceholder="Search currencies..."
        selectAllText="Select All"
        clearAllText="Clear all"
        selectedText="selected"
        noOptionsText="No currencies found"
        loadingText="Loading..."
        errorText="Error loading currencies"
        isLoading={isLoading}
        error={!!error}
        maxDisplayItems={maxDisplayItems}
        defaultSelectAll={true}
        searchable={true}
      />
    </div>
  );
}
