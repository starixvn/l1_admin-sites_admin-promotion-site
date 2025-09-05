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
import {
  useQueryPromotion,
  useQueryPromotionPerformance,
} from "@/hooks/useQueryPromotionPerformance";
import { toGMTString } from "@/lib/date-time.utils";
import { GMT_OFFSET, PROMOTION_FILTERS_KEY } from "@/constants/constants";

export default function Page() {
  const params = useParams();
  const router = useRouter();

  const {
    data: promotion,
    error: promotionError,
    isPending: promotionIsPending,
    isError: promotionIsError,
  } = useQueryPromotion(params.id as string);
  const {
    data: performanceData,
    error: performanceError,
    isPending: performanceIsPending,
    isError: performanceIsError,
  } = useQueryPromotionPerformance(params.id as string);

  if (promotionIsPending) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (promotionIsError || performanceIsError) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg text-red-500">
          Error: {promotionError?.message || performanceError?.message}
        </div>
      </div>
    );
  }
  const buildQueryParams = (filters: any) => {
    const params = new URLSearchParams();
    
    if (filters.status !== "All") {
      params.set("status", filters.status);
    }
    if (filters.operator?.length > 0) {
      params.set("operator", filters.operator.join(","));
    }
    if (filters.promotionCode) {
      params.set("promotionCode", filters.promotionCode);
    }
    if (filters.pageIndex !== 1) {
      params.set("pageIndex", filters.pageIndex.toString());
    }
    if (filters.pageSize !== 10) {
      params.set("pageSize", filters.pageSize.toString());
    }
    
    return params;
  };

  const handleBack = () => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(PROMOTION_FILTERS_KEY);
      if (stored) {
        const filters = JSON.parse(stored);
        const params = buildQueryParams(filters);
        const queryString = params.toString();
        const url = queryString ? `/promotion?${queryString}` : "/promotion";
        router.push(url);
        return;
      }
    }
    router.push("/promotion");
  };

  return (
    <div className="h-full bg-gray-50 flex flex-col">
      {promotion && (
        <PerformanceHeader
          title="Performance Details"
          backTitle="Back to All Promotions"
          promotion={promotion}
          onBack={() => handleBack()}
        />
      )}

      <div className="w-full px-6 pb-4 flex-shrink-0">
        <div className="bg-white rounded-lg shadow-sm p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Promotion Period:</span>
              {promotion && (
                <span className="text-base font-medium text-gray-900">
                  {toGMTString(promotion.startDate, GMT_OFFSET)} -{" "}
                  {toGMTString(promotion.endDate, GMT_OFFSET)} (GMT+7)
                </span>
              )}
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Base Currency:
                <span className="text-base font-medium text-gray-900">
                  {" "}
                  USD
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {performanceIsPending && (
          <div className="flex items-center justify-center h-full">
            <div className="text-lg">Loading...</div>
          </div>
        )}
        {performanceData && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <KPICard
                title="Bonus Win"
                value={formatCurrency(performanceData.bonusWin)}
                icon={Gift}
                iconColor="text-blue-500"
              />
              <KPICard
                title="Bonus Claimed"
                value={formatCurrency(performanceData.bonusClaimed)}
                icon={Wallet}
                iconColor="text-green-500"
              />
              <KPICard
                title="Claim Ratio"
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
