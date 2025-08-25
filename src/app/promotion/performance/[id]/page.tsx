"use client";

import { useParams, useRouter } from "next/navigation";
import {
  Gift,
  Wallet,
  Percent,
  Coins,
  Users,
  User,
  BarChart3,
} from "lucide-react";
import KPICard from "@/components/performance/KPICard";
import RedemptionTrendChart from "@/components/performance/RedemptionTrendChart";
import DailyBonusChart from "@/components/performance/DailyBonusChart";
import PerformanceHeader from "@/components/performance/PerformanceHeader";
import { formatCurrency } from "@/helper/common";
import DateRange from "@/components/ui/date-range";
import { usePromotionData } from "@/hooks/usePromotionData";
import { convertToGMTDate } from "@/lib/date-time.utils";

export default function PerformancePage() {
  const params = useParams();
  const router = useRouter();

  interface PerformanceData {
    bonusIssued: number;
    bonusRedeemed: number;
    redemptionRate: number;
    totalTurnover: number;
    uniquePlayers: number;
    avgBonusPerPlayer: number;
    avgTurnoverPerPlayer: number;
    redemptionTrend: Array<{
      date: string;
      rate: number;
    }>;
    dailyBonus: Array<{
      date: string;
      issued: number;
      redeemed: number;
    }>;
  }

  const {
    promotion,
    data: performanceData,
    startDate,
    endDate,
    loading,
    error,
    setStartDate,
    setEndDate,
    refetch,
  } = usePromotionData<PerformanceData>(params.id as string, {
    gmtOffset: 8,
    promotionApiUrl: `/api/promotions/${params.id}`,
    dataApiUrl: `/api/promotions/${params.id}/performance`,
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg text-red-500">Error: {error}</div>
      </div>
    );
  }

  if (!promotion || !performanceData) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg text-red-500">Promotion not found</div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50 flex flex-col">
      <PerformanceHeader
        title="Performance Details"
        backTitle="Back to All Promotions"
        promotion={promotion}
        onBack={() => router.push("/promotion")}
      />

      <div className="w-full px-6 pb-4 flex-shrink-0">
        <div className="bg-white rounded-lg shadow-sm p-3">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">
              Date Range:
            </span>
            <span className="text-sm text-gray-600">Promotion Period</span>
            <DateRange
              startDate={startDate}
              endDate={endDate}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
              minDate={convertToGMTDate(promotion.startDate)}
              maxDate={convertToGMTDate(promotion.endDate)}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KPICard
            title="Bonus Issued"
            value={formatCurrency(performanceData.bonusIssued)}
            icon={Gift}
            iconColor="text-blue-500"
          />
          <KPICard
            title="Bonus Redeemed"
            value={formatCurrency(performanceData.bonusRedeemed)}
            icon={Wallet}
            iconColor="text-green-500"
          />
          <KPICard
            title="Redemption Rate"
            value={`${performanceData.redemptionRate}%`}
            icon={Percent}
            iconColor="text-purple-500"
          />
          <KPICard
            title="Total Turnover"
            value={formatCurrency(performanceData.totalTurnover)}
            icon={Coins}
            iconColor="text-yellow-500"
          />
          <KPICard
            title="Unique Players"
            value={performanceData.uniquePlayers.toString()}
            icon={Users}
            iconColor="text-indigo-500"
            clickable={true}
            onClick={() =>
              router.push(`/promotion/performance/${params.id}/players`)
            }
          />
          <KPICard
            title="Avg Bonus per Player"
            value={formatCurrency(performanceData.avgBonusPerPlayer)}
            icon={User}
            iconColor="text-pink-500"
          />
          <KPICard
            title="Avg Turnover per Player"
            value={formatCurrency(performanceData.avgTurnoverPerPlayer)}
            icon={BarChart3}
            iconColor="text-orange-500"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RedemptionTrendChart data={performanceData.redemptionTrend} />
          <DailyBonusChart data={performanceData.dailyBonus} />
        </div>
      </div>
    </div>
  );
}
