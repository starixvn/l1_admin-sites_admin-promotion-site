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
    const body = await req.json();

    // Validate required fields
    const requiredFields = [
      "promotionId",
      "playerId",
      "operatorId",
      "siteId",
      "siteName",
      "currency",
      "currencyGroup",
      "gameTypeId",
      "adminUserId",
    ];

    const missingFields = requiredFields.filter((field) => !body[field]);
    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          missingFields,
        },
        { status: 400 }
      );
    }

    const response = await axios.post(
      `${configs.apiPromotionUrl}/bonus-wins/manual-claim-bonus-wins`,
      body
    );

    return NextResponse.json(response.data, { status: 200 });
  } catch (error) {
    console.error("Error claiming bonus:", error);
    if (error instanceof axios.AxiosError) {
      return NextResponse.json(
        {
          error: error.response?.data?.message || "Failed to claim bonus",
        },
        { status: error.response?.status || 500 }
      );
    }
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

