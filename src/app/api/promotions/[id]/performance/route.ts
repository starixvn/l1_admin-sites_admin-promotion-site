import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // In a real application, you would fetch this data from your database
    // For now, we'll return mock data
    const mockPerformanceData = {
      bonusIssued: 24030,
      bonusRedeemed: 15940,
      redemptionRate: 66.3,
      totalTurnover: 103410,
      uniquePlayers: 705,
      avgBonusPerPlayer: 34.09,
      avgTurnoverPerPlayer: 146.72,
      redemptionTrend: [
        { date: "Jan 15", rate: 64 },
        { date: "Jan 18", rate: 50 },
        { date: "Jan 21", rate: 67.5 },
        { date: "Jan 24", rate: 60 },
        { date: "Jan 27", rate: 66.5 }
      ],
      dailyBonus: [
        { date: "Jan 21", issued: 1250, redeemed: 800 },
        { date: "Jan 22", issued: 1100, redeemed: 700 },
        { date: "Jan 23", issued: 1300, redeemed: 900 },
        { date: "Jan 24", issued: 1150, redeemed: 750 },
        { date: "Jan 25", issued: 1200, redeemed: 750 }
      ]
    };

    return NextResponse.json(mockPerformanceData);
  } catch (error) {
    console.error("Error fetching performance data:", error);
    return NextResponse.json(
      { error: "Failed to fetch performance data" },
      { status: 500 }
    );
  }
}
