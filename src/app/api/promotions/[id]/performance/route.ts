import axios from "axios";
import { NextRequest, NextResponse } from "next/server";
import configs from "../../../../../../configs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Construct the API URL with date range parameters (UTC dates)
    let apiUrl = `${configs.apiPromotionUrl}/promotions/performance?promotionId=${id}`;
    if (startDate) {
      apiUrl += `&startDate=${startDate}`; // startDate is already in UTC format
    }
    if (endDate) {
      apiUrl += `&endDate=${endDate}`; // endDate is already in UTC format
    }
    
    const response = await axios.get(apiUrl);

    return NextResponse.json(response.data);
  } catch (error) {
    console.error("Error fetching performance data:", error);
    return NextResponse.json(
      { error: "Failed to fetch performance data" },
      { status: 500 }
    );
  }
}
