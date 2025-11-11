import axios from "axios";
import { NextRequest, NextResponse } from "next/server";
import configs from "../../../../../../../configs";
import { createGameDisplayNameMap, mapWithDisplayNames } from "@/lib/promotion/gameDisplayName.utils";

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
    let apiUrl = `${configs.apiPromotionUrl}/player-promotions/state?promotionId=${id}`;
    if (startDate) {
      apiUrl += `&startDate=${startDate}`;
    }
    if (endDate) {
      apiUrl += `&endDate=${endDate}`;
    }
    if (status && status !== 'All Status') {
      apiUrl += `&status=${status}`;
    }
    if (player && player.length > 0 && player.trim() !== '') {
      apiUrl += `&player=${encodeURIComponent(player.trim())}`;
    }
    if (gameName && gameName.length > 0 && gameName.trim() !== '') {
      apiUrl += `&gameName=${encodeURIComponent(gameName.trim())}`;
    }
    if (currencies && currencies.length > 0) {
      apiUrl += `&currencies=${currencies}`;
    }
    if (gameIds && gameIds.length > 0) {
      apiUrl += `&gameIds=${gameIds}`;
    }
    apiUrl += `&pageIndex=${pageIndex}&pageSize=${pageSize}`;

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
