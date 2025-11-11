"use client";

import { useRef, useEffect, useState } from "react";
import { MultiSelectOption } from "@/types/global";

interface UseMaxDisplayItemsParams {
  selectedValues: string[];
  options: MultiSelectOption[];
  defaultMaxItems?: number;
}

export function useMaxDisplayItems({
  selectedValues,
  options,
  defaultMaxItems = 4,
}: UseMaxDisplayItemsParams) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [maxDisplayItems, setMaxDisplayItems] = useState(defaultMaxItems);

  useEffect(() => {
    const calculateMaxDisplayItems = () => {
      if (!containerRef.current) {
        return;
      };

      const containerWidth = containerRef.current.offsetWidth;
      // Reserve space for: padding (16px), chevron button (32px), gap between items (4px each)
      const reservedSpace = 16 + 32 + 8; // padding + button + some margin
      const availableWidth = containerWidth - reservedSpace;

      const gapWidth = 4; // px
      
      // Ensure selectedValues is an array
      const safeSelectedValues = Array.isArray(selectedValues) ? selectedValues : [];
      
      // Calculate how many items can fit
      let itemsThatFit = 0;
      let totalWidth = 0;
      
      // Try to fit items one by one
      for (const selectedValue of safeSelectedValues) {
        const option = options?.find(
          (opt) => opt.value === selectedValue
        );
        // Estimate width based on label length (roughly 8px per character + padding)
        const labelLength = option?.label?.length || selectedValue.length;
        const itemWidth = Math.max(60, labelLength * 8 + 40) + gapWidth; // min 60px, ~8px per char + padding
        
        if (totalWidth + itemWidth <= availableWidth) {
          totalWidth += itemWidth;
          itemsThatFit++;
        } else {
          break;
        }
      }

      // If we can fit all items, show all. Otherwise, show what fits and reserve space for "+X more"
      if (itemsThatFit < safeSelectedValues.length) {
        // Reserve space for "+X more" badge (approximately 80px)
        const moreBadgeWidth = 80;
        const adjustedAvailableWidth = availableWidth - moreBadgeWidth;
        
        itemsThatFit = 0;
        totalWidth = 0;
        for (const selectedValue of safeSelectedValues) {
          const option = options?.find(
            (opt) => opt.value === selectedValue
          );
          const labelLength = option?.label?.length || selectedValue.length;
          const itemWidth = Math.max(60, labelLength * 8 + 40) + gapWidth;
          
          if (totalWidth + itemWidth <= adjustedAvailableWidth) {
            totalWidth += itemWidth;
            itemsThatFit++;
          } else {
            break;
          }
        }
      }

      setMaxDisplayItems(Math.max(1, itemsThatFit || defaultMaxItems));
    };

    calculateMaxDisplayItems();

    const resizeObserver = new ResizeObserver(() => {
      calculateMaxDisplayItems();
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [selectedValues, options, defaultMaxItems]);

  return { containerRef, maxDisplayItems };
}

