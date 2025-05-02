import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import configs from "../../../../../../configs";
import { getAccessToken } from "@/lib/auth/getAccessToken";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const gameType = searchParams.get("type");
    const currencyGroups = searchParams.get("currencyGroups");

    if (!gameType || !currencyGroups) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    const token = await getAccessToken();

    const response = await axios.get(
      `${configs.apiBaseUrl}/general_game_settings/games`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          type: gameType,
          currencyGroups: currencyGroups,
        },
      }
    );

    console.log("response.data", response.data);

    return NextResponse.json(response.data);
  } catch (error) {
    console.error("Error fetching games:", error);
    return NextResponse.json(
      { error: "Failed to fetch games" },
      { status: 500 }
    );
  }
}
