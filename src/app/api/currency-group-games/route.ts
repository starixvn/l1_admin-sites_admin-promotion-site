import { NextRequest, NextResponse } from "next/server";
import { getAccessToken } from "@/lib/auth/getAccessToken";
import axios from "axios";
import configs from "../../../../configs";
import { IGNORE_GAME_ID } from "@/constants/constants";
import { CurrencyGroupGame } from "@/types/currency-group-game";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const currencyGroupId = searchParams.get("currencyGroupId");

  if (!currencyGroupId) {
    return NextResponse.json(
      { error: "currencyGroupId is required" },
      { status: 400 }
    );
  }

  try {
    const token = await getAccessToken();

    const response = await axios.get(
      `${configs.apiBaseUrl}/currencyGroupGame/getByGroup`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          currencyGroupId,
        },
      }
    );
    const filtered = response.data.filter(
      (g: CurrencyGroupGame) => g.GameId !== IGNORE_GAME_ID
    );
    return NextResponse.json(filtered, { status: 200 });
  } catch (error) {
    console.error("Error fetching currency group games:", error);
    return NextResponse.json(
      { error: "Failed to fetch currency group games" },
      { status: 500 }
    );
  }
}
