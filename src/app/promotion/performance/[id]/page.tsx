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
import PerformanceHeader from "@/components/performance/PerformanceHeader";
import { formatCurrency } from "@/helper/common";
import DateRange from "@/components/ui/date-range";
import { usePromotionData } from "@/hooks/usePromotionData";
import { convertToGMTDate } from "@/lib/date-time.utils";
import { GMT_OFFSET } from "@/constants/constants";

export default function Page() {
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
    dailyStats: Array<{
      date: string;
      bonusIssued: number;
      bonusRedeemed: number;
      redemptionRate: number;
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
  } = usePromotionData<PerformanceData>(params.id as string, {
    promotionApiUrl: `/api/promotions/${params.id}`,
    dataApiUrl: `/api/promotions/${params.id}/performance`,
  });

  if (loading && !promotion && !performanceData) {
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

  return (
    <div className="h-full bg-gray-50 flex flex-col">
      {promotion && <PerformanceHeader
        title="Performance Details"
        backTitle="Back to All Promotions"
        promotion={promotion}
        onBack={() => router.push("/promotion")}
      />}

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
              minDate={convertToGMTDate(promotion?.startDate ?? "", GMT_OFFSET)}
              maxDate={convertToGMTDate(promotion?.endDate ?? "", GMT_OFFSET)}
            />

          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="text-lg text-gray-600">Loading data...</div>
          </div>
        )}

        {!loading && performanceData && (
          <>
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
                clickable={performanceData.uniquePlayers > 0}
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
            {/* Handle later */}
            {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RedemptionTrendChart data={performanceData.dailyStats} />
              <DailyBonusChart data={performanceData.dailyStats} />
            </div> */}
          </>
        )}
      </div>
    </div>
  );
}
