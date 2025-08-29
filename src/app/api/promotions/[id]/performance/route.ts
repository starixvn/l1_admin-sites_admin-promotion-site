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
    const isBaseCurrency = searchParams.get('isBaseCurrency');

    let apiUrl = `${configs.apiPromotionUrl}/promotions/performance?promotionId=${id}`;
    if (isBaseCurrency) {
      apiUrl += `&isBaseCurrency=${isBaseCurrency}`;
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
