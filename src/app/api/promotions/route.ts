import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import configs from "../../../../configs";

export async function POST(req: NextRequest) {
  try {
    console.log("Request body:", req);
    const body = await req.json();
    console.log("Request body:", body);
    //const token = await getAccessToken();

    const response = await axios.post(
      `${configs.apiPromotionUrl}/promotions`,
      body
    );

    return NextResponse.json(response.data, { status: 201 });
  } catch (error) {
    console.error("Error create promotion:", error);
    return NextResponse.json(
      { error: "Failed to create promotion" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    let status = searchParams.get('status');
    // Map FE status to BE status
    const statusMap: Record<string, string> = {
      'Upcoming': 'not_started',
      'Running': 'running',
      'Completed': 'ended',
    };
    if (status && status !== 'All') {
      status = statusMap[status] || status;
    } else {
      status = null;
    }

    const operator = searchParams.get('operator');
    const code = searchParams.get('promotionCode');

    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (operator && operator !== 'All') params.append('operatorIds', operator);
    if (code) params.append('code', code);

    console.log("params:", params.toString());

    const response = await axios.get(
      `${configs.apiPromotionUrl}/promotions?${params.toString()}`
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Error in GET /api/promotions:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


