// src/app/api/games/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAccessToken } from "@/lib/auth/getAccessToken";
import axios from "axios";
import configs from "../../../../configs";
import { Game } from "@/types/game";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const gameType = searchParams.get("type");
  const currencyGroups = searchParams.get("currencyGroups");
  const gameIds = searchParams.get("gameIds");

  try {
    const token = await getAccessToken();
    if (gameType && currencyGroups) {
      const response = await axios.get(
        `${configs.apiBaseUrl}/general_game_settings/games`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            gameType: gameType,
            currencyGroups: currencyGroups,
            gameIds: gameIds,
          },
        }
      );

      return NextResponse.json(response.data);
    }

    const res = await axios.get(
      `${configs.apiBaseUrl}/general_game_settings/getAll`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const games = res.data;
    const filtered = gameType
      ? games.filter((g: Game) => g.Type === Number(gameType))
      : games;

    return NextResponse.json(filtered);
  } catch (error) {
    console.error("Error fetching games:", error);
    return NextResponse.json(
      { error: "Failed to fetch games" },
      { status: 500 }
    );
  }
}

