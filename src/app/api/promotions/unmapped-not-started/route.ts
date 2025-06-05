import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import configs from "../../../../../configs";
import { getUserFromCookie } from "@/lib/auth/cookie";

export async function POST(req: NextRequest) {
  const user = await getUserFromCookie();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const response = await axios.post(
      `${configs.apiPromotionUrl}/promotions/unmapped-not-started`
    );
    return NextResponse.json(response.data, { status: 201 });
  } catch (error) {
    console.error("Error fetching unmapped-not-started promotions:", error);
    return NextResponse.json(
      { error: "Failed to fetch unmapped-not-started promotions" },
      { status: 500 }
    );
  }
} 