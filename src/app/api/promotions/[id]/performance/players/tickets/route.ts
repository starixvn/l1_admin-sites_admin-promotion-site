import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import configs from "../../../../../../../../configs";
import { createGameDisplayNameMap, mapWithDisplayNames } from "@/lib/promotion/gameDisplayName.utils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: promotionId } = await params;
    const { searchParams } = new URL(request.url);
    const gameType = searchParams.get("gameType");
    const playerPromotionId = searchParams.get("playerPromotionId");
    const currencyGroups = searchParams.get("currencyGroups");
    const playerId = searchParams.get("playerId");
    const pageIndex = searchParams.get("pageIndex");
    const pageSize = searchParams.get("pageSize");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    let apiUrl = `${configs.apiPromotionUrl}/promotion-tickets/get-promotion-tickets?promotionId=${promotionId}&playerId=${playerId}&pageIndex=${pageIndex}&pageSize=${pageSize}`;
    if (playerPromotionId) {
      apiUrl += `&playerPromotionId=${playerPromotionId}`;
    }
    const roundId = searchParams.get("roundId");
    if (roundId) {
      apiUrl += `&roundId=${roundId.trim()}`;
    }
    if (startDate) {
      apiUrl += `&startDate=${startDate}`;
    }
    if (endDate) {
      apiUrl += `&endDate=${endDate}`;
    }

    if (!promotionId || !playerId) {
      return NextResponse.json(
        { error: "promotionId and playerId are required" },
        { status: 400 }
      );
    }

    // Create game display name map using utility function
    const gameDisplayNameMap = await createGameDisplayNameMap(gameType, currencyGroups);

    const response = await axios.get(apiUrl);
    
    // Map tickets with display names using utility function
    if (response.data?.tickets) {
      response.data.tickets = mapWithDisplayNames(response.data.tickets, gameDisplayNameMap);
    }

    return NextResponse.json(response.data);
  } catch (error) {
    console.error("Error fetching promotional tickets:", error);
    return NextResponse.json(
      { error: "Failed to fetch promotional tickets" },
      { status: 500 }
    );
  }
}
