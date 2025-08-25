import { useState, useEffect } from 'react';
import { Promotion } from '@/types/promotion';
import { convertToGMTDate } from '@/lib/date-time.utils';

// Hook Options
interface UsePromotionDataOptions<T = any> {
  gmtOffset?: number;
  promotionApiUrl?: string;
  dataApiUrl?: string;
  defaultData?: T;
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
  refetch: () => void;
}

export function usePromotionData<T = any>(
  promotionId: string, 
  options: UsePromotionDataOptions<T> = {}
): UsePromotionDataReturn<T> {
  const { 
    gmtOffset = 8, 
    promotionApiUrl = `/api/promotions/${promotionId}`,
    dataApiUrl,
    defaultData = null
  } = options;
  
  const [promotion, setPromotion] = useState<Promotion | null>(null);
  const [data, setData] = useState<T | null>(defaultData);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch promotion details
      const promotionResponse = await fetch(promotionApiUrl);
      if (!promotionResponse.ok) {
        throw new Error(`Failed to fetch promotion: ${promotionResponse.status}`);
      }
      const promotionData = await promotionResponse.json();
      setPromotion(promotionData);
      
      // Format dates for GMT offset
      const formattedStartDate = convertToGMTDate(promotionData.startDate, gmtOffset);
      const formattedEndDate = convertToGMTDate(promotionData.endDate, gmtOffset);
      
      setStartDate(formattedStartDate);
      setEndDate(formattedEndDate);

      // Fetch data based on type
      const dataResponse = await fetch(dataApiUrl || "");
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
  };

  useEffect(() => {
    if (promotionId) {
      fetchData();
    }
  }, [promotionId, gmtOffset, promotionApiUrl, dataApiUrl]);

  const refetch = () => {
    fetchData();
  };

  return {
    promotion,
    data,
    startDate,
    endDate,
    loading,
    error,
    setStartDate,
    setEndDate,
    refetch
  };
}
