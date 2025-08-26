import { useState, useEffect, useCallback } from 'react';
import { Promotion } from '@/types/promotion';
import { convertToGMTDate, convertToUTCForAPI } from '@/lib/date-time.utils';
import { GMT_OFFSET } from '@/constants/constants';

// Hook Options
interface UsePromotionDataOptions<T = any> {
  promotionApiUrl?: string;
  dataApiUrl?: string;
  defaultData?: T;
  status?: string;
  player?: string;
  pageIndex?: number;
  pageSize?: number;
}

// Return Types
interface UsePromotionDataReturn<T = any> {
  promotion: Promotion | null;
  data: T | null;
  startDate: string;
  endDate: string;
  loading: boolean;
  error: string | null;
  setStartDate: (date: string) => void;
  setEndDate: (date: string) => void;
}

export function usePromotionData<T = any>(
  promotionId: string, 
  options: UsePromotionDataOptions<T> = {}
): UsePromotionDataReturn<T> {
  const { 
    promotionApiUrl = `/api/promotions/${promotionId}`,
    dataApiUrl,
    defaultData = null,
    status = "",
    player = "",
    pageIndex = 1,
    pageSize = 10
  } = options;
  
  const [promotion, setPromotion] = useState<Promotion | null>(null);
  const [data, setData] = useState<T | null>(defaultData);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPromotion = useCallback(async () => {
    try {
      const promotionResponse = await fetch(promotionApiUrl);
      if (!promotionResponse.ok) {
        throw new Error(`Failed to fetch promotion: ${promotionResponse.status}`);
      }
      const promotionData = await promotionResponse.json();
      setPromotion(promotionData);
      
      const formattedStartDate = convertToGMTDate(promotionData.startDate, GMT_OFFSET);
      const formattedEndDate = convertToGMTDate(promotionData.endDate, GMT_OFFSET);
      
      setStartDate(formattedStartDate);
      setEndDate(formattedEndDate);
    } catch (error) {
      console.error("Error fetching promotion:", error);
      setError(error instanceof Error ? error.message : "Failed to fetch promotion");
    }
  }, [promotionApiUrl]);

  // Fetch data based on current date range
  const fetchData = useCallback(async (currentStartDate?: string, currentEndDate?: string, currentStatus?: string, currentPlayer?: string, currentPageIndex?: number, currentPageSize?: number) => {
    if (!dataApiUrl) {
      return;
    }
    
    try {
      const url = new URL(dataApiUrl, window.location.origin);
      
      const params = {
        startDate: currentStartDate ? convertToUTCForAPI(currentStartDate) : undefined,
        endDate: currentEndDate ? convertToUTCForAPI(currentEndDate) : undefined,
        status: currentStatus,
        player: currentPlayer,
        pageIndex: currentPageIndex,
        pageSize: currentPageSize,
      };

      Object.entries(params)
        .filter(([_, value]) => value !== undefined && value !== null && value !== '')
        .forEach(([key, value]) => {
          url.searchParams.set(key, String(value));
        });

      const dataResponse = await fetch(url.toString());
      if (!dataResponse.ok) {
        throw new Error(`Failed to fetch data: ${dataResponse.status}`);
      }
      const fetchedData = await dataResponse.json();
      setData(fetchedData);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError(error instanceof Error ? error.message : "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  }, [dataApiUrl, pageIndex, pageSize]);

  useEffect(() => {
    fetchPromotion();
  }, []);

  useEffect(() => {
    if (startDate && endDate) {
      fetchData(startDate, endDate, status, player, pageIndex, pageSize);
    }
  }, [startDate, endDate, status, player, pageIndex, pageSize]);

  return {
    promotion,
    data,
    startDate,
    endDate,
    loading,
    error,
    setStartDate,
    setEndDate,
  };
}
