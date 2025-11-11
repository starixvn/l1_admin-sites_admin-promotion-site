"use client";

import MultiSelect from "@/components/ui/multi-select";
import { MultiSelectOption } from "@/types/global";
import { useMaxDisplayItems } from "@/hooks/useMaxDisplayItems";

interface GameMultiSelectProps {
  gameOptions: MultiSelectOption[];
  selectedGames: string[];
  onSelectionChange: (selectedGames: string[]) => void;
  placeholder?: string;
  className?: string;
}

export default function GameMultiSelect({
  gameOptions,
  selectedGames,
  onSelectionChange,
  placeholder = "Select currencies...",
  className = "",
}: GameMultiSelectProps) {
  const { containerRef, maxDisplayItems } = useMaxDisplayItems({
    selectedValues: selectedGames,
    options: gameOptions,
  });

  return (
    <div ref={containerRef} className={className}>
      <MultiSelect
        options={gameOptions}
        selectedValues={selectedGames}
        onSelectionChange={onSelectionChange}
        placeholder={placeholder}
        className=""
        searchPlaceholder="Search games..."
        selectAllText="Select All"
        clearAllText="Clear all"
        selectedText="selected"
        noOptionsText="No games found"
        loadingText="Loading..."
        errorText="Error loading games"
        maxDisplayItems={maxDisplayItems}
        defaultSelectAll={true}
        searchable={true}
      />
    </div>
  );
}
