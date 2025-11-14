import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import configs from "../../../../../../configs";
import { createGameDisplayNameMap, mapWithDisplayNames } from "@/lib/promotion/gameDisplayName.utils";
import { pipe, appendIf } from "@/lib/functional.utils";

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
    const roundId = searchParams.get("roundId");

    if (!promotionId || !playerId) {
      return NextResponse.json(
        { error: "promotionId and playerId are required" },
        { status: 400 }
      );
    }

    // Build query parameters for external API
    const urlParams = pipe<URLSearchParams>(
      (p) => { p.append('promotionId', promotionId); return p; },
      (p) => { p.append('playerId', playerId); return p; },
      (p) => { p.append('pageIndex', pageIndex || ''); return p; },
      (p) => { p.append('pageSize', pageSize || ''); return p; },
      appendIf(playerPromotionId, (v) => !!v, "playerPromotionId", String),
      appendIf(roundId, (v) => !!v, "roundId", String),
      appendIf(startDate, (v) => !!v, "startDate", String),
      appendIf(endDate, (v) => !!v, "endDate", String)
    )(new URLSearchParams());

    const apiUrl = `${configs.apiPromotionUrl}/promotion-tickets/get-promotion-tickets?${urlParams.toString()}`;

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
