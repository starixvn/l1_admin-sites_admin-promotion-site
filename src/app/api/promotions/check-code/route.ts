import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import configs from "../../../../../configs";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "code is required" }, { status: 400 });
  }
  console.log("code", code);
  console.log("configs.apiPromotionUrl", configs.apiPromotionUrl);
  try {
    const res = await axios.get(`${configs.apiPromotionUrl}/promotions/check-code`, {
      params: { code },
    });

    return NextResponse.json(res.data);
  } catch (error) {
    console.error("Error checking promotion code:", error);
    return NextResponse.json(
      { error: "Failed to check promotion code" },
      { status: 500 }
    );
  }
}
