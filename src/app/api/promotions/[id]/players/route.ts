import axios from "axios";
import { NextRequest, NextResponse } from "next/server";
import configs from "../../../../../../configs";
import { createGameDisplayNameMap, mapWithDisplayNames } from "@/lib/promotion/gameDisplayName.utils";
import { pipe, appendIf } from "@/lib/functional.utils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const gameType = searchParams.get("gameType");
    const currencyGroups = searchParams.get("currencyGroups");
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const status = searchParams.get('status');
    const player = searchParams.get('player');
    const gameName = searchParams.get('gameName');
    const currencies = searchParams.get('currencies');
    const gameIds = searchParams.get('gameIds');
    const pageIndex = searchParams.get('pageIndex') || '1';
    const pageSize = searchParams.get('pageSize') || '10';

    // Construct the API URL with date range parameters
    const urlParams = pipe<URLSearchParams>(
      (p) => { p.append('promotionId', id); return p; },
      appendIf(startDate, (v) => !!v, "startDate", String),
      appendIf(endDate, (v) => !!v, "endDate", String),
      appendIf(status, (v) => !!v && v !== 'All Status', "status", String),
      appendIf(player, (v) => !!v && v.length > 0 && v.trim() !== '', "player", (v) => encodeURIComponent((v as string).trim())),
      appendIf(gameName, (v) => !!v && v.length > 0 && v.trim() !== '', "gameName", (v) => encodeURIComponent((v as string).trim())),
      appendIf(currencies, (v) => !!v && v.length > 0, "currencies", String),
      appendIf(gameIds, (v) => !!v && v.length > 0, "gameIds", String),
      (p) => { p.append('pageIndex', pageIndex); return p; },
      (p) => { p.append('pageSize', pageSize); return p; }
    )(new URLSearchParams());

    const apiUrl = `${configs.apiPromotionUrl}/player-promotions/state?${urlParams.toString()}`;

    const response = await axios.get(apiUrl);
    const gameDisplayNameMap = await createGameDisplayNameMap(gameType, currencyGroups);

    if (response.data?.items) {
      response.data.items = mapWithDisplayNames(response.data.items, gameDisplayNameMap);
    }
    return NextResponse.json(response.data);
  } catch (error) {
    console.error("Error fetching players data:", error);
    return NextResponse.json(
      { error: "Failed to fetch players data" },
      { status: 500 }
    );
  }
}
