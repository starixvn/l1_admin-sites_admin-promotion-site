import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import config from "@/config";
import { getAccessToken } from "@/app/api/token/route";

export async function POST(req: NextRequest) {
  try {
    console.log("Request body:", req);
    const body = await req.json();
    console.log("Request body:", body);
    //const token = await getAccessToken();

    const response = await axios.post(
      `${config.apiPromotionUrl}/promotions`,
      body
    );

    return NextResponse.json(response.data, { status: 201 });
  } catch (error: any) {
    console.error("Error in POST /api/promotions:", error); // 👈 THÊM DÒNG NÀY
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
