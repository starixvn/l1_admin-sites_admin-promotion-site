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
