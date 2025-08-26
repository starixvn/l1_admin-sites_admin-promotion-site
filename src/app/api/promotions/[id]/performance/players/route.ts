import axios from "axios";
import { NextRequest, NextResponse } from "next/server";
import configs from "../../../../../../../configs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const status = searchParams.get('status');
    const player = searchParams.get('player');
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
      console.log('status', status);
      apiUrl += `&status=${status}`;
    }
    if (player && player.length > 0 && player.trim() !== '') {
      apiUrl += `&player=${encodeURIComponent(player)}`;
    }
    apiUrl += `&pageIndex=${pageIndex}&pageSize=${pageSize}`;

    const response = await axios.get(apiUrl);

    return NextResponse.json(response.data);
  } catch (error) {
    console.error("Error fetching players data:", error);
    return NextResponse.json(
      { error: "Failed to fetch players data" },
      { status: 500 }
    );
  }
}
